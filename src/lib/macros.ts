import type { GestureMacro, MacroGesture } from './types'

export const MACRO_STORAGE_KEY = 'gesturenav-macros-v1'
export const MACRO_WINDOW_MS = 2500

export function loadMacros(): GestureMacro[] {
  try {
    const stored = localStorage.getItem(MACRO_STORAGE_KEY)
    return stored ? JSON.parse(stored) as GestureMacro[] : []
  } catch {
    return []
  }
}

export function saveMacros(macros: GestureMacro[]): void {
  try {
    localStorage.setItem(MACRO_STORAGE_KEY, JSON.stringify(macros))
  } catch {
    // Storage can be disabled by private browsing or browser policy.
  }
}

export class MacroRecognizer {
  private macros: GestureMacro[]
  private active: { macro: GestureMacro; nextStep: number; startedAt: number } | null = null

  constructor(macros: GestureMacro[]) {
    this.macros = macros
  }

  setMacros(macros: GestureMacro[]): void {
    this.macros = macros
  }

  process(gesture: MacroGesture, timestamp: number): { progress: string | null; triggered: GestureMacro | null } {
    if (this.active && timestamp - this.active.startedAt > MACRO_WINDOW_MS) this.active = null

    if (this.active) {
      if (gesture === this.active.macro.steps[this.active.nextStep]) {
        const triggered = this.active.nextStep === 1 ? this.active.macro : null
        if (triggered) {
          this.active = null
          return { progress: null, triggered }
        }
        this.active.nextStep = 1
        return { progress: `${this.active.macro.name}: step 2 of 2`, triggered: null }
      }
      this.active = null
    }

    const matchingMacro = this.macros.find((macro) => macro.steps[0] === gesture)
    if (!matchingMacro) return { progress: null, triggered: null }
    this.active = { macro: matchingMacro, nextStep: 1, startedAt: timestamp }
    return { progress: `${matchingMacro.name}: step 1 of 2`, triggered: null }
  }
}
