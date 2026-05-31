from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import torch
import torch.nn as nn

# These labels match the recommended Kaggle balanced crash dataset setup.
# Put videos in: dataset/train/NORMAL, dataset/train/minor, dataset/train/moderate, dataset/train/major
INCIDENT_LABELS = ["NORMAL", "minor", "moderate", "major"]
MODEL_PATH = Path(__file__).resolve().parent / "models" / "incident_classifier.pt"
VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

_MODEL: Optional[nn.Module] = None
_MODEL_LABELS: List[str] = INCIDENT_LABELS
_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


class SmallVideoCNN(nn.Module):
    """Lightweight local video classifier.

    Input: B x T x C x H x W
    Output: class logits.
    """

    def __init__(self, num_classes: int = len(INCIDENT_LABELS)):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv3d(3, 16, kernel_size=(3, 5, 5), stride=(1, 2, 2), padding=(1, 2, 2)),
            nn.BatchNorm3d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool3d((1, 2, 2)),
            nn.Conv3d(16, 32, kernel_size=3, stride=(1, 2, 2), padding=1),
            nn.BatchNorm3d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool3d((2, 2, 2)),
            nn.Conv3d(32, 64, kernel_size=3, stride=(1, 2, 2), padding=1),
            nn.BatchNorm3d(64),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool3d((1, 1, 1)),
        )
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x.permute(0, 2, 1, 3, 4)  # B,T,C,H,W -> B,C,T,H,W
        x = self.features(x).flatten(1)
        return self.classifier(x)


def _read_frame_at(cap: cv2.VideoCapture, frame_index: int, size: int, last: Optional[np.ndarray]) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(max(0, frame_index)))
    ok, frame = cap.read()
    if not ok:
        frame = last if last is not None else np.zeros((size, size, 3), dtype=np.uint8)
    last = frame
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = cv2.resize(frame, (size, size))
    frame = frame.astype(np.float32) / 255.0
    return frame, last


