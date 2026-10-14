# BOX // BREATHE

A precision-engineered, distraction-free digital instrument for Box Breathing (Inhale, Hold, Exhale, Hold). Designed with a tactile, physical industrial aesthetic reminiscent of Teenage Engineering, Linear, and Dieter Rams.

---

## Features

- **Kinetic Precision Core**: Central rounded SVG square (`rx="24"`) with a glowing reticle puck following the perimeter path via native SVG `getPointAtLength()` coordinates, accompanied by an expanding and contracting diaphragm glassmorphism core.
- **Zero-Drift Clock**: High-precision `requestAnimationFrame` + `performance.now()` deterministic delta tracking with pause/resume microsecond offset compensation and tab-visibility freeze protection.
- **Procedural Web Audio Engine**: Pure client-side synthesis (no external MP3/audio files). Warm harmonic chimes for phase transitions:
  - **Inhale**: Rising warm sine/triangle chord (C4 [261.63Hz] + G4 [392.00Hz]) with 600Hz low-pass filter swell.
  - **Hold In**: Crystalline high ping (E5 [659.25Hz]).
  - **Exhale**: Grounding descending tone (G3 [196.00Hz] + D4 [293.66Hz]).
  - **Hold Out**: Resonant sub-pulse (C3 [130.81Hz]).
  - **Optional 1s Metronome Tick**: Subtle muted mechanical watch click (defaults to OFF).
- **Haptic Feedback**: Mobile `navigator.vibrate(30)` impulse on phase shifts.
- **Tactile Physical Controls**:
  - Seconds-per-side stepper (2s to 15s) with live `4s × 4 = 16s/box` cycle formula.
  - Quick-preset pills (`4s Standard`, `5s Deep`, `7s Advanced`).
  - Session targets (`2m`, `5m`, `10m`, `∞`).
- **Zen Mode**: Controls and status bar automatically fade down to `opacity-15` after 3 seconds of user inactivity while the session runs, leaving only the glowing box in the room. Moving the mouse or tapping the screen restores full visibility immediately.
- **User-Toggleable Accent Themes**:
  - **International Orange** (`#FF4F00`)
  - **Sage Green** (`#A3B19B`)
  - **Warm Alabaster** (`#F4F4F6`)
  - Retained automatically in `localStorage`.
- **Screen WakeLock API**: Prevents screen sleep or dimming during active breathing sessions.
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `R`: Reset session
  - `M`: Toggle audio mute
  - `Up / Down Arrows`: Increase / Decrease seconds per side
  - `T`: Toggle 1s metronome tick

---

## Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS + CSS procedural SVG noise grain texture
- **Icons**: Lucide React
- **Audio**: Native Web Audio API (`AudioContext`, `BiquadFilterNode`, `DynamicsCompressorNode`, `GainNode`, `OscillatorNode`)
- **Hosting Target**: Pure static bundle (`dist/`), zero server costs

---

## Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build production static export
npm run build
```

---

## Deployment

### Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages**.
3. Select your repository:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Deploy! Cloudflare Pages provides free unlimited bandwidth and instant preview deployments for every push.

### Firebase Hosting
1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```
2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   # When asked for public directory, enter: dist
   # When asked to configure as single-page app, enter: y
   ```
3. Deploy directly using the provided `firebase.json`:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

