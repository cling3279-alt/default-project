#! /usr/bin/env python3
"""Environment smoke test: verifies the tools needed for this project."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys

REQUIRED = ["git", "node", "npm", "python", "gh"]


def resolve(tool: str) -> str | None:
    """Resolve a tool to an executable name, handling Windows .cmd shims."""
    for name in (f"{tool}.cmd", f"{tool}.exe", tool):
        if shutil.which(name):
            return name
    return None


def main() -> int:
    failures = []
    results: dict[str, str] = {}

    for tool in REQUIRED:
        exe = resolve(tool)
        if exe is None:
            failures.append(tool)
            results[tool] = "MISSING"
            continue
        try:
            out = subprocess.run(
                [exe, "--version"], capture_output=True, text=True, timeout=30, check=False
            )
            results[tool] = out.stdout.strip().splitlines()[0] if out.stdout else "?"
        except Exception as exc:  # noqa: BLE001 - intentionally catch any tool failure
            failures.append(tool)
            results[tool] = f"ERROR: {exc}"

    payload = {"tools": results, "failures": failures}
    print(json.dumps(payload, indent=2, ensure_ascii=False))

    if failures:
        print(f"FAILED: {', '.join(failures)}", file=sys.stderr)
        return 1

    print("OK: all required tools are available.")
    return 0


if __name__ == "__main__":
    sys.exit(main())