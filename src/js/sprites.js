// ── Hero: woman walking sprite sheet (6 frames, single row) ──────────────────
const HERO_COLS    = 6
const HERO_FEET_Y  = 531   // pixel row where feet end in the 649px-tall frame

let heroCache = null  // { img, fw, fh }

const heroSheet = new Image()
heroSheet.onload = () => {
  const fw = Math.floor(heroSheet.naturalWidth / HERO_COLS)
  const fh = heroSheet.naturalHeight
  heroCache = { img: heroSheet, fw, fh }
}
heroSheet.src = 'src/images/hero-walk.png'

export function drawHero(ctx, x, y, frame, idle) {
  if (!heroCache) return
  const { img, fw, fh } = heroCache
  const fi     = Math.floor(frame / 7) % HERO_COLS
  const scale  = 0.22
  const dw     = fw * scale
  const dh     = fh * scale
  // x = center, y = ground (feet). offset so feet land at y.
  const drawY  = y - HERO_FEET_Y * scale
  ctx.drawImage(img, fi * fw, 0, fw, fh, x - dw / 2, drawY, dw, dh)
}

// ── Dragon sprite sheet (3×3 grid, 9 frames) ──────────────────────────────────
const DRAGON_COLS = 3
const DRAGON_ROWS = 3

let dragonCache = null  // { canvas, fw, fh } — white removed

const dragonSheet = new Image()
dragonSheet.onload = () => {
  const fw = dragonSheet.naturalWidth  / DRAGON_COLS
  const fh = dragonSheet.naturalHeight / DRAGON_ROWS
  const tmp = document.createElement('canvas')
  tmp.width  = dragonSheet.naturalWidth
  tmp.height = dragonSheet.naturalHeight
  const tc = tmp.getContext('2d')
  tc.drawImage(dragonSheet, 0, 0)
  const id = tc.getImageData(0, 0, tmp.width, tmp.height)
  const d  = id.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 220 && d[i+1] > 220 && d[i+2] > 220) d[i+3] = 0
  }
  tc.putImageData(id, 0, 0)
  dragonCache = { canvas: tmp, fw, fh }
}
dragonSheet.src = 'src/images/dragon-sheet.png'

export function drawDragon(ctx, x, y, t) {
  if (!dragonCache) return
  const { canvas, fw, fh } = dragonCache
  const frame = Math.floor(t / 100) % (DRAGON_COLS * DRAGON_ROWS)
  const col   = frame % DRAGON_COLS
  const row   = Math.floor(frame / DRAGON_COLS)
  const dw = fw * 0.30
  const dh = fh * 0.30
  ctx.save()
  ctx.drawImage(canvas, col * fw, row * fh, fw, fh, x - dw / 2, y - dh / 2, dw, dh)
  ctx.restore()
}
