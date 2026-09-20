# 芸鼎投资研究院门户

芸鼎投资研究院（Yunding Investment Research Institute）研究内容发布门户。

## Current release

**v1.0.0 — Institutional Grade Release**

当前版本以“证据可追溯、研究发布可审计、生产发布可验证”为核心，已建立研究内容、SEO、安全、隐私/披露、可访问性和 GitHub Pages 生产发布基线。

## 技术栈

- Astro 7
- TypeScript
- Tailwind CSS 4（Vite integration）
- Astro Content Collections
- Markdown / MDX research publishing
- GitHub Actions CI/CD
- GitHub Pages
- npm lockfile + `npm ci`
- automated static production QA

## 本地开发

需要 Node.js 22+ 与 npm 10+。

```bash
npm ci
npm run dev
```

## 验证

```bash
npm audit --audit-level=high
npm run build
npm run qa
```

`npm run qa` 会检查生成后的 production artifact，包括内部链接、canonical、H1、meta description、Article JSON-LD、图片 alt、外链安全、robots、sitemap、404 以及静态 HTML/CSS 预算。

## 研究发布

正式研究内容位于 `src/content/research/`，发布规则见：

- `docs/research-publishing-v2.md`
- `docs/research-visual-data-system.md`
- `docs/templates/research-report.md`

正式报告必须经过 draft、来源/事实核验、内容审阅、报告编号与作者绑定、CI Green、生产部署和产物/公网验收。

## 可信度与信息公开

机构法律主体、监管身份、团队履历、联系方式、客户/AUM/业绩/奖项等信息遵守 **No evidence → no public claim** 原则。验证要求见 `docs/institution-verification.md`。

## 安全与运营

- `SECURITY.md`
- `docs/operations-baseline.md`
- `docs/legal-review-gate.md`
- Dependabot weekly updates
- high/critical npm audit findings block CI and deployment
- Pages deployment runs the same static QA gate before artifact upload

## Production

GitHub Pages:

https://ydtzfx.github.io/yunding-portal/

## Release history

See `CHANGELOG.md`.
