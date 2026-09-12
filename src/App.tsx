import { useEffect, useRef, useState } from 'react'
import './App.css'
import { DemoPage } from './components/DemoPage'
import { GestureOverlay } from './components/GestureOverlay'
import { Onboarding } from './components/Onboarding'
import { useMultiTracking } from './hooks/useMultiTracking'
import { ACTION_LABELS } from './lib/actionLabels'
import type { ActionType, GestureEvent } from './lib/types'

function App() {
  const [started, setStarted] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
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
  }

  const { status, error, snapshot } = useMultiTracking(videoRef, handleGesture, started && cameraEnabled)

  const onAction = (action: 'scroll-up' | 'scroll-down' | 'select') => {
    performAction(action)
    setLastEvent({ action, source: 'system', label: ACTION_LABELS[action], timestamp: performance.now() })
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

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="GestureNav home">Gesture<span>Nav</span></a>
        <div className="header-status"><span className="status-dot" />{started && cameraEnabled ? status : 'camera off'}</div>
      </header>
      <div id="top" className="top-grid">
        {!started ? <Onboarding onStart={() => { setCameraEnabled(true); setStarted(true) }} error={error} isMobile={isMobile} /> : (
          <section className="active-console" aria-labelledby="console-title">
            <div>
              <p className="kicker">Control surface</p>
              <h1 id="console-title">The page is listening.</h1>
              <p className="lede">Use your body to explore the guide below. Keyboard arrows always work too.</p>
              {error && <p className="error-message" role="alert">{error}</p>}
              {error && <button className="secondary-button" type="button" onClick={() => setStarted(false)}>Return to camera setup</button>}
              {lastEvent && <p className="last-action" aria-live="polite">Last action: <strong>{lastEvent.label}</strong></p>}
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
