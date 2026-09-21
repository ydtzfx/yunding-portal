# 芸鼎投资研究院门户

芸鼎投资研究院（Yunding Investment Research Institute）研究内容发布门户。

## Current release

**v1.1.3 — Confidence Gated**

当前版本把企业身份事实纳入 95% 内部发布置信度门槛：达到门槛可直接陈述，低于门槛必须带资格说明或保持未公开，并由 CI 在 Pages artifact 上传前强制检查。

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
npm run content:check
npm run build
npm run qa
npm run confidence:check
npm run release:manifest
```

后台/发布验证分为三层：

- `npm run content:check`：报告编号、作者/相关阅读关系、附件、日期、来源与正文引用完整性；
- `npm run qa`：生成后的 production artifact 链接、SEO、品牌资产、响应式与静态预算；
- `npm run confidence:check`：阻止低于 95% 的企业身份事实被无条件断言；
- `npm run release:manifest`：生成机器可读的生产文件/报告 SHA-256 与身份置信度审计清单；
- `npm run contract:check`：对账后端 release manifest、静态 research catalog 与最终 HTML 渲染。

## 研究发布

正式研究内容位于 `src/content/research/`，发布规则见：

- `docs/research-publishing-v2.md`
- `docs/research-visual-data-system.md`
- `docs/templates/research-report.md`

正式报告必须经过 draft、来源/事实核验、内容审阅、报告编号与作者绑定、CI Green、生产部署和产物/公网验收。

## 可信度与信息公开

机构法律主体、监管身份、团队履历、联系方式、客户/AUM/业绩/奖项等信息遵守 **No evidence → no public claim** 原则。验证要求见 `docs/institution-verification.md`。

## 公开企业信息

以下信息由企业方明确提供并授权本站公开：

- 联系地址：广州市天河区中山大道科韵路102号8楼C0161（企业方确认，95）
- 联系电话：13503042560（企业方确认，95）
- 联系邮箱：gz@ydtzfx.com（企业方确认，95）
- ICP备案号：粤ICP备20026282号（企业方提供，低于95；以工信部实时查询为准）
- 工信部备案查询：https://beian.miit.gov.cn/

当前 `ydtzfx.com` 的历史品牌关联低于 95，且 2026-09-21 的 GitHub runner 实时 DNS 解析失败，因此不会被作为已验证官网/域名所有权写入 canonical 或 Organization URL。法律主体、统一社会信用代码、注册地址、监管资质与业务许可继续保持 withheld。

## 安全与运营

- `SECURITY.md`
- `docs/operations-baseline.md`
- `docs/legal-review-gate.md`
- Dependabot weekly updates
- high/critical npm audit findings block CI and deployment
- Pages deployment runs content integrity + static QA + release manifest before artifact upload
- weekly published-source health checks
- six-hour production uptime checks
- weekly Git bundle/content recovery snapshots

## Production

GitHub Pages:

https://ydtzfx.github.io/yunding-portal/

## Release history

See `CHANGELOG.md`.
