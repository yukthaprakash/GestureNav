import type { Landmark, PoseGesture } from './types'

export const RAISE_THRESHOLD = 0.15

export function getPoseRaiseRatio(landmarks: Landmark[]): number | null {
  if (landmarks.length < 17) return null
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftWrist = landmarks[15]
  const rightWrist = landmarks[16]
  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return null
  const shoulderWidth = distance(leftShoulder, rightShoulder)
  const torsoLength = Math.max(shoulderWidth, distance(leftShoulder, landmarks[23] ?? leftShoulder))
  return Math.max(leftShoulder.y - leftWrist.y, rightShoulder.y - rightWrist.y) / Math.max(torsoLength, 0.001)
}

function distance(first: Landmark, second: Landmark): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

export function classifyPoseGesture(landmarks: Landmark[], raiseThreshold = RAISE_THRESHOLD): PoseGesture {
  if (landmarks.length < 17) return 'none'

  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftWrist = landmarks[15]
  const rightWrist = landmarks[16]
  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return 'none'

  const shoulderWidth = distance(leftShoulder, rightShoulder)
  const torsoLength = Math.max(shoulderWidth, distance(leftShoulder, landmarks[23] ?? leftShoulder))
  const threshold = torsoLength * raiseThreshold
  const leftRaised = leftShoulder.y - leftWrist.y > threshold
  const rightRaised = rightShoulder.y - rightWrist.y > threshold

  if (leftRaised && !rightRaised) return 'left-arm-raised'
  if (rightRaised && !leftRaised) return 'right-arm-raised'
  return 'none'
}
