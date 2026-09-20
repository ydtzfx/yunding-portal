# Backend Completion Pass

## Architecture

The portal intentionally uses a Git-based static publishing backend rather than a database-backed application server.

Production responsibilities are split across:

- Astro Content Collections + Zod for content schema;
- Markdown/MDX for versioned research content;
- Git branches and pull requests for editorial review;
- GitHub Actions for validation, security audit, release manifests, monitoring and deployment;
- GitHub Pages for static production delivery.

No database, user authentication, session store, customer PII store, payment system, trading API or application server is part of the current product scope.

## Build-time integrity gates

`npm run content:check` enforces:

1. report-number uniqueness;
2. valid `authorId` references;
3. valid `related` research references;
4. no self-related or duplicate related IDs;
5. local attachment existence under `public/`;
6. publication and update date validity;
7. `updated >= date`;
8. report-number year matching the publication year;
9. duplicate source URL rejection inside each report;
10. placeholder source URL rejection for published reports;
11. published-report source and risk-disclosure requirements;
12. inline citation ranges staying within the structured source list;
13. every structured source in a published report being cited at least once.

The Astro schema independently enforces the core report-number/source/date constraints so malformed content fails both content validation and normal site builds.

## Runtime reliability

### Source Health

`.github/workflows/source-health.yml` runs weekly and can also be invoked manually.

It checks unique source URLs used by published reports. HTTP 2xx/3xx is healthy; common bot-protection statuses such as 401/403/405/429 are recorded as protected warnings; definitive broken/error states fail the workflow.

The job uploads a structured `source-health.json` report. It never edits a historical report automatically.

### Production Uptime

`.github/workflows/uptime.yml` runs every six hours and checks:

- site root;
- research library;
- the first published report;
- `robots.txt`;
- `sitemap-index.xml`.

Each check validates both HTTP success and a content marker, so a generic platform error page cannot pass merely by returning HTTP 200.

## Recovery snapshots

`.github/workflows/backup.yml` runs weekly and creates:

- a full Git bundle including refs/tags;
- a tarball of research content, public assets, docs, workflows and build configuration;
- GitHub Release metadata;
- the captured HEAD SHA;
- SHA-256 checksums.

These snapshots are retained as GitHub Actions artifacts for 30 days.

**Important:** this is an operational recovery snapshot on the same provider, not an independent off-platform disaster backup. A true provider-independent backup requires an external object store or mirror repository controlled outside GitHub.

## Release audit manifest

Every CI and Pages build generates `dist/release-audit.json`.

The manifest records:

- package/version;
- repository/ref/SHA when available;
- Node runtime;
- output file and HTML counts;
- published report IDs, numbers, dates, authors, source counts and attachment counts;
- SHA-256 hash of every production output file.

This file is deployed with the Pages artifact and provides a machine-readable answer to “what exact files and reports did this release publish?”

## Change boundary

Adding accounts, CMS write APIs, subscriptions, PII, payments, portfolio data, trading integrations or client-specific recommendations changes the backend threat model and requires a new architecture/security/privacy review. Those capabilities must not be added merely to make the portal appear to have a conventional backend.
