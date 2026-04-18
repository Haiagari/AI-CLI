# ▲ OzyAudit

> **Local-first audit platform for software projects.**
> Scan. Score. Explain. Ship with confidence.

```
  ▲ OzyAudit  v0.2.0

  ✔ Project detected — node · 47 files · tests ✅ · CI ✅   (1.2s)
  ✔ SAST completed — 0 high · 1 medium · 2 low              (3.4s)
  ✔ SCA completed — 0 critical · 2 medium · 0 low           (2.1s)
  ✔ Report saved → reports/audit-2025-04-18_10-30.md        (0.3s)

  ┌──────────────────────────────────────────┐
  │  Score    91 / 100       Grade  A        │
  │  Status   ✅  PASS                       │
  ├──────────────────────────────────────────┤
  │  Project  node                           │
  │  Tests    ✅  present                    │
  │  CI       ✅  present                    │
  │  Docker   ✅  present                    │
  ├──────────────────────────────────────────┤
  │  High     0              —               │
  │  Medium   3              -6 pts          │
  │  Low      2              —               │
  └──────────────────────────────────────────┘

  ✦ Next steps:
    → Update follow-redirects to 1.16.0 (CVE fix available)
    → Review medium finding in src/auth/middleware.ts:88

  ◇ Full report → reports/audit-2025-04-18_10-30.md
```

---

## What is OzyAudit?

OzyAudit is a **local-first CLI audit platform** that inspects your codebase, runs security scans, and produces an explainable health score — no cloud, no black box, no surprises.

It runs entirely on your machine. Every penalty is traceable. Every score is reproducible. And it fits naturally into both your terminal workflow and your CI/CD pipeline.

---

## Why OzyAudit?

Most audit tools give you a number. OzyAudit tells you **why** the number is what it is — and exactly what to do about it.

| Other tools | OzyAudit |
|---|---|
| Cloud-dependent | Runs 100% locally |
| Opaque scoring | Every penalty is named and documented |
| Static rules | Configurable via `.auditrc` |
| CI-hostile output | Native `--ci` mode with clean JSON + exit codes |
| Generic reports | Markdown reports optimized for GitHub/GitLab rendering |

---

## Features

### Project Analysis
Detects project type, package manager, key structural files, and validates your setup before scanning anything.

```
/analyze-project
```

Inspects: project type · package manager · test coverage · CI config · Docker setup · environment docs

### Security Scanning

Two engines, zero black boxes.

```
/scan-security
```

**SAST via Semgrep** — scans code patterns, secret exposure, injection risks, and security anti-patterns in your source files.

**SCA via Trivy** — scans your dependency tree for known CVEs, outdated packages, and vulnerable lockfiles.

Both engines degrade gracefully — if a tool isn't installed, the scan is skipped cleanly with a clear message rather than crashing.

### Explainable Scoring

The score isn't magic. It's math you can read.

```
Base score:   100
High (×1):    -20
Medium (×3):   -6  (configured: 2 pts each via .auditrc)
Missing CI:    -8
──────────────────
Final score:   66 / 100 → WARN
```

Every penalty has a reason, a label, and a point value. No surprises, no mystery.

### Professional Reports

```
/generate-report
```

Generates two artifacts every run:

- `audit-report-YYYY-MM-DD_HH-MM-SS.md` — rendered beautifully on GitHub/GitLab with badges, collapsible findings, and a score breakdown table
- `audit-report-YYYY-MM-DD_HH-MM-SS.json` — machine-readable output for dashboards, custom tooling, or downstream automation

Reports are stored in `reports/` and never overwritten.

### Full Pipeline

```
/run-pipeline
```

Runs everything in sequence: analysis → SAST → SCA → report → score. One command, full picture.

---

## CI/CD Integration

OzyAudit speaks CI natively.

```bash
# In your GitHub Actions or GitLab CI:
ozyaudit run-pipeline --ci
```

