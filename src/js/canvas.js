import { updateFlies, drawFlies } from './particles.js'
import { drawHero, drawDragon }   from './sprites.js'

// Layers already have proper RGBA alpha — draw directly, no pixel manipulation
const LAYERS = [
  { path: 'src/images/sky.png',        speed: 0     },
  { path: 'src/images/background.png', speed: 0.025 },
  { path: 'src/images/midground.png',  speed: 0.06  },
  { path: 'src/images/foreground.png', speed: 0.12  },
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
}
window.addEventListener('resize', resize)
resize()

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

  ctx.clearRect(0, 0, W, H)

  // sky, background, midground
  for (let i = 0; i < LAYER_FOREGROUND; i++) drawLayer(layerCache[i], LAYERS[i].speed)

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
}

requestAnimationFrame(render)
