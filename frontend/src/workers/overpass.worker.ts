/**
 * Web Worker: next-overpass computation.
 *
 * Receives a WorkerRequest via postMessage, runs the SGP4 search loop
 * entirely off the main thread, and posts back a WorkerResponse.
 */
import * as satellite from 'satellite.js';
import type { SatelliteTLE, SatelliteFamily } from '../types/satellite';
import type { OverpassResult } from '../lib/overpass';

export interface OverpassWorkerRequest {
  tles: SatelliteTLE[];
  targetLat: number;
  targetLon: number;
  nowMs: number;
  maxDays?: number;
}

export interface OverpassWorkerResponse {
  results: OverpassResult[];
}

const EARTH_RADIUS_KM = 6371;
const SWATH_HALF_KM: Record<SatelliteFamily, number> = {
  'SENTINEL-1': 125,
  'SENTINEL-2': 145,
};

function inSwath(
  satrec: ReturnType<typeof satellite.twoline2satrec>,
  t: Date,
  targetLatRad: number,
  targetLonRad: number,
  swathAngleRad: number,
): boolean {
  const pv = satellite.propagate(satrec, t);
  if (!pv.position || typeof pv.position === 'boolean') return false;
  const gmst = satellite.gstime(t);
  const geo = satellite.eciToGeodetic(pv.position, gmst);
  const sinHalfDLat = Math.sin((geo.latitude - targetLatRad) / 2);
  const sinHalfDLon = Math.sin((geo.longitude - targetLonRad) / 2);
  const a =
    sinHalfDLat ** 2 +
    Math.cos(targetLatRad) * Math.cos(geo.latitude) * sinHalfDLon ** 2;
  return 2 * Math.asin(Math.sqrt(Math.min(1, a))) < swathAngleRad;
}

self.onmessage = (e: MessageEvent<OverpassWorkerRequest>) => {
  const { tles, targetLat, targetLon, nowMs, maxDays = 5 } = e.data;
  const targetLatRad = (targetLat * Math.PI) / 180;
  const targetLonRad = (targetLon * Math.PI) / 180;
  const STEP_MS = 60_000;
  const maxMs = maxDays * 24 * 60 * STEP_MS;
  const fromTime = new Date(nowMs);

  const results: OverpassResult[] = [];

  for (const tle of tles) {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const swathAngleRad = SWATH_HALF_KM[tle.family] / EARTH_RADIUS_KM;

    let passStart: Date | null = null;
    let passEnd: Date | null = null;

    for (let ms = 0; ms <= maxMs; ms += STEP_MS) {
      const t = new Date(fromTime.getTime() + ms);
      const visible = inSwath(satrec, t, targetLatRad, targetLonRad, swathAngleRad);
      if (visible && !passStart) {
        passStart = t;
      } else if (!visible && passStart && !passEnd) {
        passEnd = t;
        break;
      }
    }

    if (passStart) {
      results.push({
        name: tle.name,
        family: tle.family,
        passTime: passStart,
        durationSeconds: passEnd
          ? (passEnd.getTime() - passStart.getTime()) / 1000
          : STEP_MS / 1000,
      });
    }
  }

  results.sort((a, b) => a.passTime.getTime() - b.passTime.getTime());
  const response: OverpassWorkerResponse = { results };
  self.postMessage(response);
};
