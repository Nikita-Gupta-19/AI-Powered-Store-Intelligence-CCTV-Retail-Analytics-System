from __future__ import annotations

import argparse
import shutil
from pathlib import Path

VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
TARGET_CLASSES = {"minor": "minor", "moderate": "moderate", "major": "major", "normal": "NORMAL"}


def find_split_dir(source: Path, split: str) -> Path | None:
    for p in source.rglob("*"):
        if p.is_dir() and p.name.lower() == split:
            return p
    return None


def copy_videos(src_dir: Path, dst_dir: Path) -> int:
    dst_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for file in src_dir.rglob("*"):
        if file.suffix.lower() in VIDEO_EXTS:
            target = dst_dir / file.name
            if target.exists():
                target = dst_dir / f"{file.stem}_{count}{file.suffix}"
            shutil.copy2(file, target)
            count += 1
    return count


def prepare(source: Path, output: Path) -> None:
    if not source.exists():
        raise SystemExit(f"Source not found: {source}")

    output.mkdir(parents=True, exist_ok=True)
    total = 0
    for split in ["train", "val", "test"]:
        split_dir = find_split_dir(source, split)
        if split_dir is None:
            continue
        out_split = "val" if split == "test" else split
        for class_dir in split_dir.iterdir():
            if not class_dir.is_dir():
                continue
            mapped = TARGET_CLASSES.get(class_dir.name.lower())
            if mapped is None:
                continue
            copied = copy_videos(class_dir, output / out_split / mapped)
            total += copied
            print(f"{split}/{class_dir.name} -> {out_split}/{mapped}: {copied} videos")

    for split in ["train", "val"]:
        for cls in ["NORMAL", "minor", "moderate", "major"]:
            (output / split / cls).mkdir(parents=True, exist_ok=True)
            (output / split / cls / ".gitkeep").touch(exist_ok=True)

    print(f"Done. Copied {total} videos into {output}")
    print("IMPORTANT: If NORMAL is empty, add normal traffic videos manually before training.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare Kaggle balanced crash dataset for this project")
    parser.add_argument("--source", required=True, help="Path to extracted Kaggle dataset folder")
    parser.add_argument("--output", default="dataset", help="Output dataset folder inside ai-service")
    args = parser.parse_args()
    prepare(Path(args.source), Path(args.output))
