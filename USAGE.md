# Usage Guide — Sentinel Tracker

## Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 20 LTS |
| npm | 9 |
| Python | 3.11 |
| Git | any recent |

You also need a **free Cesium Ion account** to obtain an access token:  
<https://ion.cesium.com/tokens>

---

## 1. Clone the Repository

```bash
git clone https://github.com/Sthonem/sentinel-tracker.git
cd sentinel-tracker
```

---

## 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set ALLOWED_ORIGIN if your frontend runs on a different port

# Start the API server
uvicorn main:app --reload --port 8000
```

The backend will be available at **http://localhost:8000**.  
Health-check: <http://localhost:8000/api/satellites> should return JSON.

---

## 3. Frontend Setup

Open a **new terminal tab/window**.

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_CESIUM_ION_TOKEN=your_token_here
```

```bash
# Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 4. Using the Application

### Globe Navigation
- **Left-click + drag** — rotate the globe
- **Right-click + drag** or **scroll wheel** — zoom in/out
- **Middle-click + drag** — tilt the camera

### Satellite Entities
Each satellite is rendered as a coloured dot with its swath footprint:
- 🟠 **Orange** — Sentinel-1 (SAR, C-band)
- 🔵 **Cyan** — Sentinel-2 (MSI, optical)

Click any satellite to open the **info panel** (top-right) showing altitude, velocity, inclination, revolution number, and TLE epoch.

### Coverage Heatmap
1. Click **Coverage Map** in the toolbar.
2. Wait for the "Computing 7-day coverage map…" banner to disappear (typically 5–15 seconds).
3. A colour overlay appears — blue = low coverage, red = high coverage.
4. Click **Coverage Map** again to hide it.

### Next Overpass
1. Click **Pick Location** in the toolbar (cursor changes to crosshair mode).
2. Click anywhere on the globe.
3. The **Next Overpass** panel (bottom-left) shows the soonest upcoming pass for each satellite, with pass start time and estimated duration.
4. Click **✕** to dismiss.

### Historical Replay
1. Type a date in the **Date** field in the toolbar (format: `YYYY-MM-DD`).
2. The Cesium clock jumps to that date; satellites move to their historical positions.
3. Click **Reset** or clear the field to return to live mode.

---

## 5. Production Build

```bash
cd frontend
npm run build       # outputs to frontend/dist/
npm run preview     # serve the built bundle locally
```

For backend deployment see **[DEPLOY.md](DEPLOY.md)**.

---

## 6. Common Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank globe / Cesium tiles missing | Invalid Ion token | Check `VITE_CESIUM_ION_TOKEN` in `frontend/.env` |
| "Failed to fetch satellites" error | Backend not running | Start uvicorn; check port 8000 is free |
| CORS error in browser console | `ALLOWED_ORIGIN` mismatch | Set `ALLOWED_ORIGIN=http://localhost:5173` in `backend/.env` |
| Yellow stale-TLE banner | TLE data >24 h old | Backend will auto-refresh; or restart backend to force fetch |
| Coverage map takes very long | Many satellites, slow CPU | Normal — computation runs in a Web Worker; just wait |
