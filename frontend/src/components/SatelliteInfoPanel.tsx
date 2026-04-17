import type { SatelliteInfo } from '../lib/satInfo';
import type { SatelliteFamily } from '../types/satellite';
import { useDraggable } from '../hooks/useDraggable';

interface HintProps { onDismiss: () => void }

/** Hint shown in the top-right area before any satellite is selected. */
export function SatelliteInfoHint({ onDismiss }: HintProps) {
  const { pos, onMouseDown } = useDraggable(
    typeof window !== 'undefined' ? window.innerWidth - 256 : 900,
    16,
  );

  return (
    <div
      data-draggable
      onMouseDown={onMouseDown}
      style={{ ...panelStyle, position: 'fixed', left: pos.x, top: pos.y, right: 'unset', textAlign: 'center', padding: '14px 16px', cursor: 'grab' }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button onClick={onDismiss} style={closeBtnStyle} title="Kapat">✕</button>
      </div>
      <div style={{ fontSize: 22, marginBottom: 8 }}>🛰️</div>
      <p style={{ color: '#64748b', fontSize: 11, fontFamily: 'sans-serif', lineHeight: 1.5, margin: 0 }}>
        Click a satellite on the globe to view its details.
      </p>
    </div>
  );
}

const FAMILY_LABEL: Record<SatelliteFamily, string> = {
  'SENTINEL-1': 'SAR (C-band)',
  'SENTINEL-2': 'MSI (optical)',
};

const FAMILY_ACCENT: Record<SatelliteFamily, string> = {
  'SENTINEL-1': '#f97316',
  'SENTINEL-2': '#22d3ee',
};

interface Props {
  info: SatelliteInfo;
  family: SatelliteFamily;
  onClose: () => void;
}

export function SatelliteInfoPanel({ info, family, onClose }: Props) {
  const accent = FAMILY_ACCENT[family];
  const { pos, onMouseDown } = useDraggable(
    typeof window !== 'undefined' ? window.innerWidth - 256 : 900,
    16,
  );

  return (
    <div
      data-draggable
      onMouseDown={onMouseDown}
      style={{ ...panelStyle, position: 'fixed', left: pos.x, top: pos.y, right: 'unset', cursor: 'grab' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ color: accent, fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
            {info.name}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
            {FAMILY_LABEL[family]}
          </div>
        </div>
        <button onClick={onClose} style={closeBtnStyle} title="Close">✕</button>
      </div>

      <div style={{ borderTop: `1px solid ${accent}33`, paddingTop: 10 }}>
        {rows([
          ['NORAD ID', String(info.noradId)],
          ['Altitude', `${info.altitudeKm} km`],
          ['Velocity', `${info.velocityKms} km/s`],
          ['Inclination', `${info.inclinationDeg}°`],
          ['Revolution', `#${info.revolutionNumber.toLocaleString()}`],
          ['TLE Epoch', formatEpoch(info.tleEpoch)],
        ])}
      </div>
    </div>
  );
}

function rows(pairs: [string, string][]) {
  return pairs.map(([label, value]) => (
    <div key={label} style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  ));
}

function formatEpoch(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: 240,
  background: 'rgba(10, 15, 28, 0.92)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '14px 16px',
  color: '#e2e8f0',
  fontFamily: 'monospace',
  fontSize: 12,
  zIndex: 20,
  pointerEvents: 'auto',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: 14,
  padding: '2px 4px',
  lineHeight: 1,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 0',
};

const labelStyle: React.CSSProperties = {
  color: '#64748b',
};

const valueStyle: React.CSSProperties = {
  color: '#e2e8f0',
  fontWeight: 600,
};
