import { updateFlies, drawFlies } from './particles.js'
import { drawHero, drawDragon }   from './sprites.js'

// Layers already have proper RGBA alpha — draw directly, no pixel manipulation
const LAYERS = [
  { path: 'src/images/sky.png',        speed: 0     },
  { path: 'src/images/background.png', speed: 0.025 },
  { path: 'src/images/midground.png',  speed: 0.06  },
  { path: 'src/images/foreground.png', speed: 0.08  },
]
// Hero is drawn between LAYER_HERO_AFTER and foreground (last layer)
const LAYER_FOREGROUND = 3

const canvas = document.getElementById('bg-canvas')
const ctx    = canvas.getContext('2d')

let W   = window.innerWidth
let H   = window.innerHeight
let dpr = window.devicePixelRatio || 1

let layerCache = LAYERS.map(() => null)
let vigCache   = null

// ── Lightning state (declared here — before resize() call) ────────────────────
const BOLT_BLOCK  = 6
let bolt          = null
let nextBoltIn    = 5000 + Math.random() * 8000
let lastBoltTime  = -99999   // fire first bolt quickly

// ── Grain state (declared here — before resize() call) ────────────────────────
const GRAIN_BLOCK  = 2
const GRAIN_FRAMES = 6
let grainPool = []
let grainIdx  = 0

function buildCache(img) {
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
  const sw    = Math.ceil(img.naturalWidth  * scale)
  const sh    = Math.ceil(img.naturalHeight * scale)
  // Double-tile for seamless horizontal pan
  const c  = document.createElement('canvas')
  c.width  = sw * 2
  c.height = sh
  const cx = c.getContext('2d')
  cx.drawImage(img, 0,  0, sw, sh)
  cx.drawImage(img, sw, 0, sw, sh)
  return { canvas: c, sw, sh }
}

function buildVignette() {
  vigCache        = document.createElement('canvas')
  vigCache.width  = W
  vigCache.height = H
  const vc = vigCache.getContext('2d')
  const g  = vc.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.92)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(2,3,18,0.58)')
  vc.fillStyle = g
  vc.fillRect(0, 0, W, H)
}

const imgs = LAYERS.map(({ path }, i) => {
  const img  = new Image()
  img.onload = () => { layerCache[i] = buildCache(img) }
  img.src    = path
  return img
})

function resize() {
  dpr = window.devicePixelRatio || 1
  W   = window.innerWidth
  H   = window.innerHeight
  canvas.width  = W * dpr
  canvas.height = H * dpr
  canvas.style.width  = W + 'px'
  canvas.style.height = H + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  imgs.forEach((img, i) => {
    if (img.complete && img.naturalWidth) layerCache[i] = buildCache(img)
  })
  buildVignette()
  buildGrain()
}
window.addEventListener('resize', resize)
resize()

// Tap/click anywhere triggers a lightning bolt
canvas.addEventListener('click',      spawnBolt)
canvas.addEventListener('touchstart', spawnBolt, { passive: true })

export const scene = {
  scroll:    0,
  heroFrame: 0,
  running:   false,
  flash:     0,
  dragon:    null,
  lastEvent: 0,
}

function drawLayer(cache, speed) {
  if (!cache) return
  const { canvas: c, sw, sh } = cache
  const oy = Math.round((H - sh) / 2)
  const ox = ((scene.scroll * speed) % sw + sw) % sw
  ctx.drawImage(c, -ox, oy)
  if (-ox + c.width < W) ctx.drawImage(c, -ox + c.width, oy)
}

function maybeTriggerDragon(t) {
  if (!scene.dragon && Math.random() < 0.6)
    scene.dragon = { x: W + 160, y: H * 0.15, t }
}

// ── 8-bit lightning ───────────────────────────────────────────────────────────
function spawnBolt() {
  const x0 = W * 0.15 + Math.random() * W * 0.7
  const pts = [[Math.round(x0 / BOLT_BLOCK) * BOLT_BLOCK, 0]]
  let x = pts[0][0], y = 0
  for (let i = 0; i < 10; i++) {
    x += (Math.random() > 0.5 ? 1 : -1) * BOLT_BLOCK * (1 + Math.floor(Math.random() * 3))
    y += BOLT_BLOCK * (2 + Math.floor(Math.random() * 3))
    pts.push([Math.round(x / BOLT_BLOCK) * BOLT_BLOCK, Math.round(y / BOLT_BLOCK) * BOLT_BLOCK])
    if (y > H * 0.48) break
  }
  bolt = { pts, frame: 0 }
}

