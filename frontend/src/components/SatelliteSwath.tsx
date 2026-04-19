import { useMemo } from 'react';
import { Entity } from 'resium';
import { CallbackProperty, Cartesian3, JulianDate, Color } from 'cesium';
import type { PositionProperty } from 'cesium';
import * as satellite from 'satellite.js';
import type { SatRec } from 'satellite.js';
import type { SatelliteFamily } from '../types/satellite';

// Half-widths in metres (cross-track / 2)
const SWATH_HALF: Record<SatelliteFamily, number> = {
  'SENTINEL-1': 125_000, // 250 km IW mode
  'SENTINEL-2': 145_000, // 290 km MSI
};
const ALONG_HALF = 200_000; // 400 km along-track for visual length

function getGroundCartesian(satrec: SatRec, t: Date): Cartesian3 {
  const pv = satellite.propagate(satrec, t);
  if (!pv.position || typeof pv.position === 'boolean') return Cartesian3.ZERO;
  const geo = satellite.eciToGeodetic(pv.position, satellite.gstime(t));
  return Cartesian3.fromDegrees(
    satellite.degreesLong(geo.longitude),
    satellite.degreesLat(geo.latitude),
    0,
  );
}

function getHeading(satrec: SatRec, t: Date): number {
  const t2 = new Date(t.getTime() + 15_000);
  const pv1 = satellite.propagate(satrec, t);
  const pv2 = satellite.propagate(satrec, t2);
  if (!pv1.position || typeof pv1.position === 'boolean') return 0;
  if (!pv2.position || typeof pv2.position === 'boolean') return 0;
  const g1 = satellite.eciToGeodetic(pv1.position, satellite.gstime(t));
  const g2 = satellite.eciToGeodetic(pv2.position, satellite.gstime(t2));
  const dLon = g2.longitude - g1.longitude;
  const y = Math.sin(dLon) * Math.cos(g2.latitude);
  const x =
    Math.cos(g1.latitude) * Math.sin(g2.latitude) -
    Math.sin(g1.latitude) * Math.cos(g2.latitude) * Math.cos(dLon);
  return Math.atan2(y, x);
}

interface Props {
  name: string;
  satrec: SatRec;
  family: SatelliteFamily;
  color: Color;
  /** 0–1 multiplier for swath opacity (default 1) */
  alpha?: number;
}

export function SatelliteSwath({ name, satrec, family, color, alpha = 1 }: Props) {
  // CallbackProperty satisfies the runtime contract of PositionProperty;
  // the cast is needed because Cesium's TS types don't extend the hierarchy
  // all the way down to CallbackProperty<Cartesian3>.
  const groundPosition = useMemo(
    () =>
      new CallbackProperty(
        (time) => getGroundCartesian(satrec, JulianDate.toDate(time ?? JulianDate.now())),
        false,
      ) as unknown as PositionProperty,
    [satrec],
  );

  // CallbackProperty implements Property, which EllipseGraphics.rotation accepts.
  const rotation = useMemo(
    () =>
      new CallbackProperty(
        (time) => getHeading(satrec, JulianDate.toDate(time ?? JulianDate.now())),
        false,
      ),
    [satrec],
  );

  return (
    <Entity
      name={`${name}-swath`}
      position={groundPosition}
      ellipse={{
        semiMajorAxis: ALONG_HALF,
        semiMinorAxis: SWATH_HALF[family],
        // CallbackProperty satisfies Property; Cesium accepts it at runtime.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rotation: rotation as any,
        material: color.withAlpha(0.13 * alpha),
        outline: true,
        outlineColor: color.withAlpha(0.55 * alpha),
        outlineWidth: 1,
      }}
    />
  );
}
