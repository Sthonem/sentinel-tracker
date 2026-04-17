import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import { SingleTileImageryProvider, Rectangle } from 'cesium';
import type { ImageryLayer } from 'cesium';
import type { SatellitePosition } from '../hooks/useSatellitePositions';
import { computeCoverageGrid, gridToCanvas } from '../lib/coverage';

interface Props {
  satellitePositions: SatellitePosition[];
  visible: boolean;
  onComputingChange: (computing: boolean) => void;
}

export function CoverageLayer({ satellitePositions, visible, onComputingChange }: Props) {
  const { viewer } = useCesium();
  const layerRef = useRef<ImageryLayer | null>(null);

  useEffect(() => {
    if (!viewer) return;

    // Remove existing layer whenever visibility or data changes
    if (layerRef.current) {
      viewer.imageryLayers.remove(layerRef.current, true);
      layerRef.current = null;
    }

    if (!visible) return;

    onComputingChange(true);

    // Defer heavy computation so the loading banner renders first
    const timerId = setTimeout(() => {
      const grid = computeCoverageGrid(satellitePositions);
      const canvas = gridToCanvas(grid);

      const provider = new SingleTileImageryProvider({
        url: canvas.toDataURL(),
        rectangle: Rectangle.fromDegrees(-180, -90, 180, 90),
      });

      const layer = viewer.imageryLayers.addImageryProvider(provider);
      layer.alpha = 0.65;
      layerRef.current = layer;
      onComputingChange(false);
    }, 80);

    return () => {
      clearTimeout(timerId);
      if (layerRef.current) {
        viewer.imageryLayers.remove(layerRef.current, true);
        layerRef.current = null;
      }
      onComputingChange(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, visible]);

  return null;
}
