import { useState, useEffect } from 'react';
import type { SatelliteTLE, SatelliteFamily } from '../types/satellite';

interface RawSatellite {
  name: string;
  norad_id: number;
  line1: string;
  line2: string;
}

interface UseSatellitesResult {
  satellites: SatelliteTLE[];
  loading: boolean;
  error: string | null;
}

export function useSatellites(): UseSatellitesResult {
  const [satellites, setSatellites] = useState<SatelliteTLE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/satellites')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RawSatellite[]>;
      })
      .then((data) => {
        if (cancelled) return;
        const sats: SatelliteTLE[] = data.map((d) => ({
          name: d.name,
          norad_id: d.norad_id,
          line1: d.line1,
          line2: d.line2,
          family: (d.name.startsWith('SENTINEL-1') ? 'SENTINEL-1' : 'SENTINEL-2') as SatelliteFamily,
        }));
        setSatellites(sats);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Unknown error');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { satellites, loading, error };
}
