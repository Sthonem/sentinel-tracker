interface Props {
  visible: boolean;
}

export function LoadingOverlay({ visible }: Props) {
  return (
    <div style={{ ...overlayStyle, opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none' }}>
      <div style={cardStyle}>
        <div style={spinnerStyle} />
        <p style={textStyle}>Loading Sentinel satellites…</p>
        <p style={subStyle}>Fetching live TLE data from CelesTrak</p>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(5, 8, 18, 0.92)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  transition: 'opacity 0.6s ease',
};

const cardStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#e2e8f0',
  fontFamily: 'sans-serif',
};

const spinnerStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  border: '3px solid rgba(255,255,255,0.1)',
  borderTop: '3px solid #6366f1',
  borderRadius: '50%',
  margin: '0 auto 16px',
  animation: 'spin 0.9s linear infinite',
};

const textStyle: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: 16,
  fontWeight: 600,
};

const subStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#64748b',
};
