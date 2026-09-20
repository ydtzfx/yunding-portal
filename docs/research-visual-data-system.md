# Research Visual, Data & Attachment System

## Purpose

Research visuals must increase inspectability of evidence. They must not be decorative substitutes for underlying data, nor imply precision that the source data does not support.

## Report visual hierarchy

Every published report can use:

1. report title and abstract;
2. report number, author, publication date, and update date;
3. up to five `highlights` rendered as a compact “核心观点” panel;
4. body text and evidence-linked analysis;
5. optional charts / tables;
6. optional reviewed attachments;
7. structured sources;
8. related research.

## Charts and figures

Default to **static SVG, PNG, or WebP** rendered through `ResearchFigure.astro`.

Every figure must provide:
- a descriptive title;
- meaningful alt text;
- reporting period / “as of” date when time-sensitive;
- unit where applicable;
- data source and source URL when external;
- caption when interpretation needs qualification.

Do not publish a chart when the underlying values, period, unit, or source are unknown. Do not use screenshots of charts when a reproducible chart or semantic table can be produced from source data.

Internal figure assets should live under `public/research-assets/<report-id>/` and are referenced without a leading slash, for example:
`research-assets/fed-rmp-gold-2026/chart-01.svg`.

## Data tables

Use `DataTable.astro` for small structured datasets. The component produces a semantic HTML table with column headers and row headers and remains horizontally scrollable on narrow screens.

Tables should contain reviewed values only. The first column should identify the row dimension; subsequent columns contain observations.

## Attachments

Research frontmatter supports:

```yaml
attachments:
  - title: 完整报告
    href: research-assets/example/report.pdf
    kind: report
    format: PDF
    size: 1.2 MB
    description: 正式发布版本
```

Supported `kind` values:
- `report`
- `data`
- `appendix`
- `other`

Attachments must be:
- public-safe and free of confidential/client data;
- reviewed for factual consistency with the article;
- versioned or replaced deliberately when the report is updated;
- named with stable, non-sensitive filenames;
- scanned by the publishing owner before release.

An empty `attachments: []` is preferable to linking a placeholder file.

## Data governance

The portal does not invent datasets to demonstrate charting capability. A chart or data attachment enters production only when the underlying source material is available and its transformation is reproducible or reviewable.

For manually transformed data, preserve a note describing:
- original source;
- extraction date;
- transformation/calculation;
- unit conversion;
- any exclusions or assumptions.

## Accessibility and print

Charts require alt text. Tables use semantic headers. Static assets are preferred because they remain available without JavaScript and are suitable for printing, archiving, search indexing, and accessibility review.

Interactive charts should be introduced only when the interaction itself is analytically necessary, not for visual novelty.
