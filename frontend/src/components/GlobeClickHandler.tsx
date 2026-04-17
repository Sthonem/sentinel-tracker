import { useEffect } from 'react';
import { useCesium } from 'resium';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartographic,
  Math as CesiumMath,
  Cartesian2,
} from 'cesium';

interface Props {
  active: boolean;
  onPick: (lat: number, lon: number) => void;
}

export function GlobeClickHandler({ active, onPick }: Props) {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer || !active) return;

    // Show crosshair cursor on the canvas while active
    viewer.scene.canvas.style.cursor = 'crosshair';

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((event: { position: Cartesian2 }) => {
      const cartesian = viewer.camera.pickEllipsoid(event.position);
      if (!cartesian) return;
      const carto = Cartographic.fromCartesian(cartesian);
      onPick(
        CesiumMath.toDegrees(carto.latitude),
        CesiumMath.toDegrees(carto.longitude),
      );
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      viewer.scene.canvas.style.cursor = '';
      handler.destroy();
    };
  }, [viewer, active, onPick]);

  return null;
}
