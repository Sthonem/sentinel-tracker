export type AppMode = 'normal' | 'pickingLocation';

interface Props {
  mode: AppMode;
  showHeatmap: boolean;
  historicalDate: string;
  onModeChange: (mode: AppMode) => void;
  onHeatmapToggle: () => void;
  onDateChange: (iso: string) => void;
  onDateReset: () => void;
}

export function Toolbar({
  mode,
  showHeatmap,
  historicalDate,
  onModeChange,
  onHeatmapToggle,
  onDateChange,
  onDateReset,
}: Props) {
  const picking = mode === 'pickingLocation';

  return (
    <div style={toolbarStyle}>
      <button
        onClick={() => onModeChange(picking ? 'normal' : 'pickingLocation')}
        style={btnStyle(picking)}
        title="Click a point on the globe to compute the next Sentinel-1 and Sentinel-2 overpass for that location (5-day lookahead)"
        aria-pressed={picking}
      >
        📍 {picking ? 'Click the globe…' : 'Next Pass'}
      </button>

      <button
        onClick={onHeatmapToggle}
        style={btnStyle(showHeatmap)}
        title="Overlay a 7-day revisit-frequency heatmap: blue = rarely covered, red = frequently covered"
        aria-pressed={showHeatmap}
      >
        🗺️ Coverage
      </button>

      <div
        style={dateGroupStyle}
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

const dateGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'rgba(10, 15, 28, 0.85)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7,
  padding: '7px 10px',
  backdropFilter: 'blur(6px)',
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
