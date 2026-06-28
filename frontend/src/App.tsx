import { useState, useCallback, useEffect } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Cartesian2, Color, Ion, JulianDate, LabelStyle } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { useSatellites } from './hooks/useSatellites';
import { useSatellitePositions } from './hooks/useSatellitePositions';
import type { SatellitePosition } from './hooks/useSatellitePositions';

import { SatelliteEntities } from './components/SatelliteEntities';
import { SatelliteInfoPanel, SatelliteInfoHint } from './components/SatelliteInfoPanel';
import { Toolbar } from './components/Toolbar';
import type { AppMode, FamilyFilter } from './components/Toolbar';
import { NextOverpassPanel } from './components/NextOverpassPanel';
import { GlobeClickHandler } from './components/GlobeClickHandler';
import { ClockController } from './components/ClockController';
import { CoverageLayer } from './components/CoverageLayer';
import { ViewerSetup } from './components/ViewerSetup';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorScreen } from './components/ErrorScreen';
import { StaleTLEBanner } from './components/StaleTLEBanner';
import { MobileFallback } from './components/MobileFallback';
import { Legend } from './components/Legend';

import { computeSatInfo } from './lib/satInfo';
import type { OverpassResult } from './lib/overpass';
import type { OverpassWorkerRequest, OverpassWorkerResponse } from './workers/overpass.worker';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN as string;

