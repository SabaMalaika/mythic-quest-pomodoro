import { PomodoroTimer, loadSettings } from './timer.js'
import { scene } from './canvas.js'

const timer = new PomodoroTimer()

// ── DOM refs ──────────────────────────────────────────────────────────────────
const panel       = document.getElementById('timer-panel')
const dragBar     = document.getElementById('drag-bar')
const minimizeBtn = document.getElementById('minimize-btn')
const miniPill    = document.getElementById('mini-pill')
const miniTime    = document.getElementById('mini-time')
const miniStart   = document.getElementById('mini-start')
const miniExpand  = document.getElementById('mini-expand')
const timerDisplay  = document.getElementById('timer-display')
const progressBar   = document.getElementById('progress-bar')
const startBtn      = document.getElementById('start-btn')
const resetBtn      = document.getElementById('reset-btn')
const settingsBtn   = document.getElementById('settings-btn')
const settingsPanel = document.getElementById('settings-panel')
const modeBtns      = document.querySelectorAll('.mode-btn')
const gemsEl        = document.getElementById('gems')
const countEl       = document.getElementById('session-count')
const statusEl      = document.getElementById('status-bar')
const setFocus      = document.getElementById('set-focus')
const setShort      = document.getElementById('set-short')
const setLong       = document.getElementById('set-long')
const saveBtn       = document.getElementById('settings-save')
const closeBtn      = document.getElementById('settings-close')

// ── UI update ─────────────────────────────────────────────────────────────────
function fmt(s) {
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

function updateUI() {
  const t = fmt(timer.timeLeft)
  timerDisplay.textContent = t
  miniTime.textContent     = t

  const pct = (1 - timer.timeLeft / timer.total) * 100
  progressBar.style.width = pct + '%'

  const filled = timer.sessions % 4
  gemsEl.innerHTML = Array.from({ length: 4 }, (_, i) =>
    `<span style="color:${i < filled ? 'rgba(56,212,196,0.9)' : 'rgba(56,100,120,0.3)'};` +
    `text-shadow:${i < filled ? '0 0 8px rgba(56,212,196,0.6)' : 'none'}">${i < filled ? '◆' : '◇'}</span>`
  ).join('')
  countEl.textContent = `(${timer.sessions})`

  const running = timer.running
  statusEl.textContent   = running ? '► THE QUEST CONTINUES...' : '■ THE HEROINE RESTS'
  startBtn.textContent   = running ? 'PAUSE' : 'START'
  startBtn.className     = running ? 'paused' : ''
  miniStart.textContent  = running ? '⏸' : '▶'
  scene.running          = running
}

// ── Timer events ──────────────────────────────────────────────────────────────
timer.addEventListener('update', updateUI)
timer.addEventListener('complete', () => {
  scene.flash = 0.7
  if (timer.mode === 'focus' && !scene.dragon)
    scene.dragon = { x: window.innerWidth + 160, y: window.innerHeight * 0.15, t: 0 }
  updateUI()
})

// ── Controls ──────────────────────────────────────────────────────────────────
startBtn.addEventListener('click',    () => timer.toggle())
resetBtn.addEventListener('click',    () => timer.reset())
miniStart.addEventListener('click',   () => timer.toggle())

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    timer.setMode(btn.dataset.mode)
  })
})

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return
  if (e.code === 'Space') { e.preventDefault(); timer.toggle() }
  if (e.code === 'KeyR')  timer.reset()
})

// ── Settings ──────────────────────────────────────────────────────────────────
settingsBtn.addEventListener('click', () => {
  const s = loadSettings()
  setFocus.value = s.focus; setShort.value = s.short; setLong.value = s.long
  settingsPanel.hidden = false
})
closeBtn.addEventListener('click', () => { settingsPanel.hidden = true })
saveBtn.addEventListener('click', () => {
  timer.updateDurations(
    Math.max(1, Math.min(99, +setFocus.value || 25)),
    Math.max(1, Math.min(30, +setShort.value || 5)),
    Math.max(1, Math.min(60, +setLong.value  || 15))
  )
  settingsPanel.hidden = true
  updateUI()
})

// ── Drag — full panel ─────────────────────────────────────────────────────────
let dragging = false, dox = 0, doy = 0

dragBar.addEventListener('mousedown', e => {
  if (e.target === minimizeBtn) return
  dragging = true
  const r = panel.getBoundingClientRect()
  dox = e.clientX - r.left
  doy = e.clientY - r.top
  panel.style.transform = 'none'
  panel.style.left      = r.left + 'px'
  panel.style.top       = r.top  + 'px'
  e.preventDefault()
})
document.addEventListener('mousemove', e => {
  if (!dragging) return
  panel.style.left = (e.clientX - dox) + 'px'
  panel.style.top  = (e.clientY - doy) + 'px'
})
document.addEventListener('mouseup', () => { dragging = false })

// ── Drag — mini pill ──────────────────────────────────────────────────────────
let mdrag = false, mdx = 0, mdy = 0

miniPill.addEventListener('mousedown', e => {
  if (e.target === miniStart || e.target === miniExpand) return
  mdrag = true
  const r = miniPill.getBoundingClientRect()
  mdx = e.clientX - r.left
  mdy = e.clientY - r.top
  miniPill.style.transform = 'none'
  miniPill.style.bottom    = 'auto'
  miniPill.style.left      = r.left + 'px'
  miniPill.style.top       = r.top  + 'px'
  e.preventDefault()
})
document.addEventListener('mousemove', e => {
  if (!mdrag) return
  miniPill.style.left = (e.clientX - mdx) + 'px'
  miniPill.style.top  = (e.clientY - mdy) + 'px'
})
document.addEventListener('mouseup', () => { mdrag = false })

// ── Minimise toggle ───────────────────────────────────────────────────────────
function setMinimised(on) {
  panel.hidden    = on
  miniPill.hidden = !on
}
minimizeBtn.addEventListener('click', () => setMinimised(true))
miniExpand.addEventListener('click',  () => setMinimised(false))

// ── Init ──────────────────────────────────────────────────────────────────────
updateUI()
