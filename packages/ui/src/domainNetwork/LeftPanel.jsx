const PURPLE = '#8b5cf6';

export function LeftPanel({ activeColor = PURPLE }) {
  return (
    <div className="hidden lg:flex relative min-w-0 flex-col justify-between min-h-[240px] lg:min-h-[320px] py-2 lg:py-4">
      <div>
        <div className="flex flex-col gap-2 mb-6 lg:mb-8">
          <p
            className="uppercase text-white/90"
            style={{
              fontFamily: 'Geist, Inter, sans-serif',
              fontSize: 12,
              letterSpacing: '0.25em',
              fontWeight: 500,
            }}
          >
            Connect with me
          </p>
          <div
            className="h-[2px] w-10 rounded-full"
            style={{ background: activeColor, boxShadow: `0 0 12px ${activeColor}88` }}
          />
        </div>

        <h2
          className="text-white mb-6"
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(34px, 2.8vw, 50px)',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
          }}
        >
          One domain.
          <br />
          <span style={{ color: activeColor }}>Infinite</span> connections.
        </h2>

        <p
          className="max-w-[260px]"
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Hover a platform to connect through your preferred way.
        </p>
      </div>

      <div className="hidden lg:flex items-center gap-3 mt-6 text-white/40">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 13 }}>
          All roads lead to dikshantyadav.in
        </span>
      </div>
    </div>
  );
}
