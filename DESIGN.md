# Design

## Color Strategy

**Committed**: warm gold carries 30-40% of surface identity. Tinted neutrals in the warm-cream band, anchored by the brand gold.

### Palette (OKLCH)

- **Brand Gold**: oklch(72% 0.10 82) → `#caa86a`
- **Brand Gold Dark**: oklch(62% 0.10 78) → `#b8965a`
- **Background**: oklch(97% 0.01 85) → `#fdf8f0`
- **Surface**: oklch(95% 0.015 85) → `#f3ead9`
- **Ink Primary**: oklch(20% 0.02 70) → `#2e2a23`
- **Ink Secondary**: oklch(40% 0.03 75) → `#6b6353`
- **Ink Muted**: oklch(55% 0.03 78) → `#a99a78`
- **Border**: oklch(88% 0.03 82) → `#e8dcc4`
- **Accent Soft**: oklch(92% 0.02 82) → `#fef3e2`

### Notes

- No cream/sand/beige body-bg token names (no `--cream`, `--paper`, `--sand`)
- Gradients are for surfaces only, never for text
- Gold is the sole accent; no competing accent colors

## Typography

### Fonts

- **Display / Heading**: `"Cormorant Garamond", Georgia, serif` — elegant, literary, pairs with Islamic calligraphy aesthetic. NOT on the reflex-reject list for brand surfaces with genuine cultural resonance.
- **Body**: `"Instrument Sans", system-ui, sans-serif` — clean, modern, high readability at small sizes
- **Monospace**: `"JetBrains Mono", monospace` — for code/technical content only

### Scale

- Hero H1: clamp(2.25rem, 5vw, 3.5rem) — 36px to 56px
- H2: clamp(1.5rem, 3vw, 2rem) — 24px to 32px
- H3: 1.25rem (20px)
- Body: 1rem (16px)
- Small / caption: 0.875rem (14px)

### Hierarchy Rules

- Weight contrast ≥ 1.25 between levels
- Line-height: headings 1.2, body 1.6
- Letter-spacing: headings -0.02em, body normal
- Use `text-wrap: balance` on h1-h3

## Spacing

Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

- Section padding: 48px (mobile) / 64px (desktop)
- Card padding: 24px
- Element gap: 16px
- Inline spacing: 8px

## Border Radius

- Cards / containers: 16px
- Buttons / inputs: 9999px (pill)
- Small elements: 8px

## Motion

- Default easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- Duration: 200ms (micro), 300ms (state), 500ms (reveal)
- No bounce, no elastic
- Always respect `prefers-reduced-motion: reduce`

## Components

- **Button primary**: gold bg, white text, pill shape, shadow-lg
- **Button ghost**: transparent bg, gold text, gold border
- **Card**: white/semi-transparent bg, 16px radius, subtle border
- **Input**: full-width, rounded, focus ring in gold
- **Badge/chip**: small rounded pill, muted background

## Register

brand — this is a landing page + chat interface where the design IS the first impression
