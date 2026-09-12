import type { HandGesture, Landmark } from './types'

export const PINCH_THRESHOLD = 0.22
export const EXTENSION_RATIO = 1.25

export type HandGestureConfig = {
  pinchThreshold?: number
  extensionRatio?: number
}

const FINGER_PAIRS = [
  [8, 6],
  [12, 10],
  [16, 14],
  [20, 18],
] as const

function distance(first: Landmark, second: Landmark): number {
  return Math.hypot(first.x - second.x, first.y - second.y, (first.z ?? 0) - (second.z ?? 0))
}

function isFingerExtended(landmarks: Landmark[], tipIndex: number, jointIndex: number, extensionRatio: number): boolean {
  const wrist = landmarks[0]
  const tip = landmarks[tipIndex]
  const joint = landmarks[jointIndex]
  if (!wrist || !tip || !joint) return false
  return distance(tip, wrist) > distance(joint, wrist) * extensionRatio
}

export function getPinchDistance(landmarks: Landmark[]): number | null {
  if (landmarks.length < 21) return null
  return distance(landmarks[4], landmarks[8])
}

export function getHandExtensionRatio(landmarks: Landmark[]): number | null {
  if (landmarks.length < 21) return null
  const ratios = FINGER_PAIRS.map(([tip, joint]) => {
    const wrist = landmarks[0]
    const tipLandmark = landmarks[tip]
    const jointLandmark = landmarks[joint]
    return distance(tipLandmark, wrist) / Math.max(distance(jointLandmark, wrist), 0.001)
  })
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
}

export function classifyHandGesture(landmarks: Landmark[], config: HandGestureConfig = {}): HandGesture {
  if (landmarks.length < 21) return 'none'

  const pinchDistance = getPinchDistance(landmarks)
  if (pinchDistance !== null && pinchDistance < (config.pinchThreshold ?? PINCH_THRESHOLD)) return 'pinch'
  const extensionRatio = config.extensionRatio ?? EXTENSION_RATIO

  const extendedCount = FINGER_PAIRS.filter(([tip, joint]) =>
    isFingerExtended(landmarks, tip, joint, extensionRatio),
  ).length

  if (extendedCount >= 3) return 'open-palm'
  if (extendedCount === 0) return 'fist'
  return 'none'
}

export class SwipeDetector {
  private readonly samples: Array<{ x: number; timestamp: number }> = []
  private readonly windowMs: number
  private distanceThreshold: number

  constructor(windowMs = 500, distanceThreshold = 0.22) {
    this.windowMs = windowMs
    this.distanceThreshold = distanceThreshold
  }

  getDistance(): number {
    if (this.samples.length < 2) return 0
    return Math.abs(this.samples[this.samples.length - 1].x - this.samples[0].x)
  }

  setDistanceThreshold(distanceThreshold: number): void {
    this.distanceThreshold = distanceThreshold
  }

  update(x: number, timestamp = performance.now()): 'swipe-left' | 'swipe-right' | null {
    this.samples.push({ x, timestamp })
    while (this.samples.length > 0 && timestamp - this.samples[0].timestamp > this.windowMs) {
      this.samples.shift()
    }

    const first = this.samples[0]
    if (!first || timestamp - first.timestamp < 120) return null

    const delta = x - first.x
    if (Math.abs(delta) < this.distanceThreshold) return null

    this.samples.length = 0
    return delta > 0 ? 'swipe-right' : 'swipe-left'
  }

  reset(): void {
    this.samples.length = 0
  }
}
