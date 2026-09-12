# GestureNav

**Navigate the web with your body.**

GestureNav is a computer-vision accessibility web app that lets you control on-screen navigation using webcam-based hand gestures, arm/pose gestures, and face/gaze tracking — no mouse, no touch, no server. Everything runs entirely client-side in your browser.

🔗 **Live demo:** [Add your deployed URL here, e.g. https://gesturenav.yourdomain.com]

---

## ✨ What it does

GestureNav watches your webcam feed in real time and turns natural body movements into page navigation actions — scrolling, jumping between sections, and clicking — using on-device machine learning. No video is ever uploaded or stored anywhere; all processing happens locally in your browser using [MediaPipe](https://developers.google.com/mediapipe).

## 🖐️ Gesture guide

| Gesture | Action |
|---|---|
| ✋ Open palm | *(describe what this does, e.g. Pause/Resume tracking)* |
| ✊ Fist | *(describe action, e.g. Click / Select)* |
| 🤏 Pinch | Click |
| 👋 Swipe hand left / right | Previous / Next section |
| 🙋 Raise right arm | Next section |
| 🙋 Raise left arm | Previous section |
| 🙂 Tilt head | *(describe action, e.g. Scroll up/down)* |
| 👀 Look away (1.5s+) | Pause gesture tracking |

> Don't have a camera, or prefer not to use one? **Keyboard arrow keys always work** as a full fallback for every action above.

## 🚀 Getting started

### Try it online
Just open the [live demo link](#) in a modern desktop browser (Chrome, Firefox, or Safari) and click **"Enable camera and begin."** Grant camera access when prompted — that's it.

### Run it locally

```bash
# Clone the repo
git clone https://github.com/yukthaprakash/GestureNav.git
cd GestureNav

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

The optimized static build will be output to the `dist/` folder, ready to deploy anywhere (Vercel, Netlify, GitHub Pages, etc.).

## 🔒 Privacy

Your camera feed is processed **entirely in your browser**, in real time, using on-device machine learning models. **No video, image, or gesture data is ever sent to a server, stored, or uploaded anywhere.** This app has no backend — it's a fully static site. You can turn your camera off at any time using the on-screen toggle.

## 🛠️ Tech stack

- **React + TypeScript + Vite** — app framework and build tooling
- **[@mediapipe/tasks-vision](https://www.npmjs.com/package/@mediapipe/tasks-vision)** — HandLandmarker, PoseLandmarker, and FaceLandmarker for real-time, on-device gesture detection
- **Plain CSS** — no UI framework, custom design system
- **HTML5 Canvas** — debug overlay rendering
- **Vercel** — static hosting and deployment

## 📁 Project structure

```
src/
├── lib/
│   ├── types.ts            # Shared types (ActionType, InputSource, TrackingStatus)
│   ├── handGestures.ts     # Hand gesture classification (palm, fist, pinch, swipe)
│   ├── poseGestures.ts     # Arm-raise gesture classification
│   └── faceGestures.ts     # Head tilt & look-away detection
├── hooks/
│   └── useMultiTracking.ts # Core tracking hook — loads models, runs detection loop
├── components/
│   ├── GestureOverlay.tsx  # Webcam preview, debug overlay, status panel
│   └── DemoPage.tsx        # Scrollable demo page to navigate via gestures
├── App.tsx                 # Wires tracking output to page actions
└── App.css                 # Styling
```

## ⚙️ Browser & device support

- **Best experience:** Desktop/laptop with a webcam, on Chrome, Firefox, or Safari (latest versions)
- **No webcam?** The app detects this and falls back to full keyboard-arrow navigation automatically
- **Camera permission denied?** A clear fallback message and keyboard instructions appear immediately — nothing breaks
- **Mobile:** *(update this line based on final behavior — either "fully responsive" or "shows a 'best viewed on desktop' message")*

## 🤝 Contributing

Issues and pull requests are welcome. If you spot a gesture that misfires in certain lighting conditions or on certain devices, please open an issue with details — gesture thresholds are tunable in `src/lib/*.ts` and `src/hooks/useMultiTracking.ts`.

## 📄 License

*(Add your license here — e.g. MIT)*

---

Built with ♿ accessibility in mind — because navigating the web shouldn't require a mouse.
