import { useEffect, useRef } from 'react';
import { useCesium } from 'resium';
import { SingleTileImageryProvider, Rectangle } from 'cesium';
import type { ImageryLayer } from 'cesium';
import type { SatellitePosition } from '../hooks/useSatellitePositions';
import { gridToCanvas } from '../lib/coverage';
import type { CoverageWorkerRequest, CoverageWorkerResponse } from '../workers/coverage.worker';

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

    if (layerRef.current) {
      viewer.imageryLayers.remove(layerRef.current, true);
      layerRef.current = null;
    }
    if (!visible) return;

    onComputingChange(true);

    const worker = new Worker(
      new URL('../workers/coverage.worker.ts', import.meta.url),
      { type: 'module' },
    );

    const request: CoverageWorkerRequest = {
      tles: satellitePositions.map((sp) => sp.tle),
      days: 7,
    };

    worker.onmessage = (e: MessageEvent<CoverageWorkerResponse>) => {
      const canvas = gridToCanvas(e.data.grid);
      const provider = new SingleTileImageryProvider({
        url: canvas.toDataURL(),
        rectangle: Rectangle.fromDegrees(-180, -90, 180, 90),
      });
      if (layerRef.current) viewer.imageryLayers.remove(layerRef.current, true);
      const layer = viewer.imageryLayers.addImageryProvider(provider);
      layer.alpha = 0.65;
      layerRef.current = layer;
      onComputingChange(false);
      worker.terminate();
    };

    worker.postMessage(request);

    return () => {
      worker.terminate();
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
