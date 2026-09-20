# Frontend ↔ Backend Research Contract

## Purpose

The portal has one authoritative research content model: Astro Content Collections validated by `src/content.config.ts`.

Frontend pages must not redefine publication rules or independently decide what counts as a published report.

## Shared application layer

`src/lib/research.ts` is the frontend-facing projection and query layer.

It provides:

- `PublishedResearchEntry` derived from Astro's generated Collection type;
- `getPublishedResearch()`;
- `getAuthors()`;
- category/year grouping;
- author resolution;
- related-research resolution;
- the static research-catalog projection.

All public research surfaces consume this layer.

## Data flow

```text
Markdown / MDX
→ Content Collection schema
→ content integrity gate
→ shared research service
→ server-rendered pages + static catalog
→ release audit manifest
→ frontend/backend contract check
→ Pages artifact
```

## Update semantics

`date` is the first formal publication date.

`updated` is optional and exists only after a substantive post-publication change to content, data, conclusions or important sources.

When `updated` is absent, the frontend must not emit:

- an Updated label;
- `article:modified_time`;
- JSON-LD `dateModified`;
- a synthetic update date equal to the publication date.

## Static catalog

`/research/catalog.json` is a static, read-only projection of published research.

It contains no drafts and is used by research discovery/search. It is not a write API and does not introduce a server runtime.

## Contract markers

Published report HTML exposes machine-checkable metadata markers for:

- report ID and report number;
- author ID;
- publication/update date;
- source count;
- highlight count;
- attachment count.

List/archive/author surfaces expose report identity markers so CI can verify that each published report appears where required.

## CI reconciliation

`npm run contract:check` compares:

1. `dist/release-audit.json` — backend/release truth;
2. `dist/research/catalog.json` — frontend discovery projection;
3. generated HTML — rendered frontend truth.

The check fails on metadata mismatch, missing routes/cards, incorrect update semantics, count drift or draft leakage.

## Change rule

Any new public research metadata field must follow this sequence:

1. add/validate it in the Content Collection schema;
2. expose it through the shared research projection if frontend-visible;
3. render it where required;
4. include it in release audit metadata where operationally relevant;
5. extend contract-check coverage;
6. update publishing documentation.

A frontend-only copy of backend research metadata is not allowed.
