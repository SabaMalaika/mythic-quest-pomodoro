# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start local dev server (npx serve .) — opens on a random available port, check terminal output
npm run build    # build self-contained single-file HTML → dist/index.html
```

No build step required during development — ES modules are served directly. Always use the dev server (not `file://`) because ES module imports require HTTP.

## Architecture

### Two delivery modes

1. **Dev site** (`index.html` + `src/`) — proper project with separate CSS/JS/asset files. This is the primary target for ongoing development.
2. **Standalone file** (`dist/index.html`) — single self-contained HTML with all assets base64-inlined, produced by `build-standalone.js` from `pomodoro-template.html`. Only needed for distribution.

### Canvas rendering (`src/js/canvas.js`)

The entire background is a `<canvas>` that composites 4 PNG layers (sky → background → midground → foreground) with subtle parallax. Key architecture decisions:

- **30 fps cap** via `TARGET_MS` check at the top of `render()` — do not remove this.
- **Offscreen CSS-pixel caches** — each layer is pre-scaled and double-tiled to an offscreen `<canvas>` in CSS pixels (not device pixels). The main canvas uses `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` so all drawing coordinates are CSS pixels. Never size offscreen canvases by `dpr` — that breaks the drawing math.
- **Black removal** is done in-browser via `getImageData`/`putImageData` on load (pixels with R<12, G<12, B<12 → alpha=0). Source images live in `src/images/`; processed caches are built at runtime, not stored on disk.
- `scene` object is the shared state between canvas and the timer (`scene.running`, `scene.flash`, `scene.dragon`).

### Timer (`src/js/timer.js`)

`PomodoroTimer` extends `EventTarget`. Emits `update` (every tick) and `complete` (session end). Duration settings persist to `localStorage` under key `mqp-settings` in minutes. Do not store seconds — the settings panel reads/writes minutes.

### Wiring (`src/js/main.js`)

Imports both `PomodoroTimer` and `scene`, wires DOM events to timer methods, and reacts to timer events by mutating `scene` (e.g. `scene.flash`, `scene.dragon`). This is the only file that touches the DOM.

### Layer images

- `src/images/` — original source PNGs (sky, background, midground, foreground), 1328×800 RGBA
- `src/layers/` — legacy generated layers from the old procedural system; no longer used by the dev site
- Parallax speeds (in `LAYERS` array in `canvas.js`): sky=0, background=0.025, midground=0.06, foreground=0.12

### CSS

All color/spacing tokens are CSS custom properties in `src/css/variables.css`. The `--ring-circum` variable (552.92px = 2π×88) is used by both CSS and JS — if the SVG ring radius changes, update both.
