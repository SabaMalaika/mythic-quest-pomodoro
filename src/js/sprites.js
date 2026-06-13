// ── Pixel hero mage ───────────────────────────────────────────────────────────
const PX = 5
const PAL = {
   1: '#f2c5a0',  2: '#7a3020',  3: '#b04030',  4: '#5a6aa0',
   5: '#3a4a70',  6: '#7888c8',  7: '#484878',  8: '#6a4020',
   9: '#d4a020', 10: '#2a1810', 11: '#eeeeff', 12: '#181630',
  13: '#9860b0', 14: '#8b6030', 15: '#40e0d0',
}
const FRAMES = [
  [[0,0,0,4,4,4,4,5,0,0,0,0],[0,0,4,4,4,4,5,5,5,0,0,0],[0,0,5,4,4,5,5,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0,0,0],[0,0,2,1,1,1,2,2,0,0,0,0],[0,2,3,1,1,3,2,0,0,0,0,0],[0,11,6,6,6,6,9,13,0,0,14,0],[0,6,6,6,6,6,6,13,0,14,0,0],[0,6,8,8,8,8,6,0,14,0,0,0],[0,7,6,6,6,6,7,0,0,0,0,0],[0,7,6,9,6,9,7,0,0,0,0,0],[0,0,7,6,6,7,0,0,0,0,0,0],[0,0,7,6,6,7,0,0,0,0,0,0],[0,0,7,7,7,7,0,0,0,0,0,0],[0,10,10,0,10,10,0,0,0,0,0,0]],
  [[0,0,0,4,4,4,4,5,0,0,0,0],[0,0,4,4,4,4,5,5,5,0,0,0],[0,0,5,4,4,5,5,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0,0,0],[0,0,2,1,1,1,2,2,0,0,0,0],[0,2,3,1,1,3,2,0,0,0,0,0],[0,11,6,6,6,6,9,13,0,0,14,0],[0,6,6,6,6,6,6,13,0,14,0,0],[0,6,8,8,8,8,6,0,14,0,0,0],[0,7,6,6,6,6,7,0,0,0,0,0],[0,7,6,9,6,9,7,0,0,0,0,0],[0,7,7,6,6,7,0,0,0,0,0,0],[0,7,6,6,7,0,0,0,0,0,0,0],[10,7,0,0,7,7,0,0,0,0,0,0],[10,0,0,0,10,10,0,0,0,0,0,0]],
  [[0,0,0,4,4,4,4,5,0,0,0,0],[0,0,4,4,4,4,5,5,5,0,0,0],[0,0,5,4,4,5,5,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0,0,0],[0,0,2,1,1,1,2,2,0,0,0,0],[0,2,3,1,1,3,2,0,0,0,0,0],[0,11,6,6,6,6,9,13,0,0,14,0],[0,6,6,6,6,6,6,13,0,14,0,0],[0,6,8,8,8,8,6,0,14,0,0,0],[0,7,6,6,6,6,7,0,0,0,0,0],[0,7,6,9,6,9,7,0,0,0,0,0],[0,0,7,6,6,7,0,0,0,0,0,0],[0,0,7,6,6,7,0,0,0,0,0,0],[0,0,7,7,7,7,0,0,0,0,0,0],[0,10,10,0,10,10,0,0,0,0,0,0]],
  [[0,0,0,4,4,4,4,5,0,0,0,0],[0,0,4,4,4,4,5,5,5,0,0,0],[0,0,5,4,4,5,5,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0,0,0],[0,0,2,1,1,1,2,2,0,0,0,0],[0,2,3,1,1,3,2,0,0,0,0,0],[0,11,6,6,6,6,9,13,0,0,14,0],[0,6,6,6,6,6,6,13,0,14,0,0],[0,6,8,8,8,8,6,0,14,0,0,0],[0,7,6,6,6,6,7,0,0,0,0,0],[0,7,6,9,6,9,7,0,0,0,0,0],[0,7,7,6,6,0,0,0,0,0,0,0],[0,0,7,6,6,7,7,0,0,0,0,0],[0,0,7,7,0,0,7,7,0,0,0,0],[0,0,10,10,0,0,10,10,0,0,0,0]],
]

export function drawHero(ctx, x, y, frame, idle) {
  const fi = idle ? 0 : Math.floor(frame / 7) % 4
  const sp = FRAMES[fi]
  for (let r = 0; r < sp.length; r++)
    for (let c = 0; c < sp[r].length; c++) {
      const v = sp[r][c]; if (!v) continue
      ctx.fillStyle = PAL[v]
      ctx.fillRect(x + c * PX, y + r * PX, PX, PX)
    }
  const gx = x + 10 * PX, gy = y + 6 * PX
  ctx.save()
  ctx.globalAlpha = 0.45 + Math.sin(Date.now() * 0.004) * 0.3
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 16)
  g.addColorStop(0, 'rgba(80,255,220,0.9)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(gx - 16, gy - 16, 32, 32)
  ctx.restore()
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
    // Remove white/near-white background
    if (d[i] > 220 && d[i+1] > 220 && d[i+2] > 220) d[i+3] = 0
  }
  tc.putImageData(id, 0, 0)
  dragonCache = { canvas: tmp, fw, fh }
}
dragonSheet.src = 'src/images/dragon-sheet.png'

export function drawDragon(ctx, x, y, t) {
  if (!dragonCache) return
  const { canvas, fw, fh } = dragonCache
  // Cycle all 9 frames at ~10 fps
  const frame = Math.floor(t / 100) % (DRAGON_COLS * DRAGON_ROWS)
  const col   = frame % DRAGON_COLS
  const row   = Math.floor(frame / DRAGON_COLS)
  // Display at 30% of original frame size
  const dw = fw * 0.30
  const dh = fh * 0.30
  ctx.save()
  ctx.drawImage(canvas, col * fw, row * fh, fw, fh, x - dw / 2, y - dh / 2, dw, dh)
  ctx.restore()
}
