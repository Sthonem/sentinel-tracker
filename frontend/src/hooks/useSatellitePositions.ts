import { useMemo } from 'react';
import * as satellite from 'satellite.js';
import type { SatRec } from 'satellite.js';
import {
  SampledPositionProperty,
  JulianDate,
  Cartesian3,
  LagrangePolynomialApproximation,
} from 'cesium';
import type { SatelliteTLE } from '../types/satellite';

const STEP_SECONDS = 30;
const WINDOW_SECONDS = 2 * 60 * 60; // ±2 hours

function buildSampledPosition(satrec: SatRec, now: Date): SampledPositionProperty {
  const prop = new SampledPositionProperty();
  prop.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: LagrangePolynomialApproximation,
  });

  for (let offset = -WINDOW_SECONDS; offset <= WINDOW_SECONDS; offset += STEP_SECONDS) {
    const t = new Date(now.getTime() + offset * 1000);
    const pv = satellite.propagate(satrec, t);
    if (!pv.position || typeof pv.position === 'boolean') continue;

    const gmst = satellite.gstime(t);
    const ecf = satellite.eciToEcf(pv.position, gmst);
    prop.addSample(
      JulianDate.fromDate(t),
      new Cartesian3(ecf.x * 1000, ecf.y * 1000, ecf.z * 1000),
    );
  }

  return prop;
}

export interface SatellitePosition {
  tle: SatelliteTLE;
  satrec: SatRec;
  position: SampledPositionProperty;
}

export function useSatellitePositions(satellites: SatelliteTLE[]): SatellitePosition[] {
  return useMemo(() => {
    const now = new Date();
    return satellites.map((tle) => {
      const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
      return { tle, satrec, position: buildSampledPosition(satrec, now) };
    });
  }, [satellites]);
}
