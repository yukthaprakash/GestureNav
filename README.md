# GestureNav
## Known Limitations

- Gesture thresholds (pinch distance, tilt angle, arm-raise margin) are tuned for a front-facing laptop webcam at roughly arm's length — may need adjustment for different camera setups or lighting.
- Running three MediaPipe models concurrently is CPU/GPU-intensive; performance may dip on older hardware.
- Only single-hand and single-face tracking are supported (by design, to keep gesture mapping unambiguous).
