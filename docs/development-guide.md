# Development Guide

## Toolchain

| Tool       | Purpose                     | Version check      |
| ---------- | --------------------------- | ------------------ |
| Node.js    | Runtime                     | `node --version`   |
| npm        | JS package manager          | `npm --version`    |
| Python     | Scripting / test automation | `python --version` |
| Git        | Version control             | `git --version`    |
| GitHub CLI | Repository / PR automation  | `gh --version`     |

## Daily workflow

1. Start dev server: `npm run dev`
2. Write tests in `tests/unit/`, run with `npm run test`
3. Lint with `npm run lint`, format with `npm run format`
4. Build: `npm run build`

## Environment setup

Copy `.env.example` to `.env` and adjust values. Do not commit `.env`.

## Branching model

- `main` is the stable, release-ready branch.
- Feature work happens on `feature/*` branches.
- Every push / PR triggers CI (`.github/workflows/ci.yml`).
