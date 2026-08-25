import { useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import ServicesHeader from './ServicesHeader';
import ServiceCard from './ServiceCard';
import ServiceAccordion from './ServiceAccordion';
import services from './servicesData';

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Computes desktop grid-template-columns based on which service is active.
 *
 * Default:  five equal columns  → 1fr 1fr 1fr 1fr 1fr
 * Expanded: one wide + four thin → 0.6fr 0.6fr 2.2fr 0.6fr 0.6fr
 */
function getGridColumns(activeIndex) {
  if (activeIndex === -1) {
    return 'repeat(5, 1fr)';
  }
  return services
    .map((_, i) => (i === activeIndex ? '2.2fr' : '0.6fr'))
    .join(' ');
}

/**
 * Services — Main orchestrator
 *
 * Desktop: 5-column interactive grid with hover/active expansion
 * Mobile:  vertical accordion with click-to-expand
 *
 * @param {Object} props
 * @param {boolean} props.isDesktop - whether to use desktop grid layout
 */
function Services({ isDesktop }) {
  const [hoveredService, setHoveredService] = useState(-1);
  const [activeService, setActiveService] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const expandedIndex = hoveredService !== -1 ? hoveredService : activeService;

  const handleMouseLeave = useCallback(() => {
    setHoveredService(-1);
  }, []);

  const handleCardClick = useCallback(
    (index) => {
      setActiveService((prev) => (prev === index ? -1 : index));
    },
    [],
  );

  const handleAccordionToggle = useCallback((index) => {
    setMobileOpen((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="w-full">
      <ServicesHeader />

      {/* DESKTOP: 5-column interactive grid */}
      {isDesktop ? (
        <div
          className="w-full grid min-h-[65vh]"
          onMouseLeave={handleMouseLeave}
          style={{
            gridTemplateColumns: getGridColumns(expandedIndex),
            transition: shouldReduceMotion
              ? 'none'
              : `grid-template-columns 0.6s ${EASING}`,
          }}
        >
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              isExpanded={expandedIndex === i}
              onHover={() => setHoveredService(i)}
              onClick={() => handleCardClick(i)}
            />
          ))}
        </div>
      ) : (
        /* MOBILE: vertical accordion */
        <div className="w-full">
          {services.map((service, i) => (
            <ServiceAccordion
              key={service.id}
              service={service}
              isOpen={mobileOpen === i}
              onToggle={() => handleAccordionToggle(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Services;
