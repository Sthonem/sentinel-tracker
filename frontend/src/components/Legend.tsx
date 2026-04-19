import { useDraggable } from '../hooks/useDraggable';

export function Legend() {
  const { pos, onMouseDown } = useDraggable(
    typeof window !== 'undefined' ? window.innerWidth - 200 : 900,
    typeof window !== 'undefined' ? window.innerHeight - 110 : 500,
  );

  return (
    <div
      data-draggable
      onMouseDown={onMouseDown}
      style={{
        ...legendStyle,
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        cursor: 'grab',
      }}
    >
      <div style={rowStyle}>
        <span style={{ ...dotStyle, background: '#f97316' }} />
        <span style={nameStyle}>Sentinel-1</span>
        <span style={descStyle}>SAR · radar</span>
      </div>
      <div style={rowStyle}>
        <span style={{ ...dotStyle, background: '#22d3ee' }} />
        <span style={nameStyle}>Sentinel-2</span>
        <span style={descStyle}>MSI · optical</span>
      </div>
    </div>
  );
}

const legendStyle: React.CSSProperties = {
  background: 'rgba(10, 15, 28, 0.85)',
  backdropFilter: 'blur(6px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
  zIndex: 20,
  pointerEvents: 'auto',
  userSelect: 'none',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
};

const dotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  flexShrink: 0,
};

const nameStyle: React.CSSProperties = {
  color: '#e2e8f0',
  fontSize: 11,
  fontFamily: 'sans-serif',
  fontWeight: 600,
};

const descStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: 10,
  fontFamily: 'sans-serif',
};
