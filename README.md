# DevFocus 🧠⚡

**DevFocus** is a premium, bento-style productivity dashboard designed specifically for developers. Adhering to high-quality Glassmorphism design system standards, it brings together focus-tracking intervals, live statistics, task organization, and synthesized ambient noise into a single cohesive workspace.

---

## 🎨 About the Application

The goal of DevFocus is to minimize distraction and maximize developer output. Built as a single-page application, it organizes different productivity tools into a responsive **Bento Grid** that feels clean, modern, and alive:

- **Structured Focus:** Work in timed intervals using the Pomodoro technique.
- **Focus Soundscapes:** Block out distractions with real-time synthesized ambient sounds.
- **Minimalist Task Management:** Manage your current sprint tasks without leaving your environment.
- **Visual Analytics:** View your focus performance and task completion rate instantly.

---

## ✨ Key Features

1. **Integrated Pomodoro Timer**
   - Supports **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
   - Interactive progress bar and control states (Start, Pause, Reset, Skip).
   - Dynamically updates the browser tab title with a ticking timer (e.g. `(24:15) Focus | DevFocus`).
   - Plays a synthesized alarm tone when the session is complete.

2. **Web Audio API Sound Synthesizer**
   - Purely generated on-the-fly inside the browser (no external `.mp3` files or network latency).
   - **Rain Static:** Soft lowpass-filtered white noise.
   - **Ocean Waves:** Modulated noise simulating waves washing in and out using a Low-Frequency Oscillator (LFO).
   - **Binaural Beats:** Dual-frequency sine waves (140Hz and 144Hz) that target a 4Hz Theta wave to improve deep cognitive focus.
   - Features a dancing visual equalizer when audio is playing.

3. **Persistent Task Board**
   - Simple checklist to record your current dev tickets.
   - Filterable tabs for **All**, **Active**, and **Completed** tasks.
   - Auto-saved to your browser's `localStorage`.

4. **Productivity Stats & Charting**
   - Computes total focus minutes, completed tasks, and efficiency percentage.
   - Features a custom visual CSS/SVG weekly bar chart reflecting relative daily focus activity.

5. **Developer Notes Log**
   - A persistent scratchpad area to jot down functions, bugs, or mental notes.

---

## 🛠️ Tech Stack

- **Core:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS v4 (using CSS-first custom theme configuration)
- **Component Primitives:** shadcn/ui & Radix UI (Cards, Buttons, Inputs, Progress, Dialog)
- **Icons:** Lucide React
- **Audio Processing:** Browser HTML5 Web Audio API
- **Persistence:** LocalStorage API

