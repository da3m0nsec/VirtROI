# VirtROI logo kit

The mark: a **V** that doubles as a rising trend line, breaking out of the vertex into an arrow, standing on three blocks (hosts / sockets — the capacity being priced).

## Palette

| Role | Hex |
|---|---|
| Ink (tile, dark bg, `Virt`) | `#04342C` |
| Deep green (small-size tile) | `#0F6E56` |
| Green (`ROI` on light, blocks) | `#1D9E75` |
| Mint (mark, `ROI` on dark) | `#5DCAA5` |
| Pale (`Virt` on dark) | `#E1F5EE` |
| Muted (tagline on light) | `#5F5E5A` |

## Files

**Lockups** — `virtroi-logo.svg` is the primary. Use `-reversed` on ink or any dark background. The `-tagline` versions add "Virtualization ROI calculator" and are for headers or docs covers, not for small placements.

**Icons** — `virtroi-icon.svg` is the full mark on its tile. `virtroi-icon-simple.svg` drops the three blocks and thickens the stroke; it's the one used for anything under ~48px, where the blocks turn to mud. `virtroi-icon-mono.svg` is single-colour for stamps, print, or watermarks. `virtroi-icon-knockout.svg` is the tile-less mark for placing on your own background.

**Rasters** — `favicon-16/32/48.png` + `favicon.ico`, `apple-touch-icon.png` (180), `icon-64/128/192/256/512.png`, `icon-512-maskable.png` for Android adaptive icons, `og-image.png` (1200×630) for social previews.

The wordmark is outlined to paths (Poppins Medium), so every file renders identically with no webfont dependency.

## Drop-in for `index.html`

```html
<link rel="icon" href="assets/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta property="og:image" content="https://da3m0nsec.github.io/VirtROI/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

In the nav, swap the text link for the lockup:

```html
<a href="#top" class="brand"><img src="assets/virtroi-logo.svg" alt="VirtROI" height="32"></a>
```

## Clear space and minimums

Keep clear space equal to the height of one block (⅛ of the tile) on all sides. Minimum lockup width 140px; below that use the icon alone. Don't recolour the mark outside the palette, don't stretch it, and don't put the tile version on a coloured background — use the knockout instead.
