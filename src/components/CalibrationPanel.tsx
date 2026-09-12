import { useState } from 'react'
import type { TrackingMetrics } from '../hooks/useMultiTracking'
import type { CalibrationProfile } from '../lib/types'

type CalibrationPanelProps = {
  metrics: TrackingMetrics
  profile: CalibrationProfile
  onComplete: (profile: CalibrationProfile) => void
  onCancel: () => void
}

type StepId = 'pinch' | 'extension' | 'swipe' | 'raise' | 'tilt'
type Step = { id: StepId; title: string; instruction: string; metric: keyof TrackingMetrics }

const STEPS: Step[] = [
  { id: 'pinch', title: 'Pinch for select', instruction: 'Pinch your thumb and index finger together, then click Capture three times.', metric: 'pinchDistance' },
  { id: 'extension', title: 'Open palm for scroll down', instruction: 'Show your most comfortable open palm shape, then click Capture three times.', metric: 'handExtensionRatio' },
  { id: 'swipe', title: 'Swipe for sections', instruction: 'Swipe in either direction once, then click Capture three times near the end of each swipe.', metric: 'swipeDistance' },
  { id: 'raise', title: 'Raise an arm for sections', instruction: 'Raise either arm as high as feels comfortable, then click Capture three times.', metric: 'poseRaiseRatio' },
  { id: 'tilt', title: 'Tilt for scrolling', instruction: 'Tilt your head as far as feels comfortable, then click Capture three times.', metric: 'headTiltDegrees' },
]

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function buildProfile(profile: CalibrationProfile, samples: Record<StepId, number[]>): CalibrationProfile {
  const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
  const next = { ...profile }
  if (samples.pinch.length) next.pinchThreshold = clamp(Math.max(...samples.pinch) * 1.25, 0.12, 0.35)
  if (samples.extension.length) next.handExtensionRatio = clamp(Math.min(...samples.extension) * 0.9, 1.05, 1.6)
  if (samples.swipe.length) next.swipeDistanceThreshold = clamp(average(samples.swipe) * 0.65, 0.08, 0.45)
  if (samples.raise.length) next.raiseThreshold = clamp(average(samples.raise) * 0.75, 0.08, 0.4)
  if (samples.tilt.length) next.tiltThresholdDeg = clamp(average(samples.tilt) * 0.7, 6, 24)
  return next
}

export function CalibrationPanel({ metrics, profile, onComplete, onCancel }: CalibrationPanelProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [samples, setSamples] = useState<Record<StepId, number[]>>({ pinch: [], extension: [], swipe: [], raise: [], tilt: [] })
  const [message, setMessage] = useState('')
  const step = STEPS[stepIndex]
  const captured = samples[step.id].length
  const value = metrics[step.metric]
  const displayValue = typeof value === 'number' ? value.toFixed(3) : 'Waiting for a matching gesture'

  const capture = () => {
    if (typeof value !== 'number' || value <= 0) {
      setMessage('No matching movement detected yet. Keep the gesture in frame and try again.')
      return
    }
    const nextSamples = { ...samples, [step.id]: [...samples[step.id], Math.abs(value)] }
    setSamples(nextSamples)
    setMessage(`Sample ${captured + 1} of 3 captured.`)
    if (captured + 1 === 3) {
      if (stepIndex === STEPS.length - 1) {
        onComplete(buildProfile(profile, nextSamples))
      } else {
        setStepIndex(stepIndex + 1)
        setMessage('Great. Moving to the next gesture.')
      }
    }
  }

  return (
    <section className="calibration-panel" aria-labelledby="calibration-title">
      <div>
        <p className="kicker">Personal setup / step {stepIndex + 1} of {STEPS.length}</p>
        <h1 id="calibration-title">Calibrate your gestures.</h1>
        <p className="lede">Use movements that feel natural to you. Three samples per gesture create a profile saved only in this browser.</p>
      </div>
      <div className="calibration-card">
        <div className="calibration-progress" aria-label={`Calibration progress: ${captured} of 3 samples`}>
          {STEPS.map((item, index) => <span key={item.id} className={index <= stepIndex ? 'is-active' : ''} />)}
        </div>
        <p className="kicker">Now calibrating</p>
        <h2>{step.title}</h2>
        <p>{step.instruction}</p>
        <output className="calibration-reading" aria-live="polite">Live reading: {displayValue}</output>
        <div className="calibration-actions">
          <button className="primary-button" type="button" onClick={capture}>Capture sample ({captured}/3)</button>
          <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
        </div>
        {message && <p className="calibration-message" role="status">{message}</p>}
      </div>
    </section>
  )
}
