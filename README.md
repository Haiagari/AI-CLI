# ▲ OzyAudit

**Local-first technical audit system.** 
Inspect projects, run security scans, and generate explainable engineering scores.

---

## ✦ Overview

OzyAudit is a professional CLI designed to provide immediate feedback on project health. It automates structural analysis, security scanning (SAST/SCA), and reporting into a single, deterministic pipeline.

- **Project Analysis**: Automatic detection of stack, tests, CI, and Docker structure.
- **Security Scanning**: Integrated SAST with **Semgrep** and SCA with **Trivy**.
- **Modern UI**: High-feedback Ink-native interface with real-time step tracking.
- **Deterministic Scoring**: Transparent rules with no black-box logic.
- **CI/CD Ready**: Native JSON output and standardized exit codes for automation.

---

## 🚀 Quick Start

### Installation

```bash
bun install
```

*Ensure you have `semgrep` and `trivy` installed in your path for full security scanning capabilities.*

### Usage

Run the full audit pipeline on your current directory:

```bash
/run-pipeline
```

---

## ⚙️ Configuration (`.auditrc`)

OzyAudit is highly configurable via an `.auditrc` JSON file in your project root.

```json
{
  "thresholds": {
    "pass": 85,
    "warn": 65
  },
  "penalties": {
    "medium": 5,
    "missing_ci": 10
  },
  "ignore": {
    "packages": ["hono"],
    "rules": ["hardcoded-secret"]
  }
}
```

- **Thresholds**: Define custom score limits for PASS/WARN status.
- **Penalties**: Calibrate how much each finding severity or structural gap impacts the score.
- **Ignore**: Skip specific packages, security rules, or entire severity levels.

---

## 🤖 CI/CD Integration

OzyAudit is designed to fail your pipeline if the score doesn't meet your standards.

```bash
# Clean JSON output for automation
/run-pipeline --ci
```

**Exit Codes:**
- `0`: PASS
- `1`: WARN
- `2`: FAIL

---

## 🏗️ Architecture

Modular design with decoupled engines and a headless-ready UI.

```text
src/
├── engine/         # Pure logic: Project, Security, Report, Score
├── ui/             # Ink-native React components
└── commands/       # CLI command entrypoints
```

---

## 🛠️ Development

```bash
bun run build  # Compile and bundle
bun run dev    # Build and start interactive session
```

---

## 📄 License

MIT · Open source and local-first.
