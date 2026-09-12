<div align="center">

# 🖐️ GestureNav

### Navigate the web with your body.

*A computer-vision accessibility web app that turns webcam-based hand, arm, and head movements into page navigation — no backend, no uploads, no accounts.*

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks--Vision-00B3A4)](https://developers.google.com/mediapipe)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-success)](#-privacy--device-support)

<br>

**[🌐 Open the live demo](#)** &nbsp;·&nbsp; **[📦 View on GitHub](https://github.com/yukthaprakash/GestureNav)** &nbsp;·&nbsp; **[🖐️ Jump to gesture guide](#-gesture-guide)**

</div>

<br>

> Camera frames never leave your device. Everything — hand tracking, pose estimation, face analysis — runs **entirely in your browser** via MediaPipe. There is no server to send data to, because there is no server.

<br>

---

## 🚀 Try it

The repository is the source of truth. Run it locally in under a minute:

```bash
git clone https://github.com/yukthaprakash/GestureNav.git
cd GestureNav
npm install
npm run dev
```

Then open **http://localhost:5173** and click **Enable camera and begin.**

> ⚠️ **Note:** The camera prompt only appears after you click *Enable camera and begin* — nothing activates on page load. Production deployments must be served over **HTTPS** for camera access to work.

<div align="center">

**[▶ Open the local demo](#)** &nbsp;|&nbsp; **[🔍 Open debug view](#)**

</div>

---

## 🖐️ Gesture guide

| Gesture | Action |
|:---|:---|
| ✋ Open palm | Scroll down |
| ✊ Fist | Scroll up |
| 🤏 Pinch | Select the focused control |
| 👋 Swipe hand left | Next section |
| 🤚 Swipe hand right | Previous section |
| 🙋 Raise right arm | Next section |
| 🙋 Raise left arm | Previous section |
| ↩️ Tilt head left | Scroll up |
| ↪️ Tilt head right | Scroll down |
| 👀 Look away (1.5s+) | Pause gesture actions |

Every demo section also has visible on-screen buttons, and **`↑` `↓` `←` `→`** always provide a full keyboard fallback — no camera required, no gestures needed.

---

## 🧠 Adaptive accessibility

GestureNav doesn't assume everyone moves the same way.

- **🎯 Calibrate my gestures** — capture three comfortable samples each for pinch, open palm, swipe travel, arm raise, and head tilt during startup. Your personal threshold profile is saved **only in your browser** (`localStorage`) — nowhere else.
- **↩️ Reset to defaults** — clear your calibration profile any time.
- **🔋 Fatigue-aware sensitivity** — sustained low hand-tracking confidence gradually loosens thresholds, so accuracy doesn't punish you for getting tired.
- **🔄 Smart modality suggestions** — if arm or head gestures are performing better than hand tracking for you, GestureNav quietly suggests switching.

---

## 🔗 Gesture macros

Chain two gestures into one custom shortcut.

1. After starting the camera, open **Manage gesture macros**.
2. Pick any two gestures and assign them to an existing action.
3. Perform gesture one, then gesture two, within **2.5 seconds**.

GestureNav shows live recognition progress ("Step 1 of 2 detected...") before running your macro. All macros are stored locally and can be deleted individually at any time.

---

## 🔒 Privacy & device support

| | |
|:---|:---|
| 📵 **No uploads** | Video, images, gesture data — none of it ever leaves your device |
| 🚫 **No accounts, no analytics** | Nothing to sign up for, nothing being tracked |
| 🎥 **Full camera control** | *Turn camera off* stops media tracks, releases the camera indicator light, and pauses inference completely |
| ⌨️ **Graceful fallback** | Permission denial or a missing camera shows keyboard instructions — never a blank screen |
| 💻 **Best on desktop** | Fully responsive, but a laptop/desktop webcam gives the best experience. Mobile visitors get keyboard and on-screen controls |

---

## 🛠️ Development

```bash
npm install          # install dependencies
npx tsc --noEmit      # type-check
npm run build         # production build → dist/
npm run dev           # local dev server
```

Add `?debug=true` to the URL to reveal the mirrored canvas debug overlay.

The production build in `dist/` is a fully static site — deploy it to **Vercel**, **Netlify**, or any HTTPS host.

---

## 🧰 Tech stack

<div align="center">

`React` · `TypeScript` · `Vite` · `@mediapipe/tasks-vision` · `HandLandmarker` · `PoseLandmarker` · `FaceLandmarker` · `Plain CSS` · `HTML5 Canvas`

</div>

---

## 📁 Project structure

```
src/
├── lib/                     # Pure gesture classifiers and shared types
├── hooks/
│   └── useMultiTracking.ts  # Core tracking loop
├── components/              # Onboarding, overlay, and demo sections
├── App.tsx                  # Gesture and keyboard action wiring
└── App.css                  # Responsive visual system
```

---

## 🤝 Contributing

Issues and pull requests are welcome.

- Gesture thresholds → tune in `src/lib/`
- Tracking cadence → tune in `src/hooks/useMultiTracking.ts`

---

<div align="center">

**Built with accessibility in mind.**
*Navigating the web should not require a mouse.*

</div>
