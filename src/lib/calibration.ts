import type { CalibrationProfile } from './types'

export const CALIBRATION_STORAGE_KEY = 'gesturenav-calibration-v1'

export const DEFAULT_CALIBRATION_PROFILE: CalibrationProfile = {
  pinchThreshold: 0.22,
  handExtensionRatio: 1.25,
  swipeDistanceThreshold: 0.22,
  raiseThreshold: 0.15,
  tiltThresholdDeg: 12,
  yawZThreshold: 0.04,
  yawNoseThreshold: 0.35,
}

export function loadCalibrationProfile(): CalibrationProfile {
  try {
    const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY)
    if (!stored) return DEFAULT_CALIBRATION_PROFILE
    const parsed = JSON.parse(stored) as Partial<CalibrationProfile>
    return { ...DEFAULT_CALIBRATION_PROFILE, ...parsed }
  } catch {
    return DEFAULT_CALIBRATION_PROFILE
  }
}

export function saveCalibrationProfile(profile: CalibrationProfile): void {
  try {
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Storage can be disabled by private browsing or browser policy.
  }
}

export function resetCalibrationProfile(): CalibrationProfile {
  try {
    localStorage.removeItem(CALIBRATION_STORAGE_KEY)
  } catch {
    // Storage can be disabled by private browsing or browser policy.
  }
  return DEFAULT_CALIBRATION_PROFILE
}
