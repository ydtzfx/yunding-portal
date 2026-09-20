# Backup & Recovery Strategy

## Recovery objectives

The static/Git-based architecture makes the repository itself the primary source of truth.

A recoverable snapshot must preserve:

- Git history and tags;
- research and author content;
- public research/brand assets;
- site configuration and workflows;
- release metadata;
- checksums identifying snapshot corruption.

## Scheduled snapshot

The weekly `Recovery Snapshot` workflow creates:

```text
yunding-portal.bundle
research-content.tar.gz
releases.json
head-sha.txt
SHA256SUMS
```

The bundle can recreate Git refs and history. The content archive provides a simple file-level recovery path when a full Git restore is unnecessary.

## Restore procedure

1. Download the latest known-good recovery artifact.
2. Verify `sha256sum -c SHA256SUMS`.
3. Clone from the bundle:
   `git clone yunding-portal.bundle restored-repo`.
4. Compare `head-sha.txt` with the expected production/release SHA.
5. Run:
   `npm ci && npm audit --audit-level=high && npm run content:check && npm run build && npm run qa && npm run release:manifest`.
6. Restore the remote in a controlled repository.
7. Push only after review; do not rewrite the current production history without an incident-approved recovery plan.
8. Redeploy Pages and verify production uptime markers.

## Independent disaster recovery

The scheduled artifact is stored by GitHub and therefore does not protect against a provider-wide or account-wide loss.

For provider-independent recovery, configure one of the following outside this repository:

- an automated mirror to a second Git hosting provider;
- encrypted object storage in a separate cloud/account;
- organization-managed backup infrastructure with retention controls.

The external destination, credentials, retention, encryption key ownership and restore test frequency must be documented before the system can claim provider-independent disaster recovery.

## Restore testing

At least quarterly, restore a snapshot into a disposable environment and run the full verification command. A backup that has never been restored is not considered proven recoverable.
