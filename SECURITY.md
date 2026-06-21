# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in OzyAudit, please **do not** open a public GitHub issue.

Instead, please report it privately by:

1. **Email**: Contact the maintainer directly
2. **GitHub Security Advisory**: Use the "Report a security vulnerability" feature in the Security tab

### What to include:

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

### Response Timeline:

We aim to:
- Acknowledge receipt within 48 hours
- Provide an initial assessment within 7 days
- Release a fix as soon as possible

## Security Best Practices

When using OzyAudit:

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
- Use branch protection rules (required before merging)
- Require code reviews for all PRs
- Require signed commits

## Dependency Security

OzyAudit uses several external tools:

- **Semgrep** - SAST scanning
- **Trivy** - SCA and filesystem vulnerability scanning
- **ripgrep** - Fast file searching
- **git** - Version control

We regularly:
- Update dependencies via Dependabot
- Monitor security advisories
- Test compatibility with latest versions

## Secure Development Practices

1. **Code Review**: All changes require peer review
2. **Signed Commits**: Commits should be signed with GPG
3. **Testing**: Run tests before submitting PRs
4. **No Hardcoded Secrets**: Configuration should be external

## Security Features

- ✅ Local-first execution (no data sent externally unless configured)
- ✅ Deterministic and explainable scoring
- ✅ Open-source for transparency
- ✅ Dependency scanning built-in
- ✅ Code pattern scanning with Semgrep

## Contact

For security questions or concerns, please contact the maintainer privately.