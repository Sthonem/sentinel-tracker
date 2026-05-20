# Technical Notes — Sentinel Tracker

Developer notes, design decisions, known limitations, and lessons learned.

---

## Architecture Decisions

### SGP4 in the Browser
All orbit propagation runs client-side via **satellite.js v7** (WASM-accelerated). This means:
- No server round-trips for position data.
- Users with slow CPUs may see a delay before the coverage map finishes.
- Accuracy is identical to server-side SGP4 for the timescales involved (<7 days).

### Web Workers for Heavy Computation
Both the coverage heatmap (`coverage.worker.ts`) and the overpass search (`overpass.worker.ts`) run in dedicated Web Workers to keep the main thread (and Cesium animation loop) unblocked.

Workers receive raw TLE strings (not `satrec` objects) because `satrec` contains internal function references that cannot be structured-cloned across the worker boundary. Each worker calls `twoline2satrec()` locally.

### Vite Worker Format: ESM
satellite.js v7 uses WebAssembly with top-level `await` in its WASM initialisation module. This requires:
```ts
// vite.config.ts
build: { target: 'esnext' },
worker: { format: 'es' },
```
Without `format: 'es'`, Vite wraps workers as IIFE, which does not support top-level await.

### SampledPositionProperty + Lagrange Interpolation
Instead of recomputing positions every frame (expensive), `useSatellitePositions` samples positions at 30-second intervals over a ±2-hour window and stores them in a `SampledPositionProperty` with **degree-5 Lagrange interpolation**. Cesium evaluates the polynomial in real time, giving smooth visual motion at near-zero CPU cost.

### CelesTrak API Endpoint
The legacy `GROUP=sentinel` query was deprecated on CelesTrak. The working endpoint is:
```
https://celestrak.org/SOCRATES/query.php?NAME=sentinel&FORMAT=tle
```
This returns all satellites whose name contains "SENTINEL", which is exactly what we need.

---

## Known Limitations

| Limitation | Notes |
|---|---|
| **Atmospheric drag model** | SGP4 is a simplified model. Position error grows with time; >3-day predictions may be off by tens of km. |
| **No real-time TLE streaming** | TLE data is cached for 6 hours. CelesTrak updates daily; fresh TLEs require a backend restart or cache expiry. |
| **Coverage grid resolution** | The heatmap uses a 2°×2° grid (90×180 cells). Finer resolution would require more computation time. |
| **Swath model** | The swath is modelled as a fixed-width ground track strip. In reality, Sentinel swath geometry varies with mode (IW, EW, SM for S-1). |
| **Mobile support** | The 3D globe requires a desktop GPU. A mobile-guard overlay is shown but the app is not optimised for touch. |
| **No user auth / persistence** | Selected locations and settings are lost on page refresh. |

---

## Coordinate System Pipeline

```
SGP4 (ECI, km) → eciToGeodetic (lat/lon/alt radians) → Cesium Cartesian3 (ECF, metres)
```

Key conversion detail: satellite.js returns positions in **kilometres**; Cesium expects **metres**. All position vectors are multiplied by 1000 before being passed to `Cartesian3.fromArray()`.

---

## Revolution Number Parsing

satellite.js v7 `SatRec` does not expose a `revnum` field directly. The revolution number at epoch is encoded in **TLE Line 1, columns 64–68** (0-indexed: `line1.slice(63, 68)`). We parse it manually:

```ts
const revolutionNumber = parseInt(line1.slice(63, 68).trim(), 10) || 0;
```

---

## NORAD IDs (as of April 2025)

| Satellite | NORAD ID | Status |
|---|---|---|
| Sentinel-1A | 39634 | Retired (power failure March 2022) |
| Sentinel-1B | 41456 | Retired (power failure August 2022) |
| Sentinel-1C | 62261 | Active ✓ |
| Sentinel-1D | 66315 | Active ✓ |
| Sentinel-2A | 40697 | Active ✓ |
| Sentinel-2B | 42063 | Active ✓ |
| Sentinel-2C | 60989 | Active ✓ |

The backend dynamically fetches all satellites matching `NAME=sentinel`, so retired ones are automatically excluded once CelesTrak removes their TLEs.

---

## Cesium Ion Token

The project uses Cesium's default World Terrain and Bing Maps base imagery, both of which require a Cesium Ion token. The free tier (community account) includes enough tile quota for development and academic demonstration.

**Never commit the token to the repository.** Keep it in `frontend/.env` (which is git-ignored).

---

## Build Output

After `npm run build`:
- `dist/` — static frontend bundle (~8–12 MB including Cesium assets)
- `dist/Workers/` — Cesium's own internal workers
- `dist/assets/coverage.worker-*.js` — coverage Web Worker chunk
- `dist/assets/overpass.worker-*.js` — overpass Web Worker chunk

The two application workers are built as separate ES module chunks by Vite's worker bundling pipeline.

---

## Future Improvements (out of scope for this submission)

- [ ] Sentinel-3 and Sentinel-5P support
- [ ] AOS/LOS elevation angle display in overpass panel
- [ ] Finer swath geometry (mode-dependent width)
- [ ] Persistent location favourites (localStorage)
- [ ] Progressive Web App (PWA) manifest for offline use
- [ ] CI/CD pipeline (GitHub Actions build + deploy)
