"""Basic smoke tests for the Python tooling stack (secondary stack)."""

from __future__ import annotations

import shutil
import subprocess


def test_required_tools_are_resolvable() -> None:
    required = ["git", "node", "npm", "gh"]
    for tool in required:
        assert shutil.which(tool) is not None, f"{tool} is not on PATH"


def test_tools_report_a_version() -> None:
    pairs = [("git", "git version"), ("node", "v"), ("gh", "gh version")]
    for tool, prefix in pairs:
        out = subprocess.run(
            [tool, "--version"], capture_output=True, text=True, timeout=30, check=False
        )
        assert out.returncode == 0
        assert out.stdout.startswith(prefix)