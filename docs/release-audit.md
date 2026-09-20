# Release Audit Manifest

Every verified build produces `dist/release-audit.json`.

## Intended use

The manifest is a release-evidence artifact, not a replacement for Git history or a cryptographic signing system.

It allows operators to correlate:

- package version;
- Git SHA/ref;
- published research metadata;
- production file inventory;
- file SHA-256 values.

## Verification

After downloading a production artifact:

1. inspect `release-audit.json`;
2. verify its `git.sha` against the Pages workflow head SHA;
3. verify the expected report number(s) appear in `research.reports`;
4. recompute selected output hashes when investigating a release;
5. retain the manifest with incident/release evidence when a production issue is under review.

Future signing or transparency-log work can layer on top of this manifest without changing the research content model.


## Contract alignment

Manifest schema version 2 includes the public research projection used for frontend/backend reconciliation:

- title, summary and optional description;
- report number, category, tags and author ID;
- publication and substantive update dates;
- featured and related state;
- highlight, source and attachment counts;
- published report IDs and isolated draft IDs.

After generating the manifest, `npm run contract:check` compares it with `/research/catalog.json` and rendered HTML. A mismatch blocks CI and Pages artifact upload.
