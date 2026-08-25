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
      style={{
        borderRight: '1px solid rgba(128,128,128,0.13)',
        transform: 'translateZ(0)',
      }}
    >
      {/* INDEX */}
      <div className="px-[1.4vw] pt-[2vh] shrink-0">
        <CutReveal
          isVisible={true}
          delay={index * 0.04}
          duration={0.5}
          className="font-['font-p-2'] text-[10px] leading-none tracking-[0.15em] uppercase opacity-35"
        >
          {service.id}
        </CutReveal>
      </div>

      {/* TITLE — fixed height to prevent reflow jump */}
      <div className="px-[1.4vw] py-[1.2vh] shrink-0 min-h-[52px] flex items-start">
        <CutReveal
          isVisible={true}
          delay={0.06 + index * 0.04}
          duration={0.55}
        >
          <h3 className="font-['font-p-1'] text-[clamp(13px,1.15vw,18px)] leading-[1.05] tracking-tight uppercase m-0">
            {service.title}
          </h3>
        </CutReveal>
      </div>

      {/* EXPANDED CONTENT — hidden overflow, fixed layout */}
      <div className="flex-1 flex flex-col px-[1.4vw] min-h-0 overflow-hidden">
        <CutReveal
          isVisible={isExpanded}
          delay={0}
          duration={0.4}
          className="flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex flex-col gap-0 mt-[0.8vh] shrink-0">
            {service.features.map((feature, i) => (
              <CutReveal
                key={feature}
                isVisible={isExpanded}
                delay={0.1 + i * 0.045}
                duration={0.35}
              >
                <span className="block font-['font-p-3'] text-[11px] leading-[1.9] tracking-wide opacity-60 uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                  {feature}
                </span>
              </CutReveal>
            ))}
          </div>

          {/* Image — FIXED height, no aspect-ratio jump */}
          <CutReveal
            isVisible={isExpanded}
            delay={0.32}
            duration={0.5}
            className="mt-[1.4vh] shrink-0 w-full h-[11vh] max-h-[110px] min-h-[70px] overflow-hidden"
          >
            <div
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(145deg, var(--dark-color) 0%, transparent 70%)',
                opacity: 0.09,
              }}
            />
          </CutReveal>

          {/* Description — appears after flex settles */}
          <CutReveal
            isVisible={isExpanded}
            delay={0.5}
            duration={0.45}
            className="mt-[1.4vh] pb-[1.5vh] shrink-0"
          >
            <p className="font-['font-p-3'] text-[10.5px] leading-[1.6] tracking-wide uppercase opacity-50 m-0 line-clamp-6">
              {service.description}
            </p>
          </CutReveal>
        </CutReveal>
      </div>
    </div>
  );
}

export default ServiceCard;
