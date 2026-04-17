import * as satellite from 'satellite.js';
import type { SatRec } from 'satellite.js';

export interface SatelliteInfo {
  name: string;
  noradId: number;
  altitudeKm: number;
  inclinationDeg: number;
  velocityKms: number;
  revolutionNumber: number;
  tleEpoch: Date;
}

function tleEpochToDate(satrec: SatRec): Date {
  const year = satrec.epochyr < 57 ? 2000 + satrec.epochyr : 1900 + satrec.epochyr;
  const dayOfYear = Math.floor(satrec.epochdays);
  const fracDay = satrec.epochdays - dayOfYear;
  const d = new Date(Date.UTC(year, 0, dayOfYear));
  d.setUTCMilliseconds(fracDay * 86_400_000);
  return d;
}

// Revolution number at epoch lives in TLE Line 1, characters 64-68 (1-indexed).
function parseRevAtEpoch(line1: string): number {
  return parseInt(line1.slice(63, 68).trim(), 10) || 0;
}

export function computeSatInfo(
  name: string,
  noradId: number,
  satrec: SatRec,
  line1: string,
  now: Date,
): SatelliteInfo {
  const pv = satellite.propagate(satrec, now);

  let altitudeKm = 0;
  let velocityKms = 0;

  if (pv.position && typeof pv.position !== 'boolean') {
    const gmst = satellite.gstime(now);
    const geo = satellite.eciToGeodetic(pv.position, gmst);
    altitudeKm = Math.round(geo.height);
  }

  if (pv.velocity && typeof pv.velocity !== 'boolean') {
    const { x, y, z } = pv.velocity;
    velocityKms = Math.round(Math.sqrt(x * x + y * y + z * z) * 10) / 10;
  }

  const tleEpoch = tleEpochToDate(satrec);
  const elapsedDays = (now.getTime() - tleEpoch.getTime()) / 86_400_000;
  const meanMotionRevDay = (satrec.no * 1440) / (2 * Math.PI);
  const revAtEpoch = parseRevAtEpoch(line1);
  const revolutionNumber = Math.floor(revAtEpoch + elapsedDays * meanMotionRevDay);
  const inclinationDeg = Math.round(((satrec.inclo * 180) / Math.PI) * 100) / 100;

  return { name, noradId, altitudeKm, inclinationDeg, velocityKms, revolutionNumber, tleEpoch };
}
