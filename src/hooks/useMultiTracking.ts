import { useEffect, useRef, useState } from 'react'
import {
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
} from '@mediapipe/tasks-vision'
import { classifyFaceGesture, getHeadTiltDegrees, isLookingAway } from '../lib/faceGestures'
import { classifyHandGesture, getHandExtensionRatio, getPinchDistance, SwipeDetector } from '../lib/handGestures'
import { classifyPoseGesture, getPoseRaiseRatio } from '../lib/poseGestures'
import { DEFAULT_CALIBRATION_PROFILE } from '../lib/calibration'
import type { CalibrationProfile, FaceGesture, GestureEvent, HandGesture, PoseGesture, TrackingStatus } from '../lib/types'

// Keep this aligned with the installed @mediapipe/tasks-vision package version.
const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const POSE_EVERY_N_FRAMES = 3
const FACE_EVERY_N_FRAMES = 3
const LOOK_AWAY_MS = 1500
const GESTURE_COOLDOWN_MS = 700

export type TrackingSnapshot = {
  hands: HandGesture[]
  pose: PoseGesture
  face: FaceGesture
  isPaused: boolean
}

export type TrackingMetrics = {
  pinchDistance: number | null
  handExtensionRatio: number | null
  swipeDistance: number
  poseRaiseRatio: number | null
  headTiltDegrees: number | null
  handConfidence: number | null
  facePresent: boolean
  posePresent: boolean
}

const INITIAL_SNAPSHOT: TrackingSnapshot = {
  hands: [],
  pose: 'none',
  face: 'none',
  isPaused: false,
}

const INITIAL_METRICS: TrackingMetrics = {
  pinchDistance: null,
  handExtensionRatio: null,
  swipeDistance: 0,
  poseRaiseRatio: null,
  headTiltDegrees: null,
  handConfidence: null,
  facePresent: false,
  posePresent: false,
}

