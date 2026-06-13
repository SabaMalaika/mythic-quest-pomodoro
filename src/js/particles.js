// 8-bit pixel firefly: pre-render a small pixelated cross sprite per fly
function makePixelSprite(hue) {
  const p = 2   // pixel block size
  const r = p * 3  // sprite radius → 6px, total 12×12
  const c  = document.createElement('canvas')
  c.width  = r * 2
  c.height = r * 2
  const cx = c.getContext('2d')
  cx.imageSmoothingEnabled = false

  const bright = `hsl(${hue},100%,90%)`
  const mid    = `hsl(${hue},100%,65%)`

  // center 2×2
  cx.fillStyle = bright
  cx.fillRect(r - p, r - p, p * 2, p * 2)
  // cross arms (1 block out each direction)
  cx.fillStyle = mid
  cx.fillRect(r - p,     r - p * 3, p * 2, p * 2)  // top
  cx.fillRect(r - p,     r + p,     p * 2, p * 2)  // bottom
  cx.fillRect(r - p * 3, r - p,     p * 2, p * 2)  // left
  cx.fillRect(r + p,     r - p,     p * 2, p * 2)  // right

  return { canvas: c, r }
}

export const flies = Array.from({ length: 22 }, () => {
  const hue = 80 + Math.floor(Math.random() * 60)   // yellow-green range
  return {
    x:      Math.random() * 2560,
    y:      80 + Math.random() * 900,
    vx:     (Math.random() - 0.5) * 0.4,
    vy:     (Math.random() - 0.5) * 0.3,
    phase:  Math.random() * Math.PI * 2,
    sprite: makePixelSprite(hue),
  }
})

export function updateFlies(W, H, dt) {
  for (const f of flies) {
    f.x += f.vx - dt * 0.012
    f.y += f.vy
    f.vx += (Math.random() - 0.5) * 0.08
    f.vy += (Math.random() - 0.5) * 0.06
    f.vx *= 0.97
    f.vy *= 0.97
    if (f.x < -20)                 f.x = W + 20
    if (f.y < 60 || f.y > H * 0.88) f.vy *= -1
  }
}

export function drawFlies(ctx, t) {
  ctx.save()
  ctx.imageSmoothingEnabled = false
  for (const f of flies) {
    // stepped blink — on for ~60% of cycle, off hard (pixel style, no fade)
    const wave = Math.sin(t * 0.005 + f.phase) * 0.5 + 0.5
    const a = wave > 0.35 ? 0.55 + wave * 0.45 : 0
    if (a === 0) continue
    const { canvas, r } = f.sprite
    ctx.globalAlpha = a
    ctx.drawImage(canvas, Math.round(f.x) - r, Math.round(f.y) - r)
  }
  ctx.restore()
}
