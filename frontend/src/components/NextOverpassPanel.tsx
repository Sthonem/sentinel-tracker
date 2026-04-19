import type { OverpassResult } from '../lib/overpass';
import { formatTimeUntil } from '../lib/overpass';
import type { SatelliteFamily } from '../types/satellite';
import { useDraggable } from '../hooks/useDraggable';

const FAMILY_COLOR: Record<SatelliteFamily, string> = {
  'SENTINEL-1': '#f97316',
  'SENTINEL-2': '#22d3ee',
};

interface Props {
  targetLat: number;
  targetLon: number;
  results: OverpassResult[];
  computing: boolean;
  onClose: () => void;
}

export function NextOverpassPanel({ targetLat, targetLon, results, computing, onClose }: Props) {
  const now = new Date();
  const { pos, onMouseDown } = useDraggable(
    16,
    typeof window !== 'undefined' ? window.innerHeight - 300 : 500,
  );

  return (
    <div
      data-draggable
      onMouseDown={onMouseDown}
      style={{ ...panelStyle, position: 'fixed', left: pos.x, top: pos.y, bottom: 'unset', cursor: 'grab' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13 }}>📍 Next Overpass</div>
          <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
            {targetLat.toFixed(3)}°, {targetLon.toFixed(3)}°
          </div>
        </div>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
        {computing ? (
          <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>
            Computing passes…
          </div>
        ) : results.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No pass found within 5 days.</div>
        ) : (
          results.map((r) => (
            <div key={r.name} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...dot, background: FAMILY_COLOR[r.family] }} />
                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12 }}>{r.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: FAMILY_COLOR[r.family], fontSize: 12, fontWeight: 700 }}>
                  in {formatTimeUntil(r.passTime, now)}
                </div>
                <div style={{ color: '#64748b', fontSize: 10 }}>
                  {r.passTime.toISOString().slice(11, 16)} UTC · {Math.round(r.durationSeconds / 60)} min
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  width: 260,
  background: 'rgba(10, 15, 28, 0.92)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '14px 16px',
  fontFamily: 'monospace',
  zIndex: 20,
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: 14,
  padding: '2px 4px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const dot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0,
};
