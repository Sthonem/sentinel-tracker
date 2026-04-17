import { useState, useEffect, useCallback } from 'react';
import type { SatelliteTLE, SatelliteFamily } from '../types/satellite';

interface RawSatellite {
  name: string;
  norad_id: number;
  line1: string;
  line2: string;
}

/** Parse the TLE epoch (line1 chars 18-31: YYDDD.DDDDDDDD) into a JS Date. */
function parseTleEpoch(line1: string): Date {
  const yr2 = parseInt(line1.slice(18, 20), 10);
  const year = yr2 < 57 ? 2000 + yr2 : 1900 + yr2;
  const dayFrac = parseFloat(line1.slice(20, 32));
  const dayOfYear = Math.floor(dayFrac);
  const fracDay = dayFrac - dayOfYear;
  const d = new Date(Date.UTC(year, 0, dayOfYear));
  d.setUTCMilliseconds(fracDay * 86_400_000);
  return d;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

interface UseSatellitesResult {
  satellites: SatelliteTLE[];
  loading: boolean;
  error: string | null;
  isStale: boolean;
  latestEpoch: Date | null;
  refetch: () => void;
}

export function useSatellites(): UseSatellitesResult {
  const [satellites, setSatellites] = useState<SatelliteTLE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [latestEpoch, setLatestEpoch] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/satellites`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — ${r.statusText}`);
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

        // Find most-recent TLE epoch across all satellites
        let newest: Date | null = null;
        for (const s of sats) {
          const epoch = parseTleEpoch(s.line1);
          if (!newest || epoch > newest) newest = epoch;
        }

        const stale = newest !== null && Date.now() - newest.getTime() > 24 * 3_600_000;

        setSatellites(sats);
        setLatestEpoch(newest);
        setIsStale(stale);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Unknown error');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  return { satellites, loading, error, isStale, latestEpoch, refetch };
}
