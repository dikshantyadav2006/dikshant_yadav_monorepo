import { motion, useReducedMotion } from 'framer-motion';
import CutReveal from './CutReveal';

const EASING = [0.16, 1, 0.3, 1];

/**
 * ServiceCard — Desktop column card
 *
 * Each service is a column in a 5-column CSS Grid.
 * The hovered/active column expands via `grid-template-columns` transition.
 * Content inside reveals with a top-down clip/mask animation.
 */
function ServiceCard({ service, isExpanded, onHover, onClick, index }) {
  const shouldReduceMotion = useReducedMotion();

  const featureDelayBase = 0.15;
  const featureStagger = 0.06;
  const imageDelay = 0.4;
  const descriptionDelay = 0.52;

  return (
    <motion.div
      className="relative flex flex-col cursor-pointer overflow-hidden"
      onHoverStart={onHover}
      onClick={onClick}
      onFocus={onHover}
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
        borderRight: '1px solid',
        borderColor: isExpanded
          ? 'rgba(var(--service-border-active, 0.5))'
          : 'rgba(var(--service-border, 0.15))',
      }}
      whileHover={!shouldReduceMotion ? { scale: 1.005 } : undefined}
      transition={{ scale: { duration: 0.3, ease: EASING } }}
    >
      {/* INDEX */}
      <div className="pt-[2vh] md:pt-[2.5vh] lg:pt-[3vh] px-[1.5vw]">
        <CutReveal
          isVisible={true}
          delay={index * 0.06}
          duration={0.5}
          className="font-['font-p-2'] text-[10px] md:text-[11px] tracking-[0.15em] uppercase opacity-40"
        >
          {service.id}
        </CutReveal>
      </div>

      {/* TITLE — always visible */}
      <div className="px-[1.5vw] py-[1vh] lg:py-[1.5vh]">
        <CutReveal
          isVisible={true}
          delay={0.08 + index * 0.06}
          duration={0.6}
        >
          <h3 className="font-['font-p-1'] text-[clamp(14px,1.3vw,22px)] leading-[1.05] tracking-tight uppercase m-0">
            {service.title}
          </h3>
        </CutReveal>
      </div>

      {/* EXPANDED CONTENT — visible only when hovered/active */}
      <CutReveal
        isVisible={isExpanded}
        delay={0}
        duration={0.45}
        className="flex-1 flex flex-col px-[1.5vw]"
      >
        <div className="flex flex-col gap-0 mt-[1vh]">
          {service.features.map((feature, i) => (
            <CutReveal
              key={feature}
              isVisible={isExpanded}
              delay={featureDelayBase + i * featureStagger}
              duration={0.45}
            >
              <span className="block font-['font-p-3'] text-[clamp(10px,0.85vw,14px)] leading-[2] tracking-wide opacity-70 uppercase">
                {feature}
              </span>
            </CutReveal>
          ))}
        </div>

        {/* Image placeholder — editorial accent */}
        <CutReveal
          isVisible={isExpanded}
          delay={imageDelay}
          duration={0.55}
          className="mt-[2vh] w-full aspect-[4/3] overflow-hidden"
        >
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(135deg, var(--dark-color) 0%, transparent 60%)',
              opacity: 0.06,
            }}
          />
        </CutReveal>

        {/* Description */}
        <CutReveal
          isVisible={isExpanded}
          delay={descriptionDelay}
          duration={0.5}
          className="mt-[2vh] pb-[3vh]"
        >
          <p className="font-['font-p-3'] text-[clamp(9px,0.75vw,13px)] leading-[1.65] tracking-wide uppercase opacity-55 m-0">
            {service.description}
          </p>
        </CutReveal>
      </CutReveal>
    </motion.div>
  );
}

export default ServiceCard;
