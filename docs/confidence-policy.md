# 95% Publication Confidence Policy

## Purpose

The portal uses a minimum internal publication-confidence threshold of **95/100** for factual corporate-identity claims that are stated without qualification.

This is an operational evidence score, **not a statistical probability**.

## Publication modes

- `assert`: score >= 95. The fact may be stated directly.
- `qualified`: score < 95. The fact may appear only with a visible qualification explaining the evidence limitation.
- `withheld`: score < 95 and the risk of misinterpretation is material. The fact must not be published as an established fact.

The machine-readable registry is `src/data/company-evidence.json`.

## Current classification

| Fact | Score | Mode | Basis |
| --- | ---: | --- | --- |
| Brand name | 99 | assert | Site-owner confirmation + exact public brand match |
| Contact address | 96 | assert | Site-owner confirmation + exact match on publicly indexed ydtzfx.com |
| Contact telephone | 96 | assert | Site-owner confirmation + exact match on publicly indexed ydtzfx.com |
| Contact email | 96 | assert | Site-owner confirmation + exact match on publicly indexed ydtzfx.com |
| MIIT filing-system URL | 100 | assert | Official MIIT notice identifies beian.miit.gov.cn |
| ICP filing number | 80 | qualified | Site-owner supplied; independent official query result not reproducibly captured in this repository |
| ydtzfx.com brand association | 92 | qualified | Public site + LinkedIn association |
| ydtzfx.com ownership/control | 60 | withheld | No registrar/DNS/admin-control evidence |
| Legal entity name | 0 | withheld | No primary registry/licence evidence |
| Unified social credit code | 0 | withheld | Not supplied |
| Registered address | 0 | withheld | Not supplied |
| Regulatory/licensing status | 0 | withheld | No regulator record supplied |

## Consequences

Until the relevant score reaches 95:

- `ydtzfx.com` must not become the production canonical origin solely on the basis of public association;
- no `legalName`, registration number, registered address, licence or regulatory claim may enter Organization JSON-LD;
- the ICP filing number must carry a visible qualification;
- legal-entity and regulatory fields remain withheld.

## Automated gate

`npm run confidence:check` validates:

1. threshold remains 95;
2. no below-threshold fact uses `assert`;
3. required high-confidence contact facts stay above threshold;
4. ICP remains qualified;
5. legal/domain/regulatory low-confidence fields remain withheld;
6. Contact/Footer wording preserves qualification;
7. Organization JSON-LD contains only allowed identity claims;
8. ydtzfx.com is not asserted as the verified production domain before ownership evidence exists.

The same gate runs in CI and before GitHub Pages artifact upload.
