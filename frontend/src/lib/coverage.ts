import * as satellite from 'satellite.js';
import type { SatellitePosition } from '../hooks/useSatellitePositions';

const GRID_DEG = 2;                        // 2° × 2° cells
const LAT_CELLS = Math.round(180 / GRID_DEG); // 90
const LON_CELLS = Math.round(360 / GRID_DEG); // 180

const SWATH_HALF_DEG: Record<string, number> = {
  'SENTINEL-1': (125 / 6371) * (180 / Math.PI), // ~1.12°
  'SENTINEL-2': (145 / 6371) * (180 / Math.PI), // ~1.30°
};

/**
 * Compute a visit-count grid for all satellites over `days` days.
 * Returns a LAT_CELLS × LON_CELLS array where each value is the
 * number of 1-minute intervals where a satellite swath covered that cell.
 */
export function computeCoverageGrid(
  satellitePositions: SatellitePosition[],
  days = 7,
): number[][] {
  const grid: number[][] = Array.from({ length: LAT_CELLS }, () =>
    new Array(LON_CELLS).fill(0),
  );
  const now = new Date();
  const totalSteps = days * 1440;

  for (const { tle, satrec } of satellitePositions) {
    const halfDeg = SWATH_HALF_DEG[tle.family] ?? 1.2;
    const halfCells = Math.ceil(halfDeg / GRID_DEG);

    for (let step = 0; step < totalSteps; step++) {
      const t = new Date(now.getTime() + step * 60_000);
      const pv = satellite.propagate(satrec, t);
      if (!pv.position || typeof pv.position === 'boolean') continue;

      const gmst = satellite.gstime(t);
      const geo = satellite.eciToGeodetic(pv.position, gmst);
      const lat = satellite.degreesLat(geo.latitude);
      const lon = satellite.degreesLong(geo.longitude);

      const latRow = Math.floor((lat + 90) / GRID_DEG);
      const lonCol = Math.floor((lon + 180) / GRID_DEG);

      // Mark a square neighbourhood within swath half-width
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

  return grid;
}

/**
 * Render the coverage grid to a 180×90 canvas (equirectangular, 2° per pixel).
 * Blue = low coverage, green = medium, yellow/red = high.
 */
export function gridToCanvas(grid: number[][]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = LON_CELLS;
  canvas.height = LAT_CELLS;
  const ctx = canvas.getContext('2d')!;

  let maxCount = 1;
  for (const row of grid)
    for (const v of row)
      if (v > maxCount) maxCount = v;

  for (let row = 0; row < LAT_CELLS; row++) {
    for (let col = 0; col < LON_CELLS; col++) {
      const count = grid[row][col];
      if (count === 0) continue;
      const t = Math.min(count / maxCount, 1);
      // Blue (240°) → cyan → green (120°) → yellow → red (0°)
      const hue = Math.round(240 - t * 240);
      const alpha = 0.25 + t * 0.55;
      ctx.fillStyle = `hsla(${hue},100%,55%,${alpha})`;
      // Canvas row 0 = top = lat +90; grid row 0 = lat -90 → flip Y
      ctx.fillRect(col, LAT_CELLS - 1 - row, 1, 1);
    }
  }

  return canvas;
}
