import type { FaceGesture, Landmark } from './types'

export const TILT_THRESHOLD_DEG = 12
export const YAW_Z_THRESHOLD = 0.04
export const YAW_NOSE_THRESHOLD = 0.35

export function getHeadTiltDegrees(landmarks: Landmark[]): number | null {
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  if (!leftEye || !rightEye) return null
  return angleInDegrees(leftEye, rightEye)
}

function angleInDegrees(first: Landmark, second: Landmark): number {
  return Math.atan2(second.y - first.y, second.x - first.x) * (180 / Math.PI)
}

export function classifyHeadTilt(landmarks: Landmark[], tiltThresholdDeg = TILT_THRESHOLD_DEG): FaceGesture {
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  if (!leftEye || !rightEye) return 'none'

  const tilt = angleInDegrees(leftEye, rightEye)
  if (Math.abs(tilt) < tiltThresholdDeg) return 'none'
  return tilt > 0 ? 'tilt-right' : 'tilt-left'
}

export function isLookingAway(landmarks: Landmark[], yawZThreshold = YAW_Z_THRESHOLD, yawNoseThreshold = YAW_NOSE_THRESHOLD): boolean {
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]
  const nose = landmarks[1]
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  if (!leftCheek || !rightCheek || !nose || !leftEye || !rightEye) return false

  const cheekDepthDifference = Math.abs((leftCheek.z ?? 0) - (rightCheek.z ?? 0))
  const eyeMidpoint = (leftEye.x + rightEye.x) / 2
  const noseDrift = Math.abs(nose.x - eyeMidpoint) / Math.max(Math.abs(rightEye.x - leftEye.x), 0.001)
  return cheekDepthDifference > yawZThreshold || noseDrift > yawNoseThreshold
}

export function classifyFaceGesture(landmarks: Landmark[], config: { tiltThresholdDeg?: number; yawZThreshold?: number; yawNoseThreshold?: number } = {}): FaceGesture {
  if (isLookingAway(landmarks, config.yawZThreshold, config.yawNoseThreshold)) return 'look-away'
  return classifyHeadTilt(landmarks, config.tiltThresholdDeg)
}
