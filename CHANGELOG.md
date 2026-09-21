# Changelog

All notable production releases are documented in this file.

## [1.1.3] - 2026-09-21

### Confidence Gated

- Added a machine-readable 95/100 publication-confidence registry for corporate identity facts.
- Added three publication modes: `assert`, `qualified`, and `withheld`.
- Refactored Contact terminology from “Official Contact / 办公地址 / 正式邮箱” to evidence-bounded public-contact wording.
- Added site-wide Organization JSON-LD using only facts at or above the publication threshold; legalName, registration, regulatory and unverified domain ownership are excluded.
- Qualified the owner-supplied ICP filing number and require the official MIIT query link; the number is not presented as independently verified.
- Live GitHub-runner validation on 2026-09-21 could not resolve `ydtzfx.com`; domain association/ownership confidence was therefore downgraded and the GitHub Pages origin remains canonical.
- Added `npm run confidence:check` and made it a blocking CI/Pages deployment gate.
- Added identity-confidence metadata to the release audit manifest and reconciliation checks.
- Address, telephone and email remain publishable as enterprise-owner-confirmed facts at the minimum 95 threshold; they are not described as independent third-party verification.

## [1.1.2] - 2026-09-20

### Public Company Info

- Added a canonical public-company data source for owner-confirmed office address, telephone, email and ICP filing information.
- Published the office address, clickable telephone/email links and ICP filing on the Contact page.
- Added published telephone/email and the ICP filing link to the site-wide footer.
- Linked the filing number to the MIIT ICP/IP Address/Domain Information Filing Management System.
- Updated About, Legal and Privacy wording so public-contact state is consistent across the site.
- Updated the institution verification register to distinguish owner-confirmed public information from independently verified legal/regulatory identity.
- Added blocking production QA to ensure Contact/Footer cannot drift from the canonical public-company data source.
- No legal entity name, unified social credit code, registered address, regulatory licence or financial-service permission was inferred or added.

## [1.1.1] - 2026-09-20

### Contract Aligned

#### Frontend ↔ backend contract
- Added a shared research service/projection layer derived from Astro Content Collection types.
- Routed research detail, index, category, archive, author, related-content and card rendering through the shared published-research contract.
- Added a static `/research/catalog.json` generated from the same projection used by server-rendered research surfaces.
- Changed research search/filtering to consume the shared catalog by report ID rather than duplicating search metadata in DOM attributes.
- Removed the first report's non-substantive `updated` date; Updated UI, Open Graph modified time and JSON-LD `dateModified` now exist only when a substantive backend update exists.

#### Contract drift prevention
- Expanded `release-audit.json` schema to include public research metadata and draft IDs.
- Added `npm run contract:check` to compare backend release manifest ↔ static catalog ↔ rendered HTML.
- Contract checks cover report identity, author, dates, source/highlight/attachment counts, tags, explicit related links, index/category/archive/author presence and draft isolation.
- Pages artifact upload is blocked unless content integrity, static QA, release manifest and frontend/backend contract checks all pass.

## [1.1.0] - 2026-09-20

### Operational Complete

#### Frontend completion
- Completed the institutional visual migration for Research Index, category, archive, author and contact surfaces.
- Added responsive mobile navigation, research keyword/category/year filters, branded favicon/touch/OG assets and expanded responsive artifact QA.

#### Backend governance
- Added build-time research integrity checks for report-number uniqueness, author/related references, local attachments, publication/update invariants, duplicate/placeholder sources, risk disclosure and inline citation completeness.
- Added machine-readable `dist/release-audit.json` with published-report metadata and SHA-256 hashes of production output.
- Added weekly published-source URL health monitoring with protected/rate-limited classification.
- Added six-hour production uptime monitoring using HTTP status plus content markers.
- Added weekly recovery snapshots containing a Git bundle, content/config archive, release metadata, HEAD SHA and checksums.
- Added explicit backup/restore documentation and provider-independent disaster-recovery boundary.
- Added `yaml@2.8.1` as an explicit deterministic dependency for content-governance tooling.

#### Validation
- Backend operations rehearsal passed: 2 research entries, 1 published report, 1 author and 1 report number passed referential/publication/citation integrity.
- All 12 unique published source URLs were checked; 11 were directly healthy and one IMF endpoint returned HTTP 405 and was correctly classified as protected rather than broken.
- Production root, research library, first report, robots and sitemap all returned HTTP 200 with expected content markers.
- Recovery Git bundle verification and SHA-256 snapshot checks passed.

## [1.0.0] - 2026-09-20

### Institutional Grade Release

#### Engineering & operations
- Migrated the portal from legacy static HTML to Astro + TypeScript + Tailwind CSS 4.
- Established Content Collections for research publishing with draft isolation.
- Upgraded to Astro 7.3.3 and modern GitHub Actions runtimes.
- Added deterministic dependency installation with `package-lock.json` and `npm ci`.
- Added weekly Dependabot updates for npm and GitHub Actions.
- Added a CI/deployment security gate using `npm audit --audit-level=high`.
- Added documented release, rollback, incident-response, and vulnerability-reporting procedures.

#### Research publishing
- Added report numbering, structured author identity, publication/update dates, categories, tags, related research, and structured sources.
- Published the first reviewed report as `YD-MACRO-2026-001`.
- Added Article JSON-LD, article Open Graph metadata, canonical URLs, author pages, archive/category pages, sitemap, and robots metadata.
- Added structured key findings, accessible static figure/table primitives, and reviewed attachment metadata.
- Added standardized report and publication templates.

#### Institutional trust
- Removed placeholder team identities, unverified contact details, and unsupported institutional/service claims.
- Added an institutional verification register governed by “No evidence → no public claim”.
- Added public methodology covering source hierarchy, fact/analysis boundaries, date discipline, counter-evidence, updates/corrections, and risk boundaries.
- Added Terms, Privacy Notice, and Research Disclosure pages with explicit legal/compliance review triggers.

#### Brand & design
- Introduced an institutional research-publication design system with ink/navy, restrained gold, warm paper surfaces, editorial typography, and reusable visual tokens.
- Redesigned the home, navigation, footer, research cards, report pages, references, About, Team, and Methodology surfaces.

#### Accessibility, SEO & QA
- Added keyboard skip navigation, reduced-motion handling, print styles, and a production 404 page.
- Added automated production-artifact QA for:
  - internal links and GitHub Pages base paths;
  - canonical URLs and duplicate canonicals;
  - title, description, H1, and language metadata;
  - image alt attributes;
  - external-link security;
  - Article JSON-LD and publication metadata;
  - robots.txt, sitemap-index.xml, and 404;
  - static HTML/CSS budgets.
- Final pre-release production artifact: 14 HTML pages, 210 internal links, 0 broken links, 0 malformed base paths, CSS ~25 KiB.

### Known evidence-gated items

The release intentionally does **not** publish unverified legal-entity details, regulatory/licensing claims, official contact details, named staff biographies/credentials, client counts, AUM, performance claims, or awards. These remain blocked until primary evidence is reviewed.
