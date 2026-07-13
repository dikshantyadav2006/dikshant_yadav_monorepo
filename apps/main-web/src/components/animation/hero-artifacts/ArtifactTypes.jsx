const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

const LinkLabel = ({ label, variant, hovering }) => {
  switch (variant) {
    case 'magnetic-line':
      return (
        <div className="flex items-center gap-0 select-none" style={{ fontFamily: FONT }}>
          <div
            className="rounded-full border border-black/20 flex-shrink-0 transition-all duration-300"
            style={{
              width: 7, height: 7,
              backgroundColor: hovering ? 'rgba(0,0,0,0.2)' : 'transparent',
            }}
          />
          <div
            className="h-px bg-black/15 transition-all duration-500"
            style={{ width: hovering ? 80 : 50 }}
          />
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light pl-2.5">
            {label}
          </span>
          <span className="text-[9px] text-black/35 ml-1.5">↗</span>
        </div>
      )

    case 'editorial':
      return (
        <div className="flex items-center gap-2.5 select-none" style={{ fontFamily: FONT }}>
          <span className="text-[10px] text-black/30 font-mono tracking-wider">[01]</span>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light">
            {label}
          </span>
          <span className="text-[9px] text-black/35">↗</span>
        </div>
      )

    case 'circle-line':
      return (
        <div className="flex items-center gap-0 select-none" style={{ fontFamily: FONT }}>
          <div
            className="rounded-full border border-black/15 flex-shrink-0 transition-all duration-300"
            style={{
              width: 6, height: 6,
              backgroundColor: hovering ? 'rgba(0,0,0,0.15)' : 'transparent',
            }}
          />
          <div className="h-px bg-black/12" style={{ width: 55 }} />
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light pl-2">
            {label}
          </span>
          <span className="text-[9px] text-black/35 ml-1.5">↗</span>
        </div>
      )

    case 'arrow':
      return (
        <div className="flex items-center gap-2 select-none" style={{ fontFamily: FONT }}>
          <span
            className="text-black/40 text-[13px] transition-transform duration-300"
            style={{ transform: hovering ? 'translateX(2px)' : 'translateX(0)' }}
          >
            →
          </span>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light">
            {label}
          </span>
        </div>
      )

    case 'underline':
      return (
        <div className="flex flex-col select-none" style={{ fontFamily: FONT }}>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light">
            {label}
          </span>
          <div
            className="h-px bg-black/15 transition-all duration-500 mt-0.5"
            style={{ width: hovering ? '100%' : '40%' }}
          />
        </div>
      )

    case 'coordinate':
      return (
        <div className="flex items-center gap-2 select-none" style={{ fontFamily: FONT }}>
          <span className="text-[10px] text-black/25 font-mono">x:34%</span>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light">
            {label}
          </span>
          <span className="text-[9px] text-black/35">↗</span>
        </div>
      )

    default:
      return (
        <div className="flex items-center gap-0 select-none" style={{ fontFamily: FONT }}>
          <div className="rounded-full border border-black/20" style={{ width: 7, height: 7 }} />
          <div className="h-px bg-black/15" style={{ width: 50 }} />
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/70 font-light pl-2">
            {label}
          </span>
        </div>
      )
  }
}

const ProjectCard = ({ label, thumbnail, hovering }) => (
  <div
    className="flex items-center gap-2.5 select-none px-2.5 py-1.5 border border-black/8 bg-white/[0.04] backdrop-blur-[6px] rounded-[3px] transition-all duration-300"
    style={{
      fontFamily: FONT,
      transform: hovering ? 'scale(1.02)' : 'scale(1)',
    }}
  >
    <div className="w-8 h-8 rounded-[2px] overflow-hidden flex-shrink-0 border border-black/5">
      <img src={thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
    </div>
    <span className="text-[11px] tracking-wide text-black/65 font-light whitespace-nowrap">
      {label}
    </span>
  </div>
)

const StatusNote = ({ label, icon }) => (
  <div
    className="flex items-center gap-2 select-none px-3 py-1.5 border border-black/6 bg-white/[0.03] backdrop-blur-[6px] rounded-sm"
    style={{ fontFamily: FONT }}
  >
    <span className="text-[11px]">{icon}</span>
    <span className="text-[11px] tracking-wider text-black/55 font-light whitespace-nowrap">
      {label}
    </span>
  </div>
)

const TechArtifact = ({ label }) => (
  <div
    className="select-none px-2.5 py-1 border border-black/5 rounded-[2px]"
    style={{ fontFamily: FONT }}
  >
    <span className="text-[11px] tracking-wide text-black/45 font-light whitespace-nowrap">
      {label}
    </span>
  </div>
)

const Achievement = ({ label, number }) => (
  <div className="flex items-center gap-2 select-none" style={{ fontFamily: FONT }}>
    {number && (
      <span className="text-[14px] text-black/50 font-light tabular-nums">{number}</span>
    )}
    <span className="text-[11px] tracking-wide text-black/50 font-light whitespace-nowrap">
      {label}
    </span>
  </div>
)

export { LinkLabel, ProjectCard, StatusNote, TechArtifact, Achievement }
