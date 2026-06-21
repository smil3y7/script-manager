#!/usr/bin/env python3
"""
Autodoc generator - skenira projekt in zgenerira osnovno dokumentacijo
(drevo datotek, odvisnosti, arhitektura, stanje projekta).

Uporaba:
    python3 generate.py [pot_do_projekta]

    pot_do_projekta - privzeto je trenutna mapa (".")

OPOMBA O DASHBOARDU: skripta rekurzivno bere datotečni sistem in piše izhod
v podmapo docgen_output/ poleg skeniranega projekta. Na serverless okolju
(Vercel) nima dostopa do tvojega lokalnega projekta na disku - smiselna je
za lokalni zagon nad mapo, ki jo dejansko želiš dokumentirati.
"""

import sys
from pathlib import Path
from collections import defaultdict
import re

IGNORE_DIRS = {
    ".git", "__pycache__", "venv", "node_modules", ".idea", ".pytest_cache"
}

PY_IMPORT = re.compile(r"^\s*(import|from)\s+([a-zA-Z0-9_\.]+)")
JS_IMPORT = re.compile(r"import\s+.*from\s+['\"](.+)['\"]")


def scan_files(root: Path):
    files = []
    for path in root.rglob("*"):
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if path.is_file():
            files.append(path)
    return files


def detect_stack(files):
    stacks = []
    file_names = [f.name for f in files]

    if "requirements.txt" in file_names:
        stacks.append("Python (pip)")
    if "package.json" in file_names:
        stacks.append("Node.js")
    if "pom.xml" in file_names:
        stacks.append("Java (Maven)")
    if "Cargo.toml" in file_names:
        stacks.append("Rust")
    if "composer.json" in file_names:
        stacks.append("PHP")

    if not stacks:
        stacks.append("Unknown / Mixed")

    return stacks


def analyze_dependencies(files):
    deps = defaultdict(set)

    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue

        for line in content.splitlines():
            m = PY_IMPORT.match(line)
            if m:
                deps[str(f)].add(m.group(2))

            m2 = JS_IMPORT.search(line)
            if m2:
                deps[str(f)].add(m2.group(1))

    return deps


def save_tree(files, output_dir: Path, root: Path):
    lines = ["# PROJECT TREE\n"]
    for f in sorted(files):
        lines.append(str(f.relative_to(root)))
    (output_dir / "PROJECT_TREE.md").write_text("\n".join(lines), encoding="utf-8")


def save_dependencies(deps, output_dir: Path):
    lines = ["# DEPENDENCIES\n"]
    for file, d in deps.items():
        lines.append(f"## {file}")
        for dep in sorted(d):
            lines.append(f"- {dep}")
        lines.append("")
    (output_dir / "DEPENDENCIES.md").write_text("\n".join(lines), encoding="utf-8")


def build_architecture(files, deps, stack, output_dir: Path, root: Path):
    modules = defaultdict(list)
    for f in files:
        parts = f.relative_to(root).parts
        if len(parts) > 1:
            modules[parts[0]].append(str(f.relative_to(root)))

    lines = ["# ARCHITECTURE\n", "## Detected stack:"]
    lines += [f"- {s}" for s in stack]
    lines.append("\n## Modules:\n")

    for mod, fs in modules.items():
        lines.append(f"### {mod}")
        lines += [f"- {f}" for f in fs[:20]]
        lines.append("")

    lines.append("\n## High-level dependency hints:\n")
    for file, d in list(deps.items())[:30]:
        lines.append(f"- {file} → {', '.join(list(d)[:5])}")

    (output_dir / "ARCHITECTURE.md").write_text("\n".join(lines), encoding="utf-8")


def build_project_state(files, stack, output_dir: Path, root: Path):
    lines = ["# PROJECT STATE\n", "## Technology stack:"]
    lines += [f"- {s}" for s in stack]

    lines.append("\n## File count:")
    lines.append(f"- {len(files)} files")

    lines.append("\n## Main directories:")
    dirs = set(f.relative_to(root).parts[0] for f in files if len(f.relative_to(root).parts) > 1)
    lines += [f"- {d}/" for d in sorted(dirs)]

    (output_dir / "PROJECT_STATE.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    output_dir = root / "docgen_output"
    output_dir.mkdir(exist_ok=True)

    print(f"Scanning project at {root.resolve()} ...")
    files = scan_files(root)
    print(f"Files found: {len(files)}")

    print("Detecting stack...")
    stack = detect_stack(files)

    print("Analyzing dependencies...")
    deps = analyze_dependencies(files)

    print("Generating outputs...")
    save_tree(files, output_dir, root)
    save_dependencies(deps, output_dir)
    build_architecture(files, deps, stack, output_dir, root)
    build_project_state(files, stack, output_dir, root)

    print(f"Done. Output in {output_dir}")


if __name__ == "__main__":
    main()
