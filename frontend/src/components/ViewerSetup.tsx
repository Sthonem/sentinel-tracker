import { useEffect } from 'react';
import { useCesium } from 'resium';

/**
 * One-shot viewer configuration that runs after the Cesium viewer mounts.
 * Disables day/night terminator lighting so the globe stays uniformly lit —
 * satellites are easier to track and screenshots look consistent regardless
 * of simulation time.
 */
export function ViewerSetup() {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;
    viewer.scene.globe.enableLighting = false;
  }, [viewer]);

  return null;
}
