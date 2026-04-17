interface Props {
  epochDate: Date;
}

export function StaleTLEBanner({ epochDate }: Props) {
  const ageHours = Math.round((Date.now() - epochDate.getTime()) / 3_600_000);
  return (
    <div style={bannerStyle}>
      ⚠️ Satellite data is {ageHours}h old — positions may be inaccurate.{' '}
      <span style={{ color: '#fbbf24', opacity: 0.7, fontSize: 11 }}>
        Backend will refresh automatically after 6 hours.
      </span>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  background: 'rgba(120, 80, 0, 0.85)',
  backdropFilter: 'blur(4px)',
  color: '#fde68a',
  fontSize: 12,
  fontFamily: 'sans-serif',
  padding: '6px 16px',
  textAlign: 'center',
  zIndex: 25,
  borderBottom: '1px solid rgba(251, 191, 36, 0.3)',
};
