# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in OpenClaude, please **do not** open a public GitHub issue.

Please report it privately using GitHub's **Report a security vulnerability** feature in the repository's Security tab.

### What to include:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

## Security Best Practices

When using OpenClaude:

### Credentials & Secrets

- **Never commit credentials** to the repository
- Use `.env` files (listed in `.gitignore`)
- Use environment variables for sensitive data
- Rotate API keys and tokens regularly
- Use GitHub Secrets for CI/CD pipelines

### Scanning Tools

- Keep **Semgrep** and **Trivy** updated regularly
- Review scan results carefully before ignoring findings
- Do not disable security checks in production

### Access Control

- Limit repository access to trusted collaborators
## Dependency Security

OpenClaude can use several external tools:

- **Semgrep** - SAST scanning
- **Trivy** - SCA and filesystem vulnerability scanning
- **ripgrep** - Fast file searching
- **git** - Version control

## Secure Development Practices

1. **Code Review**: Changes should receive peer review
2. **Testing**: Run tests before submitting PRs
3. **No Hardcoded Secrets**: Configuration should be external

## Security Considerations

- OpenClaude includes a privacy verification command: `bun run verify:privacy`.
- The optional security pipeline uses Semgrep for code scanning and Trivy for dependency and filesystem scanning when those tools are installed.
- Review scanner results and configuration before relying on them for a particular project.
