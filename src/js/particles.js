// Pre-render one glow sprite per fly (done once at startup, not per frame)
function makeGlowSprite(size, hue) {
  const r  = Math.ceil(size * 5)
  const c  = document.createElement('canvas')
  c.width  = r * 2
  c.height = r * 2
  const cx = c.getContext('2d')
  const g  = cx.createRadialGradient(r, r, 0, r, r, r)
  g.addColorStop(0, `hsl(${hue},100%,88%)`)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  cx.fillStyle = g
  cx.fillRect(0, 0, r * 2, r * 2)
  return { canvas: c, r }
}

export const flies = Array.from({ length: 22 }, () => {
  const size = 1.4 + Math.random() * 2.2
  const hue  = 80 + Math.floor(Math.random() * 60)
  return {
    x:      Math.random() * 2560,
    y:      80 + Math.random() * 900,
    vx:     (Math.random() - 0.5) * 0.4,
    vy:     (Math.random() - 0.5) * 0.3,
    phase:  Math.random() * Math.PI * 2,
    sprite: makeGlowSprite(size, hue),
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
    if (f.x < -20)               f.x = W + 20
    if (f.y < 60 || f.y > H * 0.88) f.vy *= -1
  }
}

export function drawFlies(ctx, t) {
  for (const f of flies) {
    const a = (Math.sin(t * 0.005 + f.phase) * 0.5 + 0.5) *
              (0.4 + Math.sin(t * 0.009 + f.phase * 2) * 0.4)
    if (a < 0.05) continue
    const { canvas, r } = f.sprite
    ctx.save()
    ctx.globalAlpha = a
    ctx.drawImage(canvas, f.x - r, f.y - r)  // no gradient creation — just blit
    ctx.restore()
  }
}
