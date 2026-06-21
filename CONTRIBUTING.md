# Contributing to OzyAudit

Thank you for your interest in contributing to OzyAudit! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Respect others' time and effort
- Report inappropriate behavior to maintainers

## How to Contribute

### 1. Report Issues

- Check if the issue already exists
- Provide a clear description
- Include steps to reproduce (for bugs)
- Share environment details (OS, Node/Bun version, etc.)

### 2. Suggest Features

- Describe the feature clearly
- Explain the use case and benefits
- Check if similar suggestions exist

### 3. Submit Pull Requests

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** with clear commits
4. **Follow code style** (TypeScript, ESLint rules)
5. **Write tests** for new functionality
6. **Update documentation** if needed
7. **Push to your fork** and open a PR

### Code Style

- Use TypeScript for all code
- Follow ESLint configuration
- Format with Prettier (if configured)
- Write meaningful commit messages

### Commit Messages

Format: `[type]: Brief description`

Examples:
- `feat: Add Trivy integration for dependency scanning`
- `fix: Resolve memory leak in report generation`
- `docs: Update installation instructions`
- `test: Add unit tests for scoring engine`

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `ci`

### Testing

Before submitting:

```bash
bun install
bun run build
bun run test
bun run lint
```

### Documentation

Update docs when:
- Adding new features
- Changing command behavior
- Adding configuration options
- Fixing documentation errors

## Development Setup

1. **Clone** the repository
2. **Install dependencies**: `bun install`
3. **Build**: `bun run build`
4. **Run**: `bun run dev`
5. **Test**: `bun run test`

## Architecture Notes

- **Commands** (`src/commands/`) - Thin CLI wrappers
- **Engine** (`src/engine/`) - Core business logic
  - `project/` - Project analysis
  - `security/` - Semgrep and Trivy integration
  - `report/` - Report generation
  - `pipeline/` - Orchestration
  - `score/` - Deterministic scoring
- **Tests** - Collocated with source code

## Pull Request Process

1. Ensure CI checks pass
2. Include description of changes
3. Reference related issues (e.g., `Fixes #123`)
4. Request review from maintainers
5. Address feedback and iterate

## Licensing

By contributing, you agree that your code will be licensed under the MIT License.

## Questions?

- Open a GitHub Discussion for questions
- Check existing Issues for similar topics
- Review the README for quick answers

Thank you for contributing! 🙏