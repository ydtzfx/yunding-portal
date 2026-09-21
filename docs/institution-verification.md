# Institution Verification Register

This register controls which institutional facts may be published on the production site.

## Publication rule

**No evidence → no public claim. Below 95 → qualify or withhold.**

The authoritative machine-readable confidence registry is `src/data/company-evidence.json`. See `docs/confidence-policy.md` for scoring and release rules.

## Current status — 2026-09-21

| Item | Confidence | Publication state | Current evidence / requirement |
| --- | ---: | --- | --- |
| Brand name “芸鼎投资研究院” | 99 | Assert | Site-owner confirmation + publicly indexed brand match |
| Contact address | 96 | Assert | 企业方提供 + publicly indexed ydtzfx.com exact match |
| Contact telephone | 96 | Assert | 企业方提供 + publicly indexed ydtzfx.com exact match |
| Contact email | 96 | Assert | 企业方提供 + publicly indexed ydtzfx.com exact match |
| MIIT query URL | 100 | Assert | Official MIIT notice confirms `beian.miit.gov.cn` |
| ICP filing number 粤ICP备20026282号 | 80 | Qualified | 企业方提供；must be checked against MIIT live query |
| ydtzfx.com brand association | 92 | Qualified | Public website + LinkedIn association |
| ydtzfx.com ownership/control | 60 | Withheld | Needs registrar, DNS, or admin-control proof |
| Legal entity name | 0 | Withheld | Needs current official registry/business licence |
| Unified social credit code | 0 | Withheld | Needs current official registry/business licence |
| Brand ↔ legal entity relationship | 0 | Withheld | Needs corporate/brand authorization evidence |
| Registered address | 0 | Withheld | Needs official registry evidence |
| Regulatory/licensing status | 0 | Withheld | Needs relevant regulator/database record |
| Permitted financial-service scope | 0 | Withheld | Needs regulator evidence + legal/compliance review |
| Team names/roles/credentials | 0 | Withheld | Needs identity/appointment/credential evidence |
| Client/AUM/performance/awards | 0 | Withheld | Needs auditable records and publication approval |

## Public corporate information

The following may be stated directly because they meet the internal 95 threshold:

- 联系地址：广州市天河区中山大道科韵路102号8楼C0161
- 联系电话：13503042560
- 联系邮箱：gz@ydtzfx.com

The following may be displayed **only with qualification**:

- 粤ICP备20026282号 — 企业方提供；以工信部备案管理系统实时查询结果为准。

## Domain rule

Public pages associate the brand with `ydtzfx.com`, but the repository does not contain registrar/DNS/admin proof. Therefore the production canonical origin remains the verified GitHub Pages deployment until domain control is independently evidenced and the migration gate is rerun.

## Prohibited inference

Contact data, an ICP number, a social profile, or an old public website must not be used to infer or publish:

- a legal entity name;
- a unified social credit code;
- a registered address;
- financial/regulatory licences;
- permitted investment/advisory business scope;
- client, AUM, performance, award, or team claims.