def extract_video_tensor(video_path: str, frames: int = 16, size: int = 112, start_sec: float = 0.0, duration_sec: Optional[float] = None) -> torch.Tensor:
    """Extract a fixed-size tensor from full video or a time window."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    start_frame = int(start_sec * fps)
    if duration_sec is None:
        end_frame = max(total - 1, start_frame)
    else:
        end_frame = min(max(total - 1, start_frame), int((start_sec + duration_sec) * fps))

    if total <= 0 or end_frame <= start_frame:
        indices = [start_frame] * frames
    else:
        indices = np.linspace(start_frame, end_frame, frames).astype(int).tolist()

    images: List[np.ndarray] = []
    last: Optional[np.ndarray] = None
    for idx in indices:
        frame, last = _read_frame_at(cap, idx, size, last)
        images.append(frame)
    cap.release()

    arr = np.stack(images, axis=0)  # T,H,W,C
    arr = np.transpose(arr, (0, 3, 1, 2))  # T,C,H,W
    return torch.from_numpy(arr)


def load_incident_model() -> Optional[nn.Module]:
    global _MODEL, _MODEL_LABELS
    if _MODEL is not None:
        return _MODEL
    if not MODEL_PATH.exists():
        return None
    checkpoint = torch.load(MODEL_PATH, map_location=_DEVICE)
    _MODEL_LABELS = list(checkpoint.get("labels", INCIDENT_LABELS))
    model = SmallVideoCNN(num_classes=len(_MODEL_LABELS))
    model.load_state_dict(checkpoint["model_state"])
    model.to(_DEVICE)
    model.eval()
    _MODEL = model
    return _MODEL


def _severity_from_label(label: str) -> str:
    normalized = label.lower()
    if normalized == "major":
        return "CRITICAL"
    if normalized == "moderate":
        return "HIGH"
    if normalized == "minor":
        return "MEDIUM"
    return "LOW"


def _explanation_from_label(label: str, timestamp: str, confidence: float) -> str:
    normalized = label.lower()
    pct = int(confidence * 100)
    if normalized == "major":
        return f"A major crash pattern was detected around {timestamp}. The model observed high-impact visual motion/features consistent with severe collision footage. Confidence: {pct}%."
    if normalized == "moderate":
        return f"A moderate incident pattern was detected around {timestamp}. The video shows visual features consistent with a significant vehicle collision or dangerous impact. Confidence: {pct}%."
    if normalized == "minor":
        return f"A minor incident pattern was detected around {timestamp}. The model found collision-like visual evidence, but impact severity appears limited. Confidence: {pct}%."
    return f"No clear crash incident was detected. The uploaded media appears closer to normal driving/traffic footage. Confidence: {pct}%."


def _stamp(seconds: float) -> str:
    seconds = max(0, int(seconds))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def predict_video_windows(video_path: str, window_sec: float = 3.0, stride_sec: float = 1.5) -> Optional[Dict[str, Any]]:
    """Run the trained classifier on sliding windows to estimate incident timestamp."""
    model = load_incident_model()
    if model is None:
        return None

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = total_frames / fps if total_frames else window_sec
    cap.release()

    starts = np.arange(0, max(duration - window_sec, 0.1), stride_sec).tolist()
    if not starts:
        starts = [0.0]

    window_results: List[Dict[str, Any]] = []
    best: Optional[Tuple[str, float, float]] = None

    with torch.no_grad():
        for start in starts:
            tensor = extract_video_tensor(video_path, start_sec=float(start), duration_sec=window_sec).unsqueeze(0).to(_DEVICE)
            probs = torch.softmax(model(tensor), dim=1)[0]
            conf, idx = torch.max(probs, dim=0)
            label = _MODEL_LABELS[int(idx)]
            score = float(conf)
            window_results.append({"time": _stamp(start), "label": label, "confidence": round(score, 3)})

            # Prefer the highest-confidence non-normal class; fall back to NORMAL if no incident is found.
            if label.lower() != "normal":
                if best is None or score > best[1]:
                    best = (label, score, float(start))
            elif best is None:
                best = (label, score, float(start))

    if best is None:
        return None

    label, confidence, start = best
    severity = _severity_from_label(label)
    timestamp = _stamp(start)
    incident_detected = label.lower() != "normal"
    return {
        "incidentType": "ACCIDENT" if incident_detected else "NORMAL",
        "severity": severity,
        "severityLabel": label,
        "timestamp": timestamp,
        "confidence": round(confidence, 3),
        "source": "dataset_trained_crash_severity_classifier",
        "reason": _explanation_from_label(label, timestamp, confidence),
        "windows": window_results[:20],
    }


def predict_with_dataset_model(media_paths: List[str]) -> Optional[Dict[str, Any]]:
    video_paths = [p for p in media_paths if Path(p).suffix.lower() in VIDEO_EXTS and Path(p).exists()]
    if not video_paths:
        return None

    predictions: List[Dict[str, Any]] = []
    for p in video_paths:
        pred = predict_video_windows(p)
        if pred:
            pred["file"] = Path(p).name
            predictions.append(pred)

    if not predictions:
        return None

    # Highest severity first, then confidence.
    rank = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
    return max(predictions, key=lambda x: (rank.get(x.get("severity", "LOW"), 0), x.get("confidence", 0)))


def heuristic_incident_from_yolo(vehicles: List[Dict[str, Any]], timeline: List[Dict[str, Any]], category: str) -> Dict[str, Any]:
    """Fallback if no trained dataset model is available yet."""
    vehicle_count = len(vehicles)
    severity = "HIGH" if category in {"HIT_AND_RUN", "ROAD_RAGE"} else "MEDIUM"
    if vehicle_count >= 4:
        severity = "HIGH"
    return {
        "incidentType": category or "SUSPICIOUS_ACTIVITY",
        "severity": severity,
        "severityLabel": severity.lower(),
        "timestamp": timeline[0]["time"] if timeline else "00:00",
        "confidence": 0.55,
        "source": "rule_based_yolo_fallback",
        "reason": "No trained crash severity model was found yet. This fallback uses complaint category and YOLO vehicle observations. Train the model with dataset/train videos for real dataset-based incident analysis.",
        "windows": [],
    }