function drawBolt() {
  if (!bolt) return
  const { pts, frame } = bolt
  const alphas = [1, 0.85, 0.6, 0.35, 0.15, 0.05]
  const alpha  = alphas[frame] ?? 0
  if (alpha === 0) { bolt = null; return }

  ctx.save()
  ctx.imageSmoothingEnabled = false

  // sky flash
  if (frame < 2) {
    ctx.fillStyle = `rgba(210,230,255,${frame === 0 ? 0.22 : 0.10})`
    ctx.fillRect(0, 0, W, H * 0.7)
  }

  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]
    const dx = x2 - x1, dy = y2 - y1
    const steps = Math.max(1, Math.max(Math.abs(dx), Math.abs(dy)) / BOLT_BLOCK)
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const px = Math.round((x1 + dx * t) / BOLT_BLOCK) * BOLT_BLOCK
      const py = Math.round((y1 + dy * t) / BOLT_BLOCK) * BOLT_BLOCK
      // wide glow halo
      ctx.fillStyle = `rgba(160,210,255,${alpha * 0.4})`
      ctx.fillRect(px - BOLT_BLOCK * 2, py - BOLT_BLOCK, BOLT_BLOCK * 5, BOLT_BLOCK * 3)
      // bright core (2×2 blocks)
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.fillRect(px, py, BOLT_BLOCK * 2, BOLT_BLOCK * 2)
    }
  }
  ctx.restore()
  bolt.frame++
}

// ── Film grain (pre-rendered pixel noise frames) ──────────────────────────────
function buildGrain() {
  const gw = Math.ceil(W / GRAIN_BLOCK)
  const gh = Math.ceil(H / GRAIN_BLOCK)
  grainPool = Array.from({ length: GRAIN_FRAMES }, () => {
    const gc = document.createElement('canvas')
    gc.width = gw; gc.height = gh
    const gx = gc.getContext('2d')
    const id = gx.createImageData(gw, gh)
    const d  = id.data
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255
      d[i] = d[i+1] = d[i+2] = v
      d[i+3] = Math.floor(Math.random() * 180)
    }
    gx.putImageData(id, 0, 0)
    return gc
  })
}

const TARGET_MS = 1000 / 30
let lastTime = 0

function render(time) {
  requestAnimationFrame(render)
  const elapsed = time - lastTime
  if (elapsed < TARGET_MS) return
  lastTime = time - (elapsed % TARGET_MS)
  const dt = Math.min(elapsed, 50)

  scene.scroll += dt * 0.18
  updateFlies(W, H, dt)

  if (time - scene.lastEvent > 16000 + Math.random() * 8000) {
    scene.lastEvent = time
    maybeTriggerDragon(time)
  }
  if (scene.dragon) {
    scene.dragon.x -= dt * 0.09
    scene.dragon.t  = time
    if (scene.dragon.x < -200) scene.dragon = null
  }
  scene.heroFrame++

  // lightning trigger (random)
  if (time - lastBoltTime > nextBoltIn) {
    lastBoltTime = time
    nextBoltIn   = 6000 + Math.random() * 10000
    spawnBolt()
  }

  ctx.clearRect(0, 0, W, H)

  // sky
  drawLayer(layerCache[0], LAYERS[0].speed)
  // lightning lives in the sky, behind mountains
  drawBolt()
  // background, midground
  drawLayer(layerCache[1], LAYERS[1].speed)
  drawLayer(layerCache[2], LAYERS[2].speed)

  // hero between midground and foreground
  const heroX = Math.floor(W * 0.50)
  const heroY = Math.floor(H * 0.78)
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle   = '#000'
  ctx.beginPath()
  ctx.ellipse(heroX, heroY + 3, 20, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawHero(ctx, heroX, heroY, scene.heroFrame, !scene.running)

  // foreground on top of hero
  drawLayer(layerCache[LAYER_FOREGROUND], LAYERS[LAYER_FOREGROUND].speed)
  drawFlies(ctx, time)

  if (scene.dragon) drawDragon(ctx, scene.dragon.x, scene.dragon.y, time)

  if (vigCache) ctx.drawImage(vigCache, 0, 0)

  if (scene.flash > 0) {
    ctx.fillStyle = `rgba(100,220,255,${scene.flash.toFixed(3)})`
    ctx.fillRect(0, 0, W, H)
    scene.flash -= 0.016
  }

  // grain — topmost layer
  if (grainPool.length) {
    grainIdx = (grainIdx + 1) % GRAIN_FRAMES
    ctx.save()
    ctx.globalAlpha = 0.09
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(grainPool[grainIdx], 0, 0, W, H)
    ctx.restore()
  }
}

requestAnimationFrame(render)
