export type SatelliteFamily = 'SENTINEL-1' | 'SENTINEL-2';

export interface SatelliteTLE {
  name: string;
  norad_id: number;
  line1: string;
  line2: string;
  family: SatelliteFamily;
}
