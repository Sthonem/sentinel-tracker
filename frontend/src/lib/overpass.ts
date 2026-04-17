import * as satellite from 'satellite.js';
import type { SatRec } from 'satellite.js';
import type { SatelliteFamily } from '../types/satellite';

const EARTH_RADIUS_KM = 6371;

const SWATH_HALF_KM: Record<SatelliteFamily, number> = {
  'SENTINEL-1': 125,  // 250 km / 2
  'SENTINEL-2': 145,  // 290 km / 2
};

export interface OverpassResult {
  name: string;
  family: SatelliteFamily;
  passTime: Date;          // moment the satellite enters swath
  durationSeconds: number; // seconds the satellite stays in swath
}

function inSwath(
  satrec: SatRec,
  t: Date,
  targetLatRad: number,
  targetLonRad: number,
  swathAngleRad: number,
): boolean {
  const pv = satellite.propagate(satrec, t);
  if (!pv.position || typeof pv.position === 'boolean') return false;
  const gmst = satellite.gstime(t);
  const geo = satellite.eciToGeodetic(pv.position, gmst);
  // Haversine angular distance between sub-satellite point and target
  const sinHalfDLat = Math.sin((geo.latitude - targetLatRad) / 2);
  const sinHalfDLon = Math.sin((geo.longitude - targetLonRad) / 2);
  const a =
    sinHalfDLat ** 2 +
    Math.cos(targetLatRad) * Math.cos(geo.latitude) * sinHalfDLon ** 2;
  return 2 * Math.asin(Math.sqrt(Math.min(1, a))) < swathAngleRad;
}

export function findNextPass(
  name: string,
  family: SatelliteFamily,
  satrec: SatRec,
  targetLat: number,
  targetLon: number,
  fromTime: Date,
  maxDays = 5,
): OverpassResult | null {
  const swathAngleRad = SWATH_HALF_KM[family] / EARTH_RADIUS_KM;
  const targetLatRad = (targetLat * Math.PI) / 180;
  const targetLonRad = (targetLon * Math.PI) / 180;
  const STEP_MS = 60_000; // 1-minute steps
  const maxMs = maxDays * 24 * 60 * STEP_MS;

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

  if (!passStart) return null;

  return {
    name,
    family,
    passTime: passStart,
    durationSeconds: passEnd
      ? (passEnd.getTime() - passStart.getTime()) / 1000
      : STEP_MS / 1000,
  };
}

export function formatTimeUntil(passTime: Date, now: Date): string {
  const diffMs = passTime.getTime() - now.getTime();
  if (diffMs < 0) return 'now';
  const totalMin = Math.round(diffMs / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}
