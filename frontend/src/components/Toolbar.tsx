export type AppMode = 'normal' | 'pickingLocation';
export type FamilyFilter = 'all' | 'SENTINEL-1' | 'SENTINEL-2';

interface Props {
  mode: AppMode;
  showHeatmap: boolean;
  historicalDate: string;
  filterFamily: FamilyFilter;
  swathAlpha: number;
  showGdansk: boolean;
  onModeChange: (mode: AppMode) => void;
  onHeatmapToggle: () => void;
  onDateChange: (iso: string) => void;
  onDateReset: () => void;
  onFilterChange: (f: FamilyFilter) => void;
  onSwathAlphaChange: (v: number) => void;
  onGdanskToggle: () => void;
}

export function Toolbar({
  mode,
  showHeatmap,
  historicalDate,
  filterFamily,
  swathAlpha,
  showGdansk,
  onModeChange,
  onHeatmapToggle,
  onDateChange,
  onDateReset,
  onFilterChange,
  onSwathAlphaChange,
  onGdanskToggle,
}: Props) {
  const picking = mode === 'pickingLocation';

  return (
    <div style={toolbarStyle}>

      {/* ── Overpass pick ── */}
      <button
        onClick={() => onModeChange(picking ? 'normal' : 'pickingLocation')}
        style={btnStyle(picking)}
        title="Click a point on the globe to compute the next Sentinel-1 and Sentinel-2 overpass for that location (5-day lookahead)"
        aria-pressed={picking}
      >
        📍 {picking ? 'Click the globe…' : 'Next Pass'}
      </button>

      {/* ── Coverage heatmap ── */}
      <button
        onClick={onHeatmapToggle}
        style={btnStyle(showHeatmap)}
        title="Overlay a 7-day revisit-frequency heatmap: blue = rarely covered, red = frequently covered"
        aria-pressed={showHeatmap}
      >
        🗺️ Coverage
      </button>

      {/* ── Family filter ── */}
      <div style={groupStyle} title="Filter satellites by family">
        <span style={groupLabelStyle}>Filter</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'SENTINEL-1', 'SENTINEL-2'] as FamilyFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              style={chipStyle(filterFamily === f, f)}
              aria-pressed={filterFamily === f}
            >
              {f === 'all' ? 'All' : f === 'SENTINEL-1' ? 'S-1' : 'S-2'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Swath opacity ── */}
      <div style={groupStyle} title="Adjust swath footprint opacity">
        <span style={groupLabelStyle}>Swath</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={swathAlpha}
          onChange={(e) => onSwathAlphaChange(Number(e.target.value))}
          style={sliderStyle}
          aria-label="Swath opacity"
        />
        <span style={{ color: '#94a3b8', fontSize: 10, minWidth: 26, textAlign: 'right' }}>
          {Math.round(swathAlpha * 100)}%
        </span>
      </div>

      {/* ── Gdańsk marker ── */}
      <button
        onClick={onGdanskToggle}
        style={btnStyle(showGdansk)}
        title="Toggle Gdańsk city marker on the globe"
        aria-pressed={showGdansk}
      >
        🏛️ Gdańsk
      </button>

      {/* ── Historical date ── */}
      <div
        style={groupStyle}
        title="Jump to a specific UTC date/time — the globe will show satellite positions at that moment"
      >
        <span style={{ color: '#94a3b8', fontSize: 11 }}>🕐</span>
        <input
          type="datetime-local"
          value={historicalDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={dateInputStyle}
          aria-label="Historical date/time"
        />
        {historicalDate && (
          <button onClick={onDateReset} style={resetBtnStyle} title="Return to live real-time mode">
            ↩ Live
          </button>
        )}
      </div>
    </div>
  );
}

const toolbarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 20,
};

function btnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(99, 102, 241, 0.85)' : 'rgba(10, 15, 28, 0.85)',
    border: `1px solid ${active ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 7,
    color: active ? '#fff' : '#cbd5e1',
    padding: '8px 13px',
    fontSize: 12,
    fontFamily: 'sans-serif',
    cursor: 'pointer',
    backdropFilter: 'blur(6px)',
    transition: 'background 0.15s, border-color 0.15s',
    textAlign: 'left' as const,
    minWidth: 140,
  };
}

function chipStyle(active: boolean, family: FamilyFilter): React.CSSProperties {
  const color =
    family === 'SENTINEL-1' ? '#f97316' :
    family === 'SENTINEL-2' ? '#22d3ee' :
    '#6366f1';
  return {
    background: active ? `${color}33` : 'transparent',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.15)'}`,
    borderRadius: 5,
    color: active ? color : '#94a3b8',
    padding: '3px 9px',
    fontSize: 11,
    fontFamily: 'sans-serif',
    cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    transition: 'all 0.12s',
  };
}

const groupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'rgba(10, 15, 28, 0.85)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7,
  padding: '7px 10px',
  backdropFilter: 'blur(6px)',
};

const groupLabelStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 10,
  fontFamily: 'sans-serif',
  minWidth: 30,
};

const sliderStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 80,
  accentColor: '#6366f1',
  cursor: 'pointer',
};

const dateInputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#cbd5e1',
  fontSize: 12,
  fontFamily: 'sans-serif',
  outline: 'none',
  cursor: 'pointer',
  minWidth: 148,
};

const resetBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#f97316',
  fontSize: 11,
  fontFamily: 'sans-serif',
  cursor: 'pointer',
  padding: '0 2px',
  whiteSpace: 'nowrap' as const,
};