export function useMultiTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onGesture: (event: GestureEvent) => void,
  enabled = true,
  profile: CalibrationProfile = DEFAULT_CALIBRATION_PROFILE,
) {
  const [status, setStatus] = useState<TrackingStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<TrackingSnapshot>(INITIAL_SNAPSHOT)
  const [metrics, setMetrics] = useState<TrackingMetrics>(INITIAL_METRICS)
  const [adaptiveNotice, setAdaptiveNotice] = useState<string | null>(null)
  const [fallbackSuggestion, setFallbackSuggestion] = useState<string | null>(null)
  const callbackRef = useRef(onGesture)
  const lastGestureRef = useRef<{ action: string; timestamp: number } | null>(null)
  const lookAwayStartedRef = useRef<number | null>(null)

  useEffect(() => {
    callbackRef.current = onGesture
  }, [onGesture])

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      setSnapshot(INITIAL_SNAPSHOT)
      setMetrics(INITIAL_METRICS)
      setAdaptiveNotice(null)
      setFallbackSuggestion(null)
      return
    }

    let cancelled = false
    let animationFrame = 0
    let stream: MediaStream | null = null
    let handLandmarker: HandLandmarker | null = null
    let poseLandmarker: PoseLandmarker | null = null
    let faceLandmarker: FaceLandmarker | null = null
    const effectiveProfile = { ...profile }
    const swipeDetector = new SwipeDetector(500, effectiveProfile.swipeDistanceThreshold)
    let lowConfidenceStarted: number | null = null
    let missingHandsStarted: number | null = null
    let sensitivityAdjusted = false

    const emit = (event: GestureEvent) => {
      const lastGesture = lastGestureRef.current
      if (lastGesture && lastGesture.action === event.action && event.timestamp - lastGesture.timestamp < GESTURE_COOLDOWN_MS) {
        return
      }
      lastGestureRef.current = { action: event.action, timestamp: event.timestamp }
      callbackRef.current(event)
    }

    const start = async () => {
      setStatus('loading')
      setError(null)
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('This browser does not support webcam access. Try the latest version of Chrome, Safari, or Firefox.')
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const videoTrack = stream.getVideoTracks()[0]
        videoTrack?.addEventListener('ended', () => {
          if (cancelled) return
          setError('Camera access ended. Use the keyboard arrows, or reconnect your camera and try again.')
          setStatus('error')
          cancelled = true
          cancelAnimationFrame(animationFrame)
          handLandmarker?.close()
          poseLandmarker?.close()
          faceLandmarker?.close()
        }, { once: true })
        const video = videoRef.current
        if (!video) throw new Error('Camera preview is unavailable.')
        video.srcObject = stream
        await video.play()

        const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
        ;[handLandmarker, poseLandmarker, faceLandmarker] = await Promise.all([
          HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numHands: 2,
          }),
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: POSE_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1,
          }),
          FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numFaces: 1,
          }),
        ])
        if (cancelled) {
          handLandmarker?.close()
          poseLandmarker?.close()
          faceLandmarker?.close()
          return
        }
        setStatus('ready')

        let frameCount = 0
        const processFrame = () => {
          if (cancelled) return
          const currentVideo = videoRef.current
          if (!currentVideo || currentVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            animationFrame = requestAnimationFrame(processFrame)
            return
          }

          const timestamp = performance.now()
          const handResult = handLandmarker?.detectForVideo(currentVideo, timestamp)
          const handLandmarks = handResult?.landmarks[0]
          const confidenceScores = handResult?.handedness.flatMap((categories) => categories.map((category) => category.score ?? 0)) ?? []
          const handConfidence = confidenceScores.length
            ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
            : null
          const hands = handResult?.landmarks.map((landmarks) => classifyHandGesture(landmarks, {
            pinchThreshold: effectiveProfile.pinchThreshold,
            extensionRatio: effectiveProfile.handExtensionRatio,
          })) ?? []
          const poseResult = frameCount % POSE_EVERY_N_FRAMES === 0
            ? poseLandmarker?.detectForVideo(currentVideo, timestamp)
            : undefined
          const faceResult = frameCount % FACE_EVERY_N_FRAMES === 0
            ? faceLandmarker?.detectForVideo(currentVideo, timestamp)
            : undefined

          if (hands.includes('open-palm')) emit({ action: 'scroll-down', source: 'hand', label: 'Open palm: scroll down', timestamp })
          if (hands.includes('fist')) emit({ action: 'scroll-up', source: 'hand', label: 'Fist: scroll up', timestamp })
          if (hands.includes('pinch')) emit({ action: 'select', source: 'hand', label: 'Pinch: select', timestamp })
          const swipe = handLandmarks?.[0]
            ? swipeDetector.update(handLandmarks[0].x, timestamp)
            : null
          if (swipe === 'swipe-left') emit({ action: 'next-section', source: 'hand', label: 'Swipe left', timestamp })
          if (swipe === 'swipe-right') emit({ action: 'previous-section', source: 'hand', label: 'Swipe right', timestamp })

          const pose = poseResult?.landmarks[0] ? classifyPoseGesture(poseResult.landmarks[0], effectiveProfile.raiseThreshold) : snapshot.pose
          const faceLandmarks = faceResult?.faceLandmarks[0]
          const face = faceLandmarks ? classifyFaceGesture(faceLandmarks, {
            tiltThresholdDeg: effectiveProfile.tiltThresholdDeg,
            yawZThreshold: effectiveProfile.yawZThreshold,
            yawNoseThreshold: effectiveProfile.yawNoseThreshold,
          }) : snapshot.face

          if (handConfidence !== null && handConfidence < 0.55) {
            lowConfidenceStarted ??= timestamp
          } else {
            lowConfidenceStarted = null
          }
          if (lowConfidenceStarted !== null && timestamp - lowConfidenceStarted > 4000 && !sensitivityAdjusted) {
            effectiveProfile.pinchThreshold *= 1.08
            effectiveProfile.handExtensionRatio *= 0.94
            effectiveProfile.swipeDistanceThreshold *= 0.9
            swipeDetector.setDistanceThreshold(effectiveProfile.swipeDistanceThreshold)
            sensitivityAdjusted = true
            setAdaptiveNotice('Adjusted sensitivity for you')
          }
          if (!handLandmarks && (poseResult?.landmarks[0] || faceLandmarks)) {
            missingHandsStarted ??= timestamp
          } else {
            missingHandsStarted = null
            setFallbackSuggestion(null)
          }
          if (missingHandsStarted !== null && timestamp - missingHandsStarted > 3000) {
            setFallbackSuggestion('Hand tracking is low. Try raising an arm or tilting your head instead.')
          }

          setMetrics({
            pinchDistance: handLandmarks ? getPinchDistance(handLandmarks) : null,
            handExtensionRatio: handLandmarks ? getHandExtensionRatio(handLandmarks) : null,
            swipeDistance: swipeDetector.getDistance(),
            poseRaiseRatio: poseResult?.landmarks[0] ? getPoseRaiseRatio(poseResult.landmarks[0]) : null,
            headTiltDegrees: faceLandmarks ? getHeadTiltDegrees(faceLandmarks) : null,
            handConfidence,
            facePresent: Boolean(faceLandmarks),
            posePresent: Boolean(poseResult?.landmarks[0]),
          })
          const lookingAway = faceLandmarks ? isLookingAway(faceLandmarks, effectiveProfile.yawZThreshold, effectiveProfile.yawNoseThreshold) : false
          if (lookingAway) {
            lookAwayStartedRef.current ??= timestamp
          } else {
            lookAwayStartedRef.current = null
          }
          const isPaused = lookAwayStartedRef.current !== null && timestamp - lookAwayStartedRef.current >= LOOK_AWAY_MS
          if (isPaused) {
            setStatus('paused')
          } else if (status === 'paused') {
            setStatus('ready')
          }

          if (!isPaused && pose === 'left-arm-raised') emit({ action: 'previous-section', source: 'pose', label: 'Left arm raised', timestamp })
          if (!isPaused && pose === 'right-arm-raised') emit({ action: 'next-section', source: 'pose', label: 'Right arm raised', timestamp })
          if (!isPaused && face === 'tilt-left') emit({ action: 'scroll-up', source: 'face', label: 'Head tilted left', timestamp })
          if (!isPaused && face === 'tilt-right') emit({ action: 'scroll-down', source: 'face', label: 'Head tilted right', timestamp })

          setSnapshot({ hands, pose, face, isPaused })
          frameCount += 1
          animationFrame = requestAnimationFrame(processFrame)
        }
        animationFrame = requestAnimationFrame(processFrame)
      } catch (cause) {
        if (cancelled) return
        const message = cause instanceof DOMException && cause.name === 'NotAllowedError'
          ? 'Camera access was denied. You can still use the keyboard arrows, or allow camera access and try again.'
          : cause instanceof DOMException && cause.name === 'NotFoundError'
            ? 'No camera was detected. Use the keyboard arrows, or connect a webcam to try gesture navigation.'
            : cause instanceof DOMException && cause.name === 'SecurityError'
              ? 'Camera access requires HTTPS or localhost. Open the deployed site over HTTPS, then try again.'
          : cause instanceof Error ? cause.message : 'Unable to start gesture tracking.'
        setError(message)
        setStatus('error')
      }
    }

    void start()
    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrame)
      stream?.getTracks().forEach((track) => track.stop())
      handLandmarker?.close()
      poseLandmarker?.close()
      faceLandmarker?.close()
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [enabled, profile, videoRef])

  return { status, error, snapshot, metrics, adaptiveNotice, fallbackSuggestion }
}