In `--ci` mode:
- All UI animations and color output are disabled
- The full result is printed as clean JSON to `stdout`
- Logs and warnings go to `stderr` — no contamination
- The process exits with a meaningful code:

| Status | Exit code |
|--------|-----------|
| PASS   | `0`       |
| WARN   | `1`       |
| FAIL   | `2`       |

```yaml
# .github/workflows/audit.yml
- name: OzyAudit
  run: ozyaudit run-pipeline --ci
  # Pipeline fails automatically if score < thresholds
```

---

## Configurable Scoring — `.auditrc`

Drop a `.auditrc` file in your project root to tune the scoring engine for your team's standards.

```json
{
  "thresholds": {
    "pass": 80,
    "warn": 50
  },
  "penalties": {
    "critical": 40,
    "high": 20,
    "medium": 8,
    "low": 3,
    "missing_tests": 10,
    "missing_ci": 8,
    "missing_gitignore": 10,
    "missing_env_example": 3
  },
  "ignore": {
    "packages": ["some-legacy-dep"],
    "rules": ["rule-id-under-review"],
    "severities": []
  }
}
```

All fields are optional. Missing fields fall back to defaults. The schema is validated with Zod on every run — if your `.auditrc` has an invalid field, OzyAudit tells you exactly which one and continues with sane defaults.

> **Note:** `.auditrc` is intentionally `.gitignore`'d. Each project or team keeps their own. Copy `.auditrc.example` to get started.

---

## Architecture

OzyAudit is organized around a strict separation between commands, engines, and UI. Nothing in `engine/` knows the UI exists. Nothing in `ui/` knows how scores are calculated.

```
src/
  commands/           # thin entry points — one file per command
  engine/
    config/           # .auditrc loading and validation (Zod)
    project/          # structural analysis
    security/         # Semgrep + Trivy integration
    report/           # Markdown + JSON report generation
    pipeline/         # orchestration and contracts
    score/            # deterministic scoring engine
  ui/
    components/       # StepRow, SummaryTable (Ink-native)
    PipelineRunner    # React orchestrator — drives the live UI
    theme             # design tokens (respects dark/light mode)
```

**Design principles:**

- **Thin commands.** Commands call engines. They don't contain logic.
- **Reusable engines.** Each engine can be called independently or composed.
- **Deterministic outputs.** Same input → same score, always.
- **Graceful degradation.** Missing tools produce `skipped` steps, not crashes.
- **Local-first.** Nothing phones home. No telemetry. No accounts.

---

## Requirements

**Core:**

- [Bun](https://bun.sh) — runtime and package manager
- Node.js — required by some internal dependencies
- `ripgrep` — fast file search used by the analysis engine
- `git` — for repository context

**Security scanning (optional but strongly recommended):**

- [Semgrep](https://semgrep.dev/docs/getting-started/) — SAST engine
- [Trivy](https://aquasecurity.github.io/trivy/latest/getting-started/installation/) — SCA engine

If either tool is missing, OzyAudit logs a clean warning and continues. You get a partial score instead of a crash.

---

## Installation

```bash
# Install dependencies
bun install

# Build
bun run build

# Run
bun run dev
```

---

## Development

```bash
bun run build     # compile to dist/cli.mjs
bun run dev       # run in watch mode
```

```bash
# Quick smoke test (CI mode — no UI, pure JSON output)
node dist/cli.mjs -p "/run-pipeline --ci" | jq .score
```

---

## Roadmap

OzyAudit is actively developed. What's coming:

| Version | Focus |
|---|---|
| **v0.2.0** | ✅ Ink-native UI · live spinners · CI mode · `.auditrc` scoring |
| **v0.3.0** | Report badges · collapsible findings · GitHub-optimized Markdown |
| **v0.3.1** | YAML support for `.auditrc` |
| **v0.4.0** | `ozyaudit init` — interactive setup wizard |
| **v0.5.0** | Severity filters · per-file ignore rules |

---

## License

MIT — do whatever you want with it.

---

<p align="center">
  Built local-first. Scored deterministically. No black boxes.
</p>
