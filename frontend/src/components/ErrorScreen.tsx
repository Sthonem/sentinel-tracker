interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: Props) {
  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={headingStyle}>Couldn't load satellite data</h2>
        <p style={msgStyle}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={onRetry} style={retryBtnStyle}>
            ↺ Retry
          </button>
          <a href="http://localhost:8000/" target="_blank" rel="noreferrer" style={linkBtnStyle}>
            Open backend status
          </a>
        </div>
        <p style={hintStyle}>
          Make sure the backend is running: <code style={codeStyle}>uvicorn main:app</code>
        </p>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(5, 8, 18, 0.96)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  fontFamily: 'sans-serif',
};

const cardStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#e2e8f0',
  maxWidth: 420,
  padding: '0 24px',
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 20,
  fontWeight: 600,
  color: '#f87171',
};

const msgStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#94a3b8',
};

const hintStyle: React.CSSProperties = {
  marginTop: 20,
  fontSize: 11,
  color: '#475569',
};

const codeStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 4,
  padding: '1px 5px',
  fontFamily: 'monospace',
};

const retryBtnStyle: React.CSSProperties = {
  background: '#6366f1',
  border: 'none',
  borderRadius: 7,
  color: '#fff',
  padding: '8px 18px',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'sans-serif',
};

const linkBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 7,
  color: '#94a3b8',
  padding: '8px 18px',
  fontSize: 13,
  textDecoration: 'none',
  cursor: 'pointer',
};
