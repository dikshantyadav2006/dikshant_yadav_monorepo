import { motion, AnimatePresence } from 'framer-motion';
import CutReveal from './CutReveal';

const EASING = [0.16, 1, 0.3, 1];

/**
 * ServiceAccordion — Mobile vertical accordion
 *
 * Each service is a horizontal row. Clicking expands it vertically.
 * Content reveals with the same cut/mask animation as desktop.
 * Height animates naturally — no fixed values.
 */
function ServiceAccordion({ service, isOpen, onToggle }) {

  return (
    <div
      className="border-b border-[--dark-color]/20 dark:border-[--light-color]/20"
      role="region"
    >
      {/* ACCORDION TRIGGER */}
      <button
        className="w-full flex items-center justify-between px-[5vw] py-[3.5vh] bg-transparent border-none cursor-pointer text-left group"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`service-panel-${service.id}`}
      >
        <div className="flex items-baseline gap-[3vw]">
          <span className="font-['font-p-2'] text-[10px] tracking-[0.15em] uppercase opacity-40 shrink-0">
            {service.id}
          </span>
          <span className="font-['font-p-1'] text-[clamp(16px,4.5vw,28px)] leading-none tracking-tight uppercase m-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
            {service.title}
          </span>
        </div>

        {/* Plus / Minus indicator */}
        <motion.span
          className="font-['font-p-2'] text-lg leading-none opacity-40 shrink-0"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASING }}
        >
          +
        </motion.span>
      </button>

      {/* ACCORDION PANEL */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`service-panel-${service.id}`}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.5, ease: EASING },
              opacity: { duration: 0.35, ease: EASING },
            }}
            className="overflow-hidden"
          >
            <div className="px-[5vw] pb-[4vh]">
              {/* Features — cut reveal */}
              <div className="flex flex-col gap-0 mt-[1vh]">
                {service.features.map((feature, i) => (
                  <CutReveal
                    key={feature}
                    isVisible={isOpen}
                    delay={0.1 + i * 0.06}
                    duration={0.4}
                  >
                    <span className="block font-['font-p-3'] text-[13px] leading-[2.2] tracking-wide opacity-70 uppercase">
                      {feature}
                    </span>
                  </CutReveal>
                ))}
              </div>

              {/* Image placeholder */}
              <CutReveal
                isVisible={isOpen}
                delay={0.38}
                duration={0.5}
                className="mt-[3vh] w-full aspect-[16/9] overflow-hidden"
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
                isVisible={isOpen}
                delay={0.48}
                duration={0.45}
                className="mt-[3vh]"
              >
                <p className="font-['font-p-3'] text-[12px] leading-[1.7] tracking-wide uppercase opacity-55 m-0">
                  {service.description}
                </p>
              </CutReveal>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ServiceAccordion;
