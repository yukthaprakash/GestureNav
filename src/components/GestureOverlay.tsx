import { useEffect, useRef } from 'react'
import type { TrackingSnapshot } from '../hooks/useMultiTracking'
import type { TrackingStatus } from '../lib/types'

type GestureOverlayProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  snapshot: TrackingSnapshot
  status: TrackingStatus
  debug: boolean
  cameraEnabled: boolean
  onToggleCamera: () => void
}

export function GestureOverlay({ videoRef, snapshot, status, debug, cameraEnabled, onToggleCamera }: GestureOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    const context = canvas.getContext('2d')
    if (!context) return

    const width = video.clientWidth || 640
    const height = video.clientHeight || 360
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)
    context.strokeStyle = snapshot.isPaused ? '#f07b52' : '#a9e66f'
    context.lineWidth = 2
    context.strokeRect(12, 12, width - 24, height - 24)
  }, [snapshot, videoRef])

  const stateLabel = status === 'paused' || snapshot.isPaused ? 'Paused while looking away' : status === 'ready' ? 'Tracking active' : status
  return (
    <div className="tracking-card">
      <div className="video-frame">
        {cameraEnabled ? <video ref={videoRef} autoPlay muted playsInline aria-label="Live camera preview" /> : (
          <div className="camera-off-placeholder" role="status">
            <span className="camera-off-icon" aria-hidden="true">◌</span>
            <strong>Camera off</strong>
            <span>Keyboard arrows still work</span>
          </div>
        )}
        {cameraEnabled && debug && <canvas ref={canvasRef} className="debug-canvas" aria-hidden="true" />}
        <div className="tracking-badge" data-status={status}>
          <span className="status-dot" aria-hidden="true" />
          {stateLabel}
        </div>
      </div>
      <div className="tracking-readout" aria-live="polite">
        <span>Hands: {snapshot.hands.length ? snapshot.hands.join(', ') : 'not detected'}</span>
        <span>Pose: {snapshot.pose === 'none' ? 'neutral' : snapshot.pose}</span>
        <span>Face: {snapshot.face === 'none' ? 'neutral' : snapshot.face}</span>
        <button className="camera-toggle" type="button" onClick={onToggleCamera} aria-pressed={cameraEnabled}>
          {cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
        </button>
      </div>
    </div>
  )
}
