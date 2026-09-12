import { useEffect, useRef, useState } from 'react'
import './App.css'
import { DemoPage } from './components/DemoPage'
import { CalibrationPanel } from './components/CalibrationPanel'
import { MacroPanel } from './components/MacroPanel'
import { GestureOverlay } from './components/GestureOverlay'
import { Onboarding } from './components/Onboarding'
import { useMultiTracking } from './hooks/useMultiTracking'
import { ACTION_LABELS } from './lib/actionLabels'
import { loadCalibrationProfile, resetCalibrationProfile, saveCalibrationProfile } from './lib/calibration'
import { loadMacros, saveMacros, MacroRecognizer } from './lib/macros'
import type { ActionType, CalibrationProfile, GestureEvent, GestureMacro } from './lib/types'

function App() {
  const [started, setStarted] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [calibrating, setCalibrating] = useState(false)
  const [showMacros, setShowMacros] = useState(false)
  const [calibrationProfile, setCalibrationProfile] = useState<CalibrationProfile>(loadCalibrationProfile)
  const [macros, setMacros] = useState<GestureMacro[]>(loadMacros)
  const [macroStatus, setMacroStatus] = useState<string | null>(null)
  const [lastEvent, setLastEvent] = useState<GestureEvent | null>(null)
  const [isMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches || navigator.maxTouchPoints > 1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRefs = [
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
  ]
  const macroRecognizerRef = useRef(new MacroRecognizer(macros))
  const macroStatusTimerRef = useRef<number | null>(null)
  const debug = new URLSearchParams(window.location.search).get('debug') === 'true'

  const performAction = (action: ActionType) => {
    if (action === 'scroll-up') window.scrollBy({ top: -window.innerHeight * 0.72, behavior: 'smooth' })
    if (action === 'scroll-down') window.scrollBy({ top: window.innerHeight * 0.72, behavior: 'smooth' })
    if (action === 'select') document.querySelector<HTMLElement>(':focus')?.click()
  }

  const moveSection = (direction: 1 | -1) => {
    const current = sectionRefs.findIndex((ref) => {
      const element = ref.current
      return element ? element.getBoundingClientRect().top >= -window.innerHeight / 2 : false
    })
    const nextIndex = Math.min(Math.max((current < 0 ? 0 : current) + direction, 0), sectionRefs.length - 1)
    sectionRefs[nextIndex].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleGesture = (event: GestureEvent) => {
    setLastEvent(event)
    if (event.action === 'next-section') moveSection(1)
    if (event.action === 'previous-section') moveSection(-1)
    performAction(event.action)
    if (event.gesture) {
      const result = macroRecognizerRef.current.process(event.gesture, event.timestamp)
      setMacroStatus(result.progress)
      if (macroStatusTimerRef.current !== null) window.clearTimeout(macroStatusTimerRef.current)
      if (result.progress) {
        macroStatusTimerRef.current = window.setTimeout(() => setMacroStatus(null), 2500)
      }
      if (result.triggered) {
        performAction(result.triggered.action)
        setLastEvent({ action: result.triggered.action, source: 'system', label: `Macro: ${result.triggered.name}`, timestamp: event.timestamp })
        setMacroStatus(`${result.triggered.name} complete`)
        macroStatusTimerRef.current = window.setTimeout(() => setMacroStatus(null), 1800)
      }
    }
  }

  const { status, error, snapshot, metrics, adaptiveNotice, fallbackSuggestion } = useMultiTracking(videoRef, handleGesture, started && cameraEnabled, calibrationProfile)

  const onAction = (action: 'scroll-up' | 'scroll-down' | 'select') => {
    performAction(action)
    setLastEvent({ action, source: 'system', label: ACTION_LABELS[action], timestamp: performance.now() })
  }

  const startCalibration = () => {
    setCameraEnabled(true)
    setStarted(true)
    setCalibrating(true)
  }

  const finishCalibration = (profile: CalibrationProfile) => {
    saveCalibrationProfile(profile)
    setCalibrationProfile(profile)
    setCalibrating(false)
  }

  const clearCalibration = () => {
    const defaults = resetCalibrationProfile()
    setCalibrationProfile(defaults)
  }

  const updateMacros = (nextMacros: GestureMacro[]) => {
    setMacros(nextMacros)
    saveMacros(nextMacros)
    macroRecognizerRef.current.setMacros(nextMacros)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        performAction('scroll-down')
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        performAction('scroll-up')
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveSection(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveSection(-1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => () => {
    if (macroStatusTimerRef.current !== null) window.clearTimeout(macroStatusTimerRef.current)
  }, [])

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="GestureNav home">Gesture<span>Nav</span></a>
        <div className="header-status"><span className="status-dot" />{started && cameraEnabled ? status : 'camera off'}</div>
      </header>
      <div id="top" className="top-grid">
        {!started ? <Onboarding onStart={() => { setCameraEnabled(true); setStarted(true) }} onCalibrate={startCalibration} error={error} isMobile={isMobile} /> : (
          <section className="active-console" aria-labelledby="console-title">
            <div className="console-copy">
              {calibrating ? <CalibrationPanel metrics={metrics} profile={calibrationProfile} onComplete={finishCalibration} onCancel={() => setCalibrating(false)} /> : showMacros ? <MacroPanel macros={macros} onChange={updateMacros} onClose={() => setShowMacros(false)} /> : <>
              <p className="kicker">Control surface</p>
              <h1 id="console-title">The page is listening.</h1>
              <p className="lede">Use your body to explore the guide below. Keyboard arrows always work too.</p>
              {error && <p className="error-message" role="alert">{error}</p>}
              {error && <button className="secondary-button" type="button" onClick={() => setStarted(false)}>Return to camera setup</button>}
              {adaptiveNotice && <p className="adaptive-notice" role="status">{adaptiveNotice}</p>}
              {fallbackSuggestion && <p className="fallback-suggestion" role="status">{fallbackSuggestion}</p>}
              {lastEvent && <p className="last-action" aria-live="polite">Last action: <strong>{lastEvent.label}</strong></p>}
              <div className="profile-actions">
                <button className="secondary-button" type="button" onClick={() => setCalibrating(true)}>Recalibrate gestures</button>
                <button className="secondary-button" type="button" onClick={() => setShowMacros(true)}>Manage gesture macros</button>
                <button className="text-button" type="button" onClick={clearCalibration}>Reset to defaults</button>
              </div>
              {macroStatus && <p className="macro-status" role="status">{macroStatus}</p>}
              </>}
            </div>
            <GestureOverlay
              videoRef={videoRef}
              snapshot={snapshot}
              status={status}
              debug={debug}
              cameraEnabled={cameraEnabled}
              onToggleCamera={() => setCameraEnabled((enabled) => !enabled)}
            />
          </section>
        )}
      </div>
      <DemoPage sectionRefs={sectionRefs} onAction={onAction} />
      <footer className="site-footer">
        <div><strong>How it works</strong><span>MediaPipe runs in your browser and interprets camera frames locally. GestureNav does not collect, upload, or persist video or personal data.</span></div>
        <a href="?debug=true">debug view</a>
      </footer>
    </div>
  )
}

export default App
