# Sentinel Tracker

> Real-time 3D visualization of ESA Sentinel-1 and Sentinel-2 satellite constellations.

A personal side project exploring orbit propagation, satellite swath geometry, and real-time 3D rendering in the browser.

---

## Overview

Sentinel Tracker renders the current and near-future positions of all active  
Sentinel-1 (C-band SAR) and Sentinel-2 (Multispectral Imager) satellites on an  
interactive 3D globe powered by CesiumJS. Orbit propagation is performed locally  
in the browser using SGP4 via **satellite.js v7**, with TLE data served by a  
lightweight FastAPI backend that caches CelesTrak queries for six hours.

---

## Features

| Feature | Description |
|---|---|
| 🛰️ Live orbits | SGP4-propagated positions updated every animation frame |
| 📡 Swath footprints | Dynamic ground-track swath (125 km S-1 / 145 km S-2) with heading rotation |
| 🗺️ 7-day coverage map | Canvas heatmap showing cumulative ground coverage, computed in a Web Worker |
| 📍 Next overpass | Click any point on the globe to find the next satellite pass time & duration |
| 🕑 Historical replay | Scrub to any past date to replay orbital positions |
| 🎛️ Family filter & opacity | Filter by Sentinel-1 / Sentinel-2 and adjust swath transparency |
| ⚠️ Stale TLE banner | Automatic warning when TLE data is older than 24 hours |
| 📱 Mobile guard | Overlay notifying mobile users the app is desktop-optimised |
| 🔄 Auto-retry | Error screen with backend health link and one-click retry |

---

## Tech Stack

### Frontend
- [Vite 6](https://vitejs.dev/) + [React 19](https://react.dev/) + TypeScript (strict)
- [CesiumJS 1.x](https://cesium.com/platform/cesiumjs/) via [Resium](https://resium.reearth.io/)
- [satellite.js v7](https://github.com/shashwatak/satellite-js) — SGP4/SDP4 propagation
- Vite Web Workers (ESM, `type: 'module'`) for heavy off-thread computation

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- [httpx](https://www.python-httpx.org/) for async CelesTrak requests
- 6-hour in-memory TLE cache; TLE source: [CelesTrak](https://celestrak.org/)

---

## Repository Structure

```
sentinel-tracker/
├── backend/
│   ├── main.py              # FastAPI app — /api/satellites endpoint
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile             # Heroku/Render process definition
│   └── .env.example         # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Root component / state orchestration
│   │   ├── components/      # React UI components
│   │   ├── hooks/           # useSatellites, useSatellitePositions
│   │   ├── lib/             # satInfo, overpass, coverage helpers
│   │   ├── types/           # Shared TypeScript types
│   │   └── workers/         # coverage.worker.ts, overpass.worker.ts
│   ├── public/              # Static assets (Cesium base URL)
│   ├── .env.example         # Frontend environment variable template
│   ├── vite.config.ts
│   └── tsconfig.app.json
├── docs/                    # Screenshots and additional documentation
├── USAGE.md                 # Quick-start guide (English)
├── KULLANIM.md              # Quick-start guide (Turkish / Türkçe)
├── NOTES.md                 # Technical decisions & known issues
└── DEPLOY.md                # Deployment guide
```

---

## Quick Start

See **[USAGE.md](USAGE.md)** for the full step-by-step guide.

```bash
# 1. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env          # set VITE_API_URL and VITE_CESIUM_ION_TOKEN
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `VITE_API_URL` | frontend `.env` | Backend base URL (default: `http://localhost:8000`) |
| `VITE_CESIUM_ION_TOKEN` | frontend `.env` | Cesium Ion access token (free tier is sufficient) |
| `ALLOWED_ORIGIN` | backend `.env` | Frontend origin for CORS (default: `http://localhost:5173`) |

---

## Author

Built by **Erdem Aslan**.

---

## License

MIT — see [LICENSE](LICENSE).
