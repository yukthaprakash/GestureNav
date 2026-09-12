# GestureNav

**Navigate the web with your body.**

GestureNav is a computer-vision accessibility web app that turns webcam-based hand, arm, and head movements into page navigation. It has no backend: MediaPipe runs entirely in your browser, and camera frames are never uploaded or stored.

## Try It

The repository is the source of truth: [open GestureNav on GitHub](https://github.com/yukthaprakash/GestureNav).

To try the working demo locally, clone the project, start Vite, then open the clickable link below:

```bash
git clone https://github.com/yukthaprakash/GestureNav.git
cd GestureNav
npm install
npm run dev
```

**[Open the local GestureNav demo](http://localhost:5173/)** · [Open debug view](http://localhost:5173/?debug=true)

The camera prompt appears only after clicking **Enable camera and begin**. Production deployments must use HTTPS for camera access.

## Gesture Guide

| Gesture | Action |
| --- | --- |
| Open palm | Scroll down |
| Fist | Scroll up |
| Pinch | Select the focused control |
| Swipe hand left | Next section |
| Swipe hand right | Previous section |
| Raise right arm | Next section |
| Raise left arm | Previous section |
| Tilt head left | Scroll up |
| Tilt head right | Scroll down |
| Look away for 1.5+ seconds | Pause gesture actions |

Every demo section also has visible buttons, and **Arrow Up/Down/Left/Right always provide a full keyboard fallback** when a visitor has no camera or prefers not to use one.

## Adaptive Accessibility

Choose **Calibrate my gestures** during startup to capture three comfortable samples for pinch, open palm, swipe travel, arm raise, and head tilt. The resulting threshold profile is saved only in this browser under `localStorage`; **Reset to defaults** removes it. During a session, sustained low hand confidence can slightly loosen sensitivity, and the app suggests arm or head gestures when those modalities are working better than hand tracking.

## Gesture Macros

After starting the camera, choose **Manage gesture macros** to create a personal two-step shortcut. Select any two gestures, choose an existing action, and save it. Perform the first gesture followed by the second within 2.5 seconds; GestureNav shows the recognition step and then runs the assigned action. Macros are stored locally in this browser and can be deleted individually.

## Privacy and Device Support

- Camera processing is local to the browser using MediaPipe Tasks Vision.
- No video, images, gesture data, accounts, or analytics are sent to a server.
- **Turn camera off** stops the media tracks, releases the camera indicator, pauses inference, and shows a clear camera-off state.
- Permission denial and missing cameras show keyboard instructions instead of a blank experience.
- The layout is responsive, but a desktop or laptop with a webcam is the best experience. Mobile visitors can use keyboard or on-screen controls.

## Development

```bash
npm install
npx tsc --noEmit
npm run build
npm run dev
```

Use `?debug=true` to show the mirrored canvas debug overlay. The production build is written to `dist/` and can be deployed as a static site to Vercel, Netlify, or another HTTPS host.

## Tech Stack

- React, TypeScript, and Vite
- [`@mediapipe/tasks-vision`](https://www.npmjs.com/package/@mediapipe/tasks-vision)
- HandLandmarker, PoseLandmarker, and FaceLandmarker
- Plain CSS and HTML5 Canvas

## Project Structure

```text
src/
├── lib/                    # Pure gesture classifiers and shared types
├── hooks/useMultiTracking.ts
├── components/             # Onboarding, overlay, and demo sections
├── App.tsx                 # Gesture and keyboard action wiring
└── App.css                 # Responsive visual system
```

## Contributing

Issues and pull requests are welcome. Gesture thresholds can be tuned in `src/lib/` and the tracking cadence can be tuned in `src/hooks/useMultiTracking.ts`.

Built with accessibility in mind: navigating the web should not require a mouse.
