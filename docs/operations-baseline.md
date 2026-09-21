# Security & Operations Baseline

## Build and dependency controls

1. Node runtime: Node.js 22 in CI and deployment.
2. Package manager: npm 10+, with a committed lockfile.
3. Installation: `npm ci` only in automated workflows.
4. Dependency audit: `npm audit --audit-level=high` blocks CI and Pages deployment on high/critical findings.
5. Automated updates: Dependabot runs weekly for npm and GitHub Actions.
6. Framework security floor: Astro is pinned to a release newer than the patched 7.2.8 security floor for the 2026 AVIF image-processing advisory.

## GitHub Actions controls

- CI permissions default to `contents: read`.
- Pages deploy receives only `contents: read`, `actions: read`, `pages: write`, and `id-token: write`.
- CI cancels superseded runs on the same ref.
- Jobs have explicit timeouts.
- Current checkout/setup-node actions run on the modern Node 24 action runtime while the project itself remains on Node.js 22.

## Release gate

A change is production-ready only when:

- PR CI is green.
- Dependency audit has no high/critical finding.
- Astro type/build checks are green.
- Static routes and sitemap are generated.
- Change is merged to `main`.
- Pages build and deploy jobs are green.
- For changes affecting navigation, SEO, or publishing, the generated Pages artifact is inspected or a public smoke test is completed.

## Rollback

For a production regression:

1. Identify the last known-good `main` commit.
2. Revert the offending merge with a new PR; do not rewrite `main` history.
3. Require CI Green on the revert.
4. Merge and allow Pages to redeploy.
5. Verify the production artifact / public site.
6. Follow up with a corrective PR and document the root cause.

## Incident handling

For suspected dependency or supply-chain compromise:

1. Stop nonessential releases.
2. Identify affected package/action and installed version from the lockfile/workflow.
3. Review the upstream advisory and patched version.
4. Upgrade in an isolated branch.
5. Run CI + audit + production build.
6. Rotate credentials if exposure is plausible.
7. Redeploy and document the resolution.

## Known non-code dependency

GitHub Pages, GitHub Actions, npm registry availability, and upstream package integrity are external dependencies. A green local/static build does not by itself prove successful production deployment.


## Backend completion controls

### Content integrity

Both CI and Pages deployment run `npm run content:check` before the Astro build. The gate validates report-number uniqueness, author and related-content references, attachment existence, publication/update dates, duplicate/placeholder source URLs, risk disclosure, citation ranges, and source-to-inline-citation coverage.

### Release audit manifest

After build and static QA, CI and Pages deployment run `npm run release:manifest`. The resulting `dist/release-audit.json` records the build SHA/ref, package version, published-report metadata, output inventory, and SHA-256 hashes.

### Scheduled reliability checks

- `Source Health`: weekly validation of published research-source URLs. Protected/rate-limited responses are reported separately from definitive broken links.
- `Production Uptime`: every six hours, validates the site root, research library, first published report, robots and sitemap by HTTP status plus content markers.
- `Recovery Snapshot`: weekly Git bundle, content/config archive, release metadata and checksums, retained for 30 days in Actions artifacts.

Same-provider recovery snapshots do not qualify as independent disaster recovery. Provider-independent backup requires a separately controlled external destination.


## 95% confidence gate

Corporate-identity facts use the machine-readable policy in `src/data/company-evidence.json`.

Before a Pages artifact may be uploaded, CI must pass:

```text
content:check
→ build
→ qa
→ confidence:check
→ release:manifest
→ contract:check
```

A fact below 95 cannot use publication mode `assert`. Material identity facts below 95 remain withheld; lower-risk facts may be displayed only with visible qualification.
