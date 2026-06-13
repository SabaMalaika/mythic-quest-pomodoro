const STORAGE_KEY = 'mqp-settings'

export function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      focus: s.focus ?? 25,
      short: s.short ?? 5,
      long:  s.long  ?? 15,
    }
  } catch {
    return { focus: 25, short: 5, long: 15 }
  }
}

function persistSettings(focus, short, long) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ focus, short, long }))
}

export class PomodoroTimer extends EventTarget {
  constructor() {
    super()
    const s = loadSettings()
    this.durations = { focus: s.focus * 60, short: s.short * 60, long: s.long * 60 }
    this.mode      = 'focus'
    this.timeLeft  = this.durations.focus
    this.running   = false
    this.sessions  = 0
    this._iv       = null
    this._lastTick = 0
  }

  get total() { return this.durations[this.mode] }

  toggle() {
    this.running = !this.running
    this.running ? this._start() : this._stop()
    this._emit('update')
  }

  reset() {
    this._stop()
    this.running  = false
    this.timeLeft = this.durations[this.mode]
    this._emit('update')
  }

  setMode(mode) {
    this._stop()
    this.running  = false
    this.mode     = mode
    this.timeLeft = this.durations[mode]
    this._emit('update')
  }

  updateDurations(focus, short, long) {
    this.durations = { focus: focus * 60, short: short * 60, long: long * 60 }
    persistSettings(focus, short, long)
    this.timeLeft = this.durations[this.mode]
    this._emit('update')
  }

  _start() {
    this._lastTick = Date.now()
    this._iv = setInterval(() => {
      const d = Math.floor((Date.now() - this._lastTick) / 1000)
      if (d < 1) return
      this._lastTick = Date.now()
      this.timeLeft  = Math.max(0, this.timeLeft - d)
      if (this.timeLeft === 0) {
        this._stop()
        this.running = false
        if (this.mode === 'focus') this.sessions++
        this._emit('complete')
        setTimeout(() => { this.timeLeft = this.durations[this.mode]; this._emit('update') }, 1200)
      } else {
        this._emit('update')
      }
    }, 200)
  }

  _stop() {
    clearInterval(this._iv)
    this._iv = null
  }

  _emit(type) {
    this.dispatchEvent(new CustomEvent(type))
  }
}
