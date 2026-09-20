# Security Policy

## Supported version

The production site is built from the repository's `main` branch. Security fixes should target the current production baseline rather than unsupported historical branches.

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials, private data, or other sensitive security information.

Use GitHub's private vulnerability reporting / Security Advisory channel for this repository when available. If that channel is unavailable, contact the site operator through a verified private channel before disclosing technical details publicly.

## Dependency policy

- Production dependencies are pinned in `package.json` and `package-lock.json`.
- CI installs with `npm ci`.
- CI fails on npm audit findings at **high** or **critical** severity.
- Dependabot checks npm and GitHub Actions dependencies weekly.
- Major dependency upgrades must pass the normal PR, CI, build, and production deployment gates.

## Secrets

No production credentials, API keys, access tokens, or private keys may be committed to the repository. GitHub Actions secrets and environment protection should be used for future secret-bearing integrations.
