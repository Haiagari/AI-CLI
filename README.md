# ▲ OpenClaude

> **Claude Code opened to any LLM — OpenAI, Gemini, DeepSeek, Ollama, and more.**
> Same CLI. Your choice of provider.

```
  ▲ OpenClaude  v0.4.0

  Welcome! Choose a provider to get started:

    ● Anthropic  (Claude Sonnet, Opus)
    ○ OpenAI     (GPT-4o, o3, Codex)
    ○ Gemini     (Gemini 2.5 Pro, Flash)
    ○ Ollama     (local models — qwen2.5-coder, llama3.2)
    ○ DeepSeek   (DeepSeek-V3, DeepSeek-R1)
    ○ GitHub     (via Copilot API)
    ○ Bedrock    (AWS)
    ○ Vertex     (GCP)
    ○ NVIDIA NIM, MiniMax, Mistral

  Run: bun run dev:profile    → interactive setup wizard
       bun run dev:ollama     → quick start with local Ollama
       bun run dev:openai     → quick start with OpenAI
```

---

## What is OpenClaude?

OpenClaude is a **fork of Claude Code that adds multi-provider support**. It keeps the same interactive terminal UI, tool system, and agent architecture — but routes API calls to the provider you choose instead of being locked to Anthropic.

The base codebase is derived from Anthropic's Claude Code (proprietary). Modifications and additions by OpenClaude contributors are offered under the MIT License where legally permissible.

---

## Why OpenClaude?

| Claude Code (original) | OpenClaude |
|---|---|
| Anthropic API only | 10+ providers natively supported |
| Single provider | Switch providers anytime via profiles |
| — | Run local models for free with Ollama |
| — | Any OpenAI-compatible endpoint works |

---

## Features

### Multi-Provider Support

Connect to LLMs through a unified interface. Providers are selected via environment variables or interactive profiles:

- **Anthropic** — Claude Sonnet, Opus, custom endpoints
- **OpenAI** — GPT-4o, o3, Codex (with separate auth flow)
- **Google Gemini** — Gemini 2.5 Pro, Flash
- **Ollama** — any local model (qwen2.5-coder, llama3.2, etc.)
- **DeepSeek** — DeepSeek-V3, DeepSeek-R1
- **GitHub Copilot** — via Copilot API (GPT-4o and others)
- **AWS Bedrock** and **GCP Vertex** — enterprise cloud providers
- **NVIDIA NIM**, **MiniMax**, **Mistral** — additional providers
- **Any OpenAI-compatible endpoint** — DashScope, OpenRouter, Groq, Fireworks, LM Studio, etc.

```bash
bun run dev:profile    # interactive provider selection
bun run dev:ollama     # quick start with local Ollama
bun run dev:openai     # quick start with OpenAI
bun run dev:gemini     # quick start with Gemini
bun run dev:codex      # quick start with OpenAI Codex
```

### Provider Profiles

Save and switch between provider configurations stored in `.openclaude-profile.json`:

```bash
bun run profile:init      # create a new profile
bun run profile:auto      # auto-recommend best provider for your system
bun run profile:fast      # lightweight profile (llama3.2:3b via Ollama)
bun run profile:code      # code-specialized profile (qwen2.5-coder:7b)
```

### Claude Code Feature Set

Inherits the core Claude Code experience:

- **Interactive TUI** — React/Ink-based terminal interface with live output
- **Tool system** — Bash, Read, Write, Edit, Glob, Grep, and more
- **MCP server support** — connect to external Model Context Protocol servers
- **Skills & Plugins** — extensible skill system with bundled and custom skills
- **Session management** — resume conversations, session history
- **Git integration** — branch awareness, worktree support
- **Permission system** — granular tool permissions, auto-mode controls
- **gRPC server** — headless mode for external agent integration (port 50051)
- **Coordinator mode** — multi-agent orchestration

### VS Code Extension

A companion VS Code extension provides a chat interface. See `vscode-extension/openclaude-vscode/`.

### Docker

```bash
docker build -t openclaude .
docker run -it openclaude
```

Images are published to GHCR on release.

---

## Architecture

OpenClaude adds a provider abstraction layer on top of the Claude Code codebase:

```
src/
  services/api/          # Provider adapters (~3800 lines of provider code)
    client.ts            # Main API client (Anthropic SDK + routing)
    claude.ts            # Anthropic direct adapter
    openaiShim.ts        # OpenAI-compatible shim (1862 lines)
    providerConfig.ts    # Credential resolution (805 lines)
    codexShim.ts         # OpenAI Codex transport
  utils/
    providerProfile.ts   # Profile save/load (934 lines)
    providerDiscovery.ts # Auto-detect local providers
    providerValidation.ts
    model/
      providers.ts       # Provider routing by env vars
  grpc/
    server.ts            # gRPC server for external agents
  vscode-extension/      # VS Code chat extension
  tools/                 # Tool definitions
  skills/                # Skill system
  services/mcp/          # MCP client/server
  coordinator/           # Multi-agent orchestration
  ui/                    # Ink/React terminal UI
  commands/              # CLI subcommands
```

**How provider routing works:**

Environment variables control which provider is active:
- `CLAUDE_CODE_USE_OPENAI=1` → OpenAI / Codex / any OpenAI-compatible
- `CLAUDE_CODE_USE_GEMINI=1` → Google Gemini
- `CLAUDE_CODE_USE_GITHUB=1` → GitHub Copilot API
- `CLAUDE_CODE_USE_BEDROCK=1` → AWS Bedrock
- `CLAUDE_CODE_USE_VERTEX=1` → GCP Vertex
- `CLAUDE_CODE_USE_MISTRAL=1` → Mistral
- `NVIDIA_NIM=1` → NVIDIA NIM
- `MINIMAX_API_KEY` set → MiniMax
- None set → Anthropic (default)

The `openaiShim.ts` translates Anthropic SDK calls into OpenAI-compatible HTTP requests, so the rest of the codebase doesn't need to know which provider is running.

---

## Requirements

**Core:**

- [Bun](https://bun.sh) — runtime and package manager
- Node.js >= 20.0.0

**Provider-specific:**

- **Ollama** — for local model inference
- **API keys** — for cloud providers (set via profiles or env vars)

**Optional:**

- `ripgrep` — fast file search
- `git` — repository context
- Docker — containerized execution

---

## Installation

```bash
# Install dependencies
bun install

# Build
bun run build

# Run interactive session
bun run dev

# Run with a specific provider
bun run dev:ollama
bun run dev:openai
bun run dev:gemini
```

### Quick Start

```bash
# 1. Install and build
bun install && bun run build

# 2. Auto-recommend and configure a provider
bun run profile:auto

# 3. Launch
bun run dev
```

---

## Development

```bash
bun run build          # compile to dist/cli.mjs
bun run dev            # run in watch mode
bun run dev:profile    # interactive provider launcher
bun run typecheck      # TypeScript type checking
bun test               # run test suite
bun run test:coverage  # run with coverage report
```

### Smoke Test

```bash
bun run build && node dist/cli.mjs --version
```

### Verify No Phone-Home

```bash
bun run verify:privacy
```

---

## License

Derived from Anthropic's Claude Code (proprietary). Modifications by OpenClaude contributors are offered under the MIT License where legally permissible. See LICENSE file.

---

<p align="center">
  Built on Claude Code. Open to every provider.
</p>
