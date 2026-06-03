import argparse
import os
import shutil
from pathlib import Path

EXCLUDED_NAMES = {
    ".next",
    "node_modules",
    ".swc",
    "lint",
    "build",
    "dist",
    "coverage",
    "tsconfig.tsbuildinfo",
}

MINIMAL_KEEP = {
    ".env",
    ".gitignore",
    "eslint.config.mjs",
    "next-env.d.ts",
    "next.config.ts",
    "package.json",
    "postcss.config.mjs",
    "public",
    "src",
    "tailwind.config.ts",
    "tsconfig.json",
}


def inspect(path: str) -> int:
    target = Path(path)
    print(f"path={target}")
    print(f"exists={target.exists()}")
    if not target.exists():
      return 0
    if target.is_file():
      print("type=file")
      return 0
    print("type=dir")
    for name in sorted(os.listdir(target)):
      print(name)
    return 0


def copy_tree(source: str, destination: str) -> int:
    src = Path(source)
    dst = Path(destination)
    if not src.exists() or not src.is_dir():
        raise SystemExit(f"Source directory does not exist: {src}")

    dst.mkdir(parents=True, exist_ok=True)
    for child in src.iterdir():
        if child.name in EXCLUDED_NAMES:
            continue
        target = dst / child.name
        if child.is_dir():
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(child, target)
        else:
            shutil.copy2(child, target)

    print(f"copied={src} -> {dst}")
    return 0


def replace_tree(source: str, destination: str) -> int:
    dst = Path(destination)
    if dst.exists():
        shutil.rmtree(dst)
    return copy_tree(source, destination)


def sync_minimal(source: str, destination: str) -> int:
    src = Path(source)
    dst = Path(destination)
    if not src.exists() or not src.is_dir():
        raise SystemExit(f"Source directory does not exist: {src}")

    dst.mkdir(parents=True, exist_ok=True)

    for child in list(dst.iterdir()):
        if child.name in {".git", ".gitignore"}:
            continue
        try:
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()
        except Exception as exc:
            print(f"skip-remove={child} reason={exc}")

    for child in src.iterdir():
        target = dst / child.name
        if child.is_dir():
            shutil.copytree(child, target, dirs_exist_ok=True)
        else:
            shutil.copy2(child, target)

    print(f"synced={src} -> {dst}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    inspect_parser = subparsers.add_parser("inspect")
    inspect_parser.add_argument("path")

    copy_parser = subparsers.add_parser("copy-tree")
    copy_parser.add_argument("source")
    copy_parser.add_argument("destination")

    replace_parser = subparsers.add_parser("replace-tree")
    replace_parser.add_argument("source")
    replace_parser.add_argument("destination")

    sync_parser = subparsers.add_parser("sync-minimal")
    sync_parser.add_argument("source")
    sync_parser.add_argument("destination")

    args = parser.parse_args()

    if args.command == "inspect":
        return inspect(args.path)
    if args.command == "copy-tree":
        return copy_tree(args.source, args.destination)
    if args.command == "replace-tree":
        return replace_tree(args.source, args.destination)
    if args.command == "sync-minimal":
        return sync_minimal(args.source, args.destination)

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
