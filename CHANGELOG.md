# Changelog

All notable production releases are documented in this file.

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
