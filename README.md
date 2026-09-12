# GestureNav

GestureNav is a client-side accessibility demo that turns hand, arm, and head gestures into page navigation. Camera frames are processed locally in the browser with MediaPipe Tasks Vision; no video is uploaded.

## Development

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npx tsc --noEmit
npm run build
```

Use `?debug=true` on the local URL to show the mirrored tracking overlay. Camera access requires HTTPS in production or localhost during development.
