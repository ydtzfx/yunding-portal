# Brand / Design System V1

## Direction

The portal uses an institutional research-publication aesthetic rather than a retail wealth-management or SaaS marketing aesthetic.

## Core principles

- **Evidence over decoration:** visual hierarchy should make sources, metadata, and research structure easier to inspect.
- **Restrained authority:** deep ink/navy carries the institutional frame; muted gold is an accent, never a large decorative fill.
- **Publication first:** report pages prioritize title, abstract, metadata, body typography, references, and related research.
- **Low visual noise:** borders and spacing replace excessive drop shadows and gradients.
- **System fonts first:** no external font dependency is required for production rendering.

## Tokens

- Ink 950: `#08141e`
- Ink 900: `#102330`
- Ink 800: `#1b3442`
- Paper 50: `#f8f6f1`
- Paper 100: `#f0ede6`
- Gold 400: `#c9a667`
- Gold 500: `#ae8848`
- Gold 700: `#7b5c2f`

## Typography

- UI / metadata: system sans-serif stack.
- Editorial headings: CJK serif stack with Georgia fallback.
- Research body: sans-serif, approximately 1.02rem / 1.9 line-height.

## Reusable primitives

- `.institution-container`: standard content width.
- `.institution-eyebrow`: section label.
- `.institution-card`: bordered editorial surface.
- `.institution-link`: consistent inline-link treatment.
- `.research-prose`: long-form research typography.

## Accessibility

Gold is not used as body copy on light backgrounds. Focus-visible outlines use the gold accent. Link meaning must not depend on color alone where ambiguity is possible.
