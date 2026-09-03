import { useNetworkTheme } from './NetworkTheme.js';

export function LeftPanel({ activeColor }) {
  const t = useNetworkTheme();
  return (
    <div className="hidden lg:flex relative min-w-0 flex-col justify-between min-h-[240px] lg:min-h-[320px] py-2 lg:py-4">
      <div>
        <p
          className="uppercase"
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 12,
            letterSpacing: '0.25em',
            fontWeight: 500,
            color: activeColor,
          }}
        >
          Connect
        </p>

        <h2
          className="mb-0"
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(34px, 2.8vw, 50px)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: t.textPrimary,
          }}
        >
          One domain.
          <br />
          <span style={{ color: activeColor }}>Infinite</span> connections.
        </h2>
      </div>
    </div>
  );
}
