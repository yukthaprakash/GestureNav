import type { Landmark, PoseGesture } from './types'

export const RAISE_THRESHOLD = 0.15

function distance(first: Landmark, second: Landmark): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

export function classifyPoseGesture(landmarks: Landmark[]): PoseGesture {
  if (landmarks.length < 17) return 'none'

  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]
  const leftWrist = landmarks[15]
  const rightWrist = landmarks[16]
  if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) return 'none'

  const shoulderWidth = distance(leftShoulder, rightShoulder)
  const torsoLength = Math.max(shoulderWidth, distance(leftShoulder, landmarks[23] ?? leftShoulder))
  const threshold = torsoLength * RAISE_THRESHOLD
  const leftRaised = leftShoulder.y - leftWrist.y > threshold
  const rightRaised = rightShoulder.y - rightWrist.y > threshold

  if (leftRaised && !rightRaised) return 'left-arm-raised'
  if (rightRaised && !leftRaised) return 'right-arm-raised'
  return 'none'
}
