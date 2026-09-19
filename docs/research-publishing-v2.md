# Research Publishing V2

## 1. 报告编号
正式发布报告必须使用 `YD-{CATEGORY}-{YYYY}-{NNN}`。
示例：`YD-MACRO-2026-001`。编号一经正式发布不得复用或修改。

## 2. 作者体系
研究内容使用 `authorId` 指向 `src/content/authors/` 中的作者档案。
作者可以是 `Person` 或 `Organization`。页面展示作者档案入口，不在文章 frontmatter 中重复自由文本署名。

## 3. 发布时间与更新时间
`date` 为首次正式发布日期；`updated` 仅在正文、数据、结论或重要来源发生实质修改时更新。
仅修复错别字或样式不更新 `updated`。

## 4. 引用规范
所有可外部核验的关键数字、政策决定、时间点和第三方观点必须有可追溯来源。
来源统一写入 frontmatter 的 `sources`，至少包括 `title`、`publisher`、`url`；建议补充 `date` 和 `accessed`。
正文引用使用“（见资料来源 N）”或“（见资料来源 N–M）”，编号与页面自动渲染的资料来源列表一致。
正式发布报告至少包含 1 个来源。优先使用监管机构、政府、央行、交易所、公司原始公告和一手统计数据。

## 5. 相关阅读
`related` 填写研究条目的内容 ID。详情页优先展示显式相关阅读；不足 3 篇时，再按同分类最新文章补齐。

## 6. SEO
每篇正式报告自动输出 Article JSON-LD，包括标题、报告编号、发布日期、更新时间、作者、关键词、canonical 和 publisher。
页面必须有唯一 canonical。

## 7. 发布流程
1. 新建独立 content branch。
2. 创建/更新 Markdown，保持 `draft: true`。
3. 来源核验、事实核验、风险提示和编辑审阅。
4. Draft PR + CI Green，并验证 draft 不生成公开路由。
5. 内容批准后改为 `draft: false`，同时确保报告编号和 sources 完整。
6. 再次 CI Green，确认详情页、分类页、作者页和 sitemap 均生成。
7. Ready for Review → Merge main。
8. GitHub Pages Deploy Green。
9. 对生产详情页、canonical、JSON-LD、来源链接和 sitemap 做 smoke test。

## 8. 发布门禁
任何以下情况不得 `draft:false`：无报告编号、无来源、关键数据无法追溯、作者身份不明确、风险提示缺失、仍含占位内容。
