import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

export type ActionType =
  | 'scroll-up'
  | 'scroll-down'
  | 'next-section'
  | 'previous-section'
  | 'select'
  | 'pause'
  | 'none'

export type InputSource = 'hand' | 'pose' | 'face' | 'system'

export type TrackingStatus = 'idle' | 'loading' | 'ready' | 'error' | 'paused'

export type GestureEvent = {
  action: ActionType
  source: InputSource
  label: string
  timestamp: number
}

export type HandGesture = 'open-palm' | 'fist' | 'pinch' | 'none'
export type PoseGesture = 'left-arm-raised' | 'right-arm-raised' | 'none'
export type FaceGesture = 'tilt-left' | 'tilt-right' | 'look-away' | 'none'

export type Landmark = NormalizedLandmark

export type CalibrationProfile = {
  pinchThreshold: number
  handExtensionRatio: number
  swipeDistanceThreshold: number
  raiseThreshold: number
  tiltThresholdDeg: number
  yawZThreshold: number
  yawNoseThreshold: number
}
