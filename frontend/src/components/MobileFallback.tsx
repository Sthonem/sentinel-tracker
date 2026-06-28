import { useState } from 'react';

export function MobileFallback() {
  const [dismissed, setDismissed] = useState(false);
  const isMobile = window.innerWidth < 768;

  if (!isMobile || dismissed) return null;

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🖥️</div>
        <h2 style={headingStyle}>Best viewed on desktop</h2>
        <p style={msgStyle}>
          Sentinel Tracker is a 3D globe application optimised for larger screens.
          On a small display the controls may overlap and performance may suffer.
        </p>
        <button onClick={() => setDismissed(true)} style={btnStyle}>
          Continue anyway
        </button>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(5, 8, 18, 0.97)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
  fontFamily: 'sans-serif',
};

const cardStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#e2e8f0',
  maxWidth: 320,
  padding: '0 24px',
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 20,
  fontWeight: 600,
};

const msgStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: 13,
  color: '#94a3b8',
  lineHeight: 1.6,
};

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: '#cbd5e1',
  padding: '10px 20px',
  fontSize: 13,
  cursor: 'pointer',
};
