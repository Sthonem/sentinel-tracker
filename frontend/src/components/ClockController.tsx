import { useEffect } from 'react';
import { useCesium } from 'resium';
import { JulianDate } from 'cesium';

interface Props {
  /** ISO 8601 datetime string, e.g. "2026-04-01T12:00" from a datetime-local input */
  isoDate: string;
}

export function ClockController({ isoDate }: Props) {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer || !isoDate) return;
    try {
      // datetime-local gives "YYYY-MM-DDTHH:MM" — append :00Z for ISO 8601
      viewer.clock.currentTime = JulianDate.fromIso8601(`${isoDate}:00Z`);
    } catch {
      // Invalid date string — ignore
    }
  }, [viewer, isoDate]);

  return null;
}
