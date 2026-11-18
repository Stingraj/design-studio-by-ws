# Design direction — Design Studio by WS

Researched 2026-11-18 (live captures via Firecrawl, 1920×1080).

| Reference | What it does | What we take |
|---|---|---|
| **Foster + Partners** | Full-bleed photograph is the whole first screen. Wordmark top-left, two utility icons top-right, a two-line caption (kicker + headline) bottom-left, a five-dot pager. No other chrome. | The image *is* the hero. Captions are small, anchored bottom-left, kicker + one sentence. |
| **Norm Architects** | Warm greige paper (`≈#DEDBCF`) under a crossfading full-bleed slideshow. Nav is tiny, widely tracked caps, centred. Project title in letter-spaced serif caps with a two-line centred caption. | Paper tone instead of pure white; tracked micro-caps for navigation and metadata; serif for names. |
| **Vincent Van Duysen** | Cream page that waits for the image — the site is patient; nothing decorative fills the gap. Sections (Interior / Architecture / Products) are plain text lists. | Restraint: no loaders-as-entertainment, no filler motion. Indexes are text lists, not card grids. |
| **ZHA** | Black field, one large grotesk statement bottom-left. | One statement per screen, set large, bottom-left. |

## Rules for this site

1. **Image-first, edge-to-edge.** Every chapter opens on a full-bleed render from the two client projects. No stock, no placeholders, no cards.
2. **Type.** Display: *Instrument Serif* (names, statements). Text/UI: *Inter Tight*. Metadata/indices: *JetBrains Mono*, 11–12px, tracked +0.12em, uppercase. Fluid sizes via `clamp()`.
3. **Colour.** Paper `#F1EEE8`, ink `#151513`, stone `#85817A`, hairline `rgba(21,21,19,.14)`. Project accents from data (`#c4a98a`, `#a3b08a`) used only as thin rules and index numerals. No gradients except image scrims.
4. **Grid.** 12 columns, 24px gutters (16px < 768px), page margin `clamp(16px, 4vw, 64px)`, 8px spacing scale.
5. **Captions** sit bottom-left: mono kicker (`01 — FORMAL LIVING`) + one serif line.
6. **Motion** is slow and structural: clip-path reveals, image scale 1.08→1, pinned chapters, crossfades. Nothing glitches, tilts, or particle-sprays. Everything collapses to static under `prefers-reduced-motion`.
7. **Navigation** is a quiet top bar: wordmark left, four tracked links right, inverted over imagery via `mix-blend-mode: difference`.
