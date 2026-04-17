/**
 * Web Worker: 7-day coverage grid computation.
 *
 * Receives a CoverageWorkerRequest, runs all satellite propagations,
 * and posts back the raw visit-count grid (number[][]).
 * The main thread handles the canvas rendering (fast) and imagery provider.
 */
import * as satellite from 'satellite.js';
import type { SatelliteTLE } from '../types/satellite';

export interface CoverageWorkerRequest {
  tles: SatelliteTLE[];
  days: number;
}

export interface CoverageWorkerResponse {
  grid: number[][];
}

const GRID_DEG = 2;
const LAT_CELLS = Math.round(180 / GRID_DEG); // 90
const LON_CELLS = Math.round(360 / GRID_DEG); // 180
const SWATH_HALF_DEG: Record<string, number> = {
  'SENTINEL-1': (125 / 6371) * (180 / Math.PI),
  'SENTINEL-2': (145 / 6371) * (180 / Math.PI),
};

self.onmessage = (e: MessageEvent<CoverageWorkerRequest>) => {
  const { tles, days } = e.data;
  const grid: number[][] = Array.from({ length: LAT_CELLS }, () =>
    new Array(LON_CELLS).fill(0),
  );
  const now = Date.now();
  const totalSteps = days * 1440;

  for (const tle of tles) {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const halfDeg = SWATH_HALF_DEG[tle.family] ?? 1.2;
    const halfCells = Math.ceil(halfDeg / GRID_DEG);

    for (let step = 0; step < totalSteps; step++) {
      const t = new Date(now + step * 60_000);
      const pv = satellite.propagate(satrec, t);
      if (!pv.position || typeof pv.position === 'boolean') continue;

      const gmst = satellite.gstime(t);
      const geo = satellite.eciToGeodetic(pv.position, gmst);
      const lat = satellite.degreesLat(geo.latitude);
      const lon = satellite.degreesLong(geo.longitude);

      const latRow = Math.floor((lat + 90) / GRID_DEG);
      const lonCol = Math.floor((lon + 180) / GRID_DEG);

      for (let dr = -halfCells; dr <= halfCells; dr++) {
        const row = latRow + dr;
        if (row < 0 || row >= LAT_CELLS) continue;
        for (let dc = -halfCells; dc <= halfCells; dc++) {
          const col = ((lonCol + dc) % LON_CELLS + LON_CELLS) % LON_CELLS;
          grid[row][col]++;
        }
      }
    }
  }

  const response: CoverageWorkerResponse = { grid };
  self.postMessage(response);
};
