const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif'

const LinkLabel = ({ label, variant, hovering }) => {
  switch (variant) {
    case 'magnetic-line':
      return (
        <div className="flex items-center gap-0 select-none" style={{ fontFamily: FONT }}>
          <div
            className="rounded-full border border-black/40 flex-shrink-0 transition-all duration-300"
            style={{
              width: 7, height: 7,
              backgroundColor: hovering ? 'rgba(0,0,0,0.5)' : 'transparent',
            }}
          />
          <div
            className="h-px bg-black/40 transition-all duration-500"
            style={{ width: hovering ? 80 : 50 }}
          />
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal pl-2.5">
            {label}
          </span>
          <span className="text-[9px] text-black/60 ml-1.5">↗</span>
        </div>
      )

    case 'editorial':
      return (
        <div className="flex items-center gap-2.5 select-none" style={{ fontFamily: FONT }}>
          <span className="text-[10px] text-black/55 font-mono tracking-wider">[01]</span>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal">
            {label}
          </span>
          <span className="text-[9px] text-black/60">↗</span>
        </div>
      )

    case 'circle-line':
      return (
        <div className="flex items-center gap-0 select-none" style={{ fontFamily: FONT }}>
          <div
            className="rounded-full border border-black/40 flex-shrink-0 transition-all duration-300"
            style={{
              width: 6, height: 6,
              backgroundColor: hovering ? 'rgba(0,0,0,0.4)' : 'transparent',
            }}
          />
          <div className="h-px bg-black/35" style={{ width: 55 }} />
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal pl-2">
            {label}
          </span>
          <span className="text-[9px] text-black/60 ml-1.5">↗</span>
        </div>
      )

    case 'arrow':
      return (
        <div className="flex items-center gap-2 select-none" style={{ fontFamily: FONT }}>
          <span
            className="text-black/70 text-[13px] transition-transform duration-300"
            style={{ transform: hovering ? 'translateX(2px)' : 'translateX(0)' }}
          >
            →
          </span>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal">
            {label}
          </span>
        </div>
      )

    case 'underline':
      return (
        <div className="flex flex-col select-none" style={{ fontFamily: FONT }}>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal">
            {label}
          </span>
          <div
            className="h-px bg-black/40 transition-all duration-500 mt-0.5"
            style={{ width: hovering ? '100%' : '40%' }}
          />
        </div>
      )

    case 'coordinate':
      return (
        <div className="flex items-center gap-2 select-none" style={{ fontFamily: FONT }}>
          <span className="text-[10px] text-black/50 font-mono">x:34%</span>
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal">
            {label}
          </span>
          <span className="text-[9px] text-black/60">↗</span>
        </div>
      )

    default:
      return (
        <div className="flex items-center gap-0 select-none" style={{ fontFamily: FONT }}>
          <div className="rounded-full border border-black/40" style={{ width: 7, height: 7 }} />
          <div className="h-px bg-black/40" style={{ width: 50 }} />
          <span className="text-[13px] tracking-wide whitespace-nowrap text-black/90 font-normal pl-2">
            {label}
          </span>
        </div>
      )
  }
}

const ProjectCard = ({ label, thumbnail, hovering }) => (
  <div
    className="flex items-center gap-2.5 select-none px-2.5 py-1.5 border border-black/20 bg-white/[0.15] backdrop-blur-[8px] rounded-[3px] transition-all duration-300"
    style={{
      fontFamily: FONT,
      transform: hovering ? 'scale(1.02)' : 'scale(1)',
    }}
  >
    <div className="w-8 h-8 rounded-[2px] overflow-hidden flex-shrink-0 border border-black/15">
      <img src={thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
    </div>
    <span className="text-[11px] tracking-wide text-black/85 font-normal whitespace-nowrap">
      {label}
    </span>
  </div>
)

const StatusNote = ({ label, icon }) => (
  <div
    className="flex items-center gap-2 select-none px-3 py-1.5 border border-black/18 bg-white/[0.12] backdrop-blur-[8px] rounded-sm"
    style={{ fontFamily: FONT }}
  >
    <span className="text-[11px]">{icon}</span>
    <span className="text-[11px] tracking-wider text-black/80 font-normal whitespace-nowrap">
      {label}
    </span>
  </div>
)

const TechArtifact = ({ label }) => (
  <div
    className="select-none px-2.5 py-1 border border-black/18 bg-white/[0.10] backdrop-blur-[6px] rounded-[2px]"
    style={{ fontFamily: FONT }}
  >
    <span className="text-[11px] tracking-wide text-black/80 font-normal whitespace-nowrap">
      {label}
    </span>
  </div>
)

const Achievement = ({ label, number }) => (
  <div className="flex items-center gap-2 select-none" style={{ fontFamily: FONT }}>
    {number && (
      <span className="text-[14px] text-black/75 font-normal tabular-nums">{number}</span>
    )}
    <span className="text-[11px] tracking-wide text-black/75 font-normal whitespace-nowrap">
      {label}
    </span>
  </div>
)

export { LinkLabel, ProjectCard, StatusNote, TechArtifact, Achievement }
