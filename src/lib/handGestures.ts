import type { HandGesture, Landmark } from './types'

export const PINCH_THRESHOLD = 0.22
export const EXTENSION_RATIO = 1.25

const FINGER_PAIRS = [
  [8, 6],
  [12, 10],
  [16, 14],
  [20, 18],
] as const

function distance(first: Landmark, second: Landmark): number {
  return Math.hypot(first.x - second.x, first.y - second.y, (first.z ?? 0) - (second.z ?? 0))
}

function isFingerExtended(landmarks: Landmark[], tipIndex: number, jointIndex: number): boolean {
  const wrist = landmarks[0]
  const tip = landmarks[tipIndex]
  const joint = landmarks[jointIndex]
  if (!wrist || !tip || !joint) return false
  return distance(tip, wrist) > distance(joint, wrist) * EXTENSION_RATIO
}

export function classifyHandGesture(landmarks: Landmark[]): HandGesture {
  if (landmarks.length < 21) return 'none'

  const pinchDistance = distance(landmarks[4], landmarks[8])
  if (pinchDistance < PINCH_THRESHOLD) return 'pinch'

  const extendedCount = FINGER_PAIRS.filter(([tip, joint]) =>
    isFingerExtended(landmarks, tip, joint),
  ).length

  if (extendedCount >= 3) return 'open-palm'
  if (extendedCount === 0) return 'fist'
  return 'none'
}

export class SwipeDetector {
  private readonly samples: Array<{ x: number; timestamp: number }> = []
  private readonly windowMs: number
  private readonly distanceThreshold: number

  constructor(windowMs = 500, distanceThreshold = 0.22) {
    this.windowMs = windowMs
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
