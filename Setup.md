# DevFocus Setup Guide 🚀

This guide explains how to set up, install dependencies, and run the **DevFocus** application on any device.

---

## 📋 Prerequisites

Before setting up the app, ensure you have the following installed on your target device:

1. **Node.js** (v18.0.0 or higher recommended)
   - Check version: `node --version`
2. **npm** (comes packaged with Node.js)
   - Check version: `npm --version`

---

## ⚙️ Getting Started & Installation

Follow these steps to set up the project on your new device:

### 1. Open the Project Directory
Navigate to the root directory where the project files are located:
```bash
cd devfocus
```

### 2. Install Dependencies
Run the install command to download all packages listed in `package.json` (including React, Vite, Tailwind CSS v4, shadcn/ui, and Lucide React):
```bash
npm install
```

---

## 🚀 Running the App

### Development Mode (Local Server)
To run the app with live hot reloading (HMR) during development:
```bash
npm run dev
```
Once the command finishes starting up, open your browser and navigate to the address shown in your terminal:
- **Default URL:** [http://localhost:5173/](http://localhost:5173/)

### Production Build
To bundle the application for production deployment (generates optimized files under the `dist/` folder):
```bash
npm run build
```

### Preview Production Build
To spin up a local server to test the production build:
```bash
npm run preview
```

---

## 🛠️ Tech Stack & Structure Reference

This application uses the following libraries:
- **Vite:** Next-generation frontend build tooling.
- **React + TypeScript:** Component structure and type safety.
- **Tailwind CSS v4:** Modern styling via compiler plugins.
- **shadcn/ui:** High-quality component primitives.
- **Web Audio API:** Standard browser engine utilized to synthesize focus audio tracks (Rain Static, Waves, and Binaural Beats) locally on-the-fly.
