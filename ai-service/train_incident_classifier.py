from __future__ import annotations
from tqdm import tqdm

import argparse
from pathlib import Path
from typing import List, Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

from incident_classifier import INCIDENT_LABELS, MODEL_PATH, SmallVideoCNN, extract_video_tensor

VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


class IncidentVideoDataset(Dataset):
    def __init__(self, root: Path):
        self.samples: List[Tuple[Path, int]] = []
        for label_idx, label in enumerate(INCIDENT_LABELS):
            class_dir = root / label
            if not class_dir.exists():
                continue
            for p in class_dir.rglob("*"):
                if p.suffix.lower() in VIDEO_EXTS:
                    self.samples.append((p, label_idx))
        if not self.samples:
            raise RuntimeError(
                f"No videos found. Expected structure like {root}/NORMAL/video1.mp4 or {root}/major/video1.mp4"
            )

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        path, label = self.samples[idx]
        x = extract_video_tensor(str(path), frames=16, size=112)
        return x, torch.tensor(label, dtype=torch.long)


def train(data_dir: str, epochs: int, batch_size: int, lr: float):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    train_root = Path(data_dir) / "train"
    val_root = Path(data_dir) / "val"

    train_ds = IncidentVideoDataset(train_root)
    val_ds = IncidentVideoDataset(val_root) if val_root.exists() else None

    print(f"Labels: {INCIDENT_LABELS}")
    print(f"Training videos: {len(train_ds)}")
    if val_ds:
        print(f"Validation videos: {len(val_ds)}")

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0) if val_ds else None

    model = SmallVideoCNN(num_classes=len(INCIDENT_LABELS)).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        for x, y in tqdm(train_loader, desc=f"Epoch {epoch} Training"):
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits = model(x)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item()) * x.size(0)
            correct += int((logits.argmax(dim=1) == y).sum().item())
            total += x.size(0)

        msg = f"epoch={epoch} train_loss={total_loss / max(total, 1):.4f} train_acc={correct / max(total, 1):.3f}"

        if val_loader:
            model.eval()
            v_correct = 0
            v_total = 0
            with torch.no_grad():
                for x, y in tqdm(val_loader, desc=f"Epoch {epoch} Validation"):
                    x, y = x.to(device), y.to(device)
                    pred = model(x).argmax(dim=1)
                    v_correct += int((pred == y).sum().item())
                    v_total += x.size(0)
            msg += f" val_acc={v_correct / max(v_total, 1):.3f}"

        print(msg)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save({"model_state": model.state_dict(), "labels": INCIDENT_LABELS}, MODEL_PATH)
    print(f"Saved trained incident classifier to {MODEL_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train crash severity incident classifier")
    parser.add_argument("--data", default="dataset", help="Dataset root with train/val/NORMAL|minor|moderate|major/*.mp4")
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()
    train(args.data, args.epochs, args.batch_size, args.lr)
