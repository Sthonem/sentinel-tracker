import { useEffect } from 'react';
import { Entity, useCesium } from 'resium';
import { Color, ColorMaterialProperty, Cartesian2, LabelStyle } from 'cesium';
import type { Entity as CesiumEntity } from 'cesium';
import type { SatelliteFamily } from '../types/satellite';
import type { SatellitePosition } from '../hooks/useSatellitePositions';
import { SatelliteSwath } from './SatelliteSwath';

const FAMILY_COLOR: Record<SatelliteFamily, Color> = {
  'SENTINEL-1': Color.ORANGE,
  'SENTINEL-2': Color.CYAN,
};

interface Props {
  satellitePositions: SatellitePosition[];
  onSelect: (sp: SatellitePosition | null) => void;
  swathAlpha?: number;
}

function ClickHandler({ satellitePositions, onSelect }: Props) {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;

    function handleSelection(entity: CesiumEntity | undefined) {
      if (!entity) { onSelect(null); return; }
      const sp = satellitePositions.find((s) => s.tle.name === entity.name);
      onSelect(sp ?? null);
    }

    viewer.selectedEntityChanged.addEventListener(handleSelection);
    return () => { viewer.selectedEntityChanged.removeEventListener(handleSelection); };
  }, [viewer, satellitePositions, onSelect]);

  return null;
}

export function SatelliteEntities({ satellitePositions, onSelect, swathAlpha = 1 }: Props) {
  return (
    <>
      <ClickHandler satellitePositions={satellitePositions} onSelect={onSelect} />

      {satellitePositions.map(({ tle, satrec, position }) => {
        const color = FAMILY_COLOR[tle.family];
        return (
          <span key={tle.norad_id}>
            <Entity
              name={tle.name}
              position={position}
              point={{
                pixelSize: 10,
                color,
                outlineColor: Color.WHITE,
                outlineWidth: 1,
              }}
              label={{
                text: tle.name,
                font: '11px sans-serif',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                style: LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cartesian2(0, -18),
              }}
              path={{
                leadTime: 3600,
                trailTime: 3600,
                width: 1,
                material: new ColorMaterialProperty(color.withAlpha(0.6)),
                resolution: 60,
              }}
            />
            <SatelliteSwath
              name={tle.name}
              satrec={satrec}
              family={tle.family}
              color={color}
              alpha={swathAlpha}
            />
          </span>
        );
      })}
    </>
  );
}
