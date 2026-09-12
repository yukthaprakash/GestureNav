import { useState } from 'react'
import type { ActionType, GestureMacro, MacroGesture } from '../lib/types'

type MacroPanelProps = {
  macros: GestureMacro[]
  onChange: (macros: GestureMacro[]) => void
  onClose: () => void
}

const GESTURES: Array<{ value: MacroGesture; label: string }> = [
  { value: 'open-palm', label: 'Open palm' },
  { value: 'fist', label: 'Fist' },
  { value: 'pinch', label: 'Pinch' },
  { value: 'swipe-left', label: 'Swipe left' },
  { value: 'swipe-right', label: 'Swipe right' },
  { value: 'left-arm-raised', label: 'Left arm raised' },
  { value: 'right-arm-raised', label: 'Right arm raised' },
  { value: 'tilt-left', label: 'Head tilt left' },
  { value: 'tilt-right', label: 'Head tilt right' },
]

const ACTIONS: Array<{ value: Exclude<ActionType, 'none' | 'pause'>; label: string }> = [
  { value: 'scroll-up', label: 'Scroll up' },
  { value: 'scroll-down', label: 'Scroll down' },
  { value: 'next-section', label: 'Next section' },
  { value: 'previous-section', label: 'Previous section' },
  { value: 'select', label: 'Select focused control' },
]

function labelForGesture(gesture: MacroGesture): string {
  return GESTURES.find((item) => item.value === gesture)?.label ?? gesture
}

function createId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}`
}

export function MacroPanel({ macros, onChange, onClose }: MacroPanelProps) {
  const [name, setName] = useState('My gesture macro')
  const [firstStep, setFirstStep] = useState<MacroGesture>('right-arm-raised')
  const [secondStep, setSecondStep] = useState<MacroGesture>('tilt-right')
  const [action, setAction] = useState<Exclude<ActionType, 'none' | 'pause'>>('next-section')

  const addMacro = () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    onChange([...macros, { id: createId(), name: trimmedName, steps: [firstStep, secondStep], action }])
    setName('My gesture macro')
  }

  return (
    <section className="macro-panel" aria-labelledby="macro-title">
      <div className="macro-panel-header">
        <div>
          <p className="kicker">Personal shortcuts</p>
          <h2 id="macro-title">Gesture macros</h2>
          <p>Chain two gestures within 2.5 seconds to trigger one navigation action.</p>
        </div>
        <button className="text-button" type="button" onClick={onClose}>Close</button>
      </div>
      <div className="macro-builder">
        <label>Macro name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Step 1<select value={firstStep} onChange={(event) => setFirstStep(event.target.value as MacroGesture)}>{GESTURES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>Step 2<select value={secondStep} onChange={(event) => setSecondStep(event.target.value as MacroGesture)}>{GESTURES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>Action<select value={action} onChange={(event) => setAction(event.target.value as Exclude<ActionType, 'none' | 'pause'>)}>{ACTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button className="primary-button" type="button" onClick={addMacro}>Save macro</button>
      </div>
      <div className="macro-list">
        {macros.length === 0 && <p className="macro-empty">No macros yet. Create one above to make a shortcut that feels like yours.</p>}
        {macros.map((macro) => (
          <div className="macro-row" key={macro.id}>
            <div><strong>{macro.name}</strong><span>{labelForGesture(macro.steps[0])} + {labelForGesture(macro.steps[1])}</span></div>
            <div><span>{ACTIONS.find((item) => item.value === macro.action)?.label}</span><button className="text-button" type="button" onClick={() => onChange(macros.filter((item) => item.id !== macro.id))}>Delete</button></div>
          </div>
        ))}
      </div>
    </section>
  )
}