export default function App() {
  // ── Data ────────────────────────────────────────────────────────────────
  const { satellites, loading, error, isStale, latestEpoch, refetch } = useSatellites();
  const satellitePositions = useSatellitePositions(satellites);

  // ── Satellite info panel (click entity) ─────────────────────────────────
  const [selectedInfo, setSelectedInfo] = useState<{
    sp: SatellitePosition;
    info: ReturnType<typeof computeSatInfo>;
  } | null>(null);

  const handleSelectSatellite = useCallback((sp: SatellitePosition | null) => {
    if (!sp) { setSelectedInfo(null); return; }
    const now = JulianDate.toDate(JulianDate.now());
    setSelectedInfo({
      sp,
      info: computeSatInfo(sp.tle.name, sp.tle.norad_id, sp.satrec, sp.tle.line1, now),
    });
  }, []);

  // ── Toolbar mode ────────────────────────────────────────────────────────
  const [mode, setMode] = useState<AppMode>('normal');

  // ── Next Overpass ────────────────────────────────────────────────────────
  const [overpassTarget, setOverpassTarget] = useState<{ lat: number; lon: number } | null>(null);
  const [overpassResults, setOverpassResults] = useState<OverpassResult[]>([]);
  const [computingOverpass, setComputingOverpass] = useState(false);

  const handleGlobePick = useCallback((lat: number, lon: number) => {
    setOverpassTarget({ lat, lon });
    setMode('normal');
  }, []);

  useEffect(() => {
    if (!overpassTarget || satellitePositions.length === 0) return;
    setComputingOverpass(true);
    setOverpassResults([]);

    const worker = new Worker(
      new URL('./workers/overpass.worker.ts', import.meta.url),
      { type: 'module' },
    );

    const request: OverpassWorkerRequest = {
      tles: satellitePositions.map((sp) => sp.tle),
      targetLat: overpassTarget.lat,
      targetLon: overpassTarget.lon,
      nowMs: Date.now(),
    };

    worker.onmessage = (e: MessageEvent<OverpassWorkerResponse>) => {
      setOverpassResults(e.data.results);
      setComputingOverpass(false);
      worker.terminate();
    };

    worker.postMessage(request);
    return () => worker.terminate();
  }, [overpassTarget, satellitePositions]);

  // ── Hint dismiss ─────────────────────────────────────────────────────────
  const [hintDismissed, setHintDismissed] = useState(false);

  // ── Coverage heatmap ─────────────────────────────────────────────────────
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [computingHeatmap, setComputingHeatmap] = useState(false);

  // ── Family filter ─────────────────────────────────────────────────────────
  const [filterFamily, setFilterFamily] = useState<FamilyFilter>('all');

  // ── Swath opacity ─────────────────────────────────────────────────────────
  const [swathAlpha, setSwathAlpha] = useState(1);

  // ── Gdańsk marker ────────────────────────────────────────────────────────
  const [showGdansk, setShowGdansk] = useState(true);

  // ── Historical mode ───────────────────────────────────────────────────────
  const [historicalDate, setHistoricalDate] = useState('');

  // ── Derived: filtered satellite list ─────────────────────────────────────
  const filteredPositions = filterFamily === 'all'
    ? satellitePositions
    : satellitePositions.filter((sp) => sp.tle.family === filterFamily);

  // ── Render ────────────────────────────────────────────────────────────────
  if (error) return <ErrorScreen message={error} onRetry={refetch} />;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <MobileFallback />
      <LoadingOverlay visible={loading} />

      {isStale && latestEpoch && <StaleTLEBanner epochDate={latestEpoch} />}

      {computingHeatmap && (
        <div style={bannerStyle}>Computing 7-day coverage map…</div>
      )}

      <Toolbar
        mode={mode}
        showHeatmap={showHeatmap}
        historicalDate={historicalDate}
        filterFamily={filterFamily}
        swathAlpha={swathAlpha}
        showGdansk={showGdansk}
        onModeChange={setMode}
        onHeatmapToggle={() => setShowHeatmap((v) => !v)}
        onDateChange={setHistoricalDate}
        onDateReset={() => setHistoricalDate('')}
        onFilterChange={setFilterFamily}
        onSwathAlphaChange={setSwathAlpha}
        onGdanskToggle={() => setShowGdansk((v) => !v)}
      />

      {selectedInfo ? (
        <SatelliteInfoPanel
          info={selectedInfo.info}
          family={selectedInfo.sp.tle.family}
          onClose={() => setSelectedInfo(null)}
        />
      ) : (
        !loading && satellites.length > 0 && !hintDismissed &&
        <SatelliteInfoHint onDismiss={() => setHintDismissed(true)} />
      )}

      {overpassTarget && (
        <NextOverpassPanel
          targetLat={overpassTarget.lat}
          targetLon={overpassTarget.lon}
          results={overpassResults}
          computing={computingOverpass}
          onClose={() => { setOverpassTarget(null); setOverpassResults([]); }}
        />
      )}

      <Legend />

      <Viewer full shouldAnimate>
        <ViewerSetup />
        <GlobeClickHandler active={mode === 'pickingLocation'} onPick={handleGlobePick} />
        {historicalDate && <ClockController isoDate={historicalDate} />}
        <CoverageLayer
          satellitePositions={filteredPositions}
          visible={showHeatmap}
          onComputingChange={setComputingHeatmap}
        />

        {showGdansk && (
          <Entity
            name="Gdańsk"
            position={Cartesian3.fromDegrees(18.6466, 54.352, 100)}
            point={{ pixelSize: 8, color: new Color(1, 0.5, 0, 1) }}
            label={{
              text: 'Gdańsk',
              font: '11px sans-serif',
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cartesian2(0, -18),
            }}
            description="Gdańsk, Poland"
          />
        )}

        {overpassTarget && (
          <Entity
            name="Overpass Target"
            position={Cartesian3.fromDegrees(overpassTarget.lon, overpassTarget.lat, 0)}
            point={{
              pixelSize: 10,
              color: Color.YELLOW,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
            }}
            label={{
              text: '📍',
              font: '18px sans-serif',
              style: LabelStyle.FILL,
              fillColor: Color.WHITE,
            }}
          />
        )}

        <SatelliteEntities
          satellitePositions={filteredPositions}
          onSelect={handleSelectSatellite}
          swathAlpha={swathAlpha}
        />
      </Viewer>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0,0,0,0.78)',
  color: '#fff',
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'sans-serif',
  zIndex: 30,
  pointerEvents: 'none',
};
