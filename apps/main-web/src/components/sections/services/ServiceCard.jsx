import CutReveal from './CutReveal';

function ServiceCard({ service, isExpanded, onClick, index }) {
  return (
    <div
      className="relative flex flex-col h-full cursor-pointer overflow-hidden select-none"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${service.title} service`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ borderRight: '1px solid rgba(128,128,128,0.13)' }}
    >
      {/* INDEX */}
      <div className="px-[1.4vw] pt-[1.5vh] shrink-0">
        <CutReveal isVisible delay={index * 0.04} duration={0.5}
          className="font-['font-p-2'] text-[10px] leading-none tracking-[0.15em] uppercase opacity-35"
        >
          {service.id}
        </CutReveal>
      </div>

      {/* TITLE */}
      <div className="px-[1.4vw] pt-[0.6vh] pb-[0.5vh] shrink-0">
        <CutReveal isVisible delay={0.06 + index * 0.04} duration={0.55}>
          <h3 className="font-['font-p-1'] text-[clamp(13px,1.15vw,18px)] leading-[1.05] tracking-tight uppercase m-0">
            {service.title}
          </h3>
        </CutReveal>
      </div>

      {/* EXPANDED — fills remaining height, paragraph pinned to bottom */}
      <CutReveal isVisible={isExpanded} delay={0} duration={0.35}
        className="flex-1 flex flex-col px-[1.4vw] min-h-0 overflow-hidden"
      >
        <div className="flex-1 flex flex-col justify-between min-h-0 pt-[0.6vh]">
          {/* Top block: features → image frame */}
          <div className="shrink-0">
            {/* Features */}
            <div className="flex flex-col gap-0">
              {service.features.map((feature, i) => (
                <CutReveal key={feature} isVisible={isExpanded} delay={0.08 + i * 0.04} duration={0.35}>
                  <span className="block font-['font-p-3'] text-[11px] leading-[1.85] tracking-wide opacity-60 uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                    {feature}
                  </span>
                </CutReveal>
              ))}
            </div>

            {/* Image frame — between features and paragraph */}
            <CutReveal isVisible={isExpanded} delay={0.28} duration={0.5}
              className="mt-[1.4vh] w-full overflow-hidden"
            >
              <div className="w-full aspect-[4/3] border border-[--dark-color]/10 dark:border-[--light-color]/10 overflow-hidden">
                <div className="w-full h-full" style={{
                  background: 'linear-gradient(145deg, var(--dark-color) 0%, transparent 70%)',
                  opacity: 0.08,
                }} />
              </div>
            </CutReveal>
          </div>

          {/* Bottom: paragraph */}
          <CutReveal isVisible={isExpanded} delay={0.42} duration={0.45} className="shrink-0 pb-[1.5vh] pt-[1.5vh]">
            <p className="font-['font-p-3'] text-[10.5px] leading-[1.6] tracking-wide uppercase opacity-50 m-0">
              {service.description}
            </p>
          </CutReveal>
        </div>
      </CutReveal>
    </div>
  );
}

export default ServiceCard;
