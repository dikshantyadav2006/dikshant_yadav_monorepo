import { useState, useCallback, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import ServicesHeader from './ServicesHeader';
import ServiceCard from './ServiceCard';
import ServiceAccordion from './ServiceAccordion';
import ServiceCursor from './ServiceCursor';
import services from './servicesData';

function Services({ isDesktop }) {
  const [hoveredService, setHoveredService] = useState(-1);
  const [activeService, setActiveService] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(null);
  const [cursorActive, setCursorActive] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const hoverTimer = useRef(null);

  const expandedIndex = hoveredService !== -1 ? hoveredService : activeService;

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  const scheduleHover = useCallback((index) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoveredService(index);
    }, 60);
  }, []);

  const cancelHover = useCallback(() => {
    clearTimeout(hoverTimer.current);
  }, []);

  const handleSectionLeave = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setHoveredService(-1);
    setCursorActive(false);
    document.body.style.cursor = '';
  }, []);

  const handleSectionEnter = useCallback(() => {
    if (isDesktop) {
      setCursorActive(true);
      document.body.style.cursor = 'none';
    }
  }, [isDesktop]);

  const handleCardClick = useCallback((index) => {
    clearTimeout(hoverTimer.current);
    setActiveService((prev) => (prev === index ? -1 : index));
    setHoveredService(-1);
  }, []);

  const handleAccordionToggle = useCallback((index) => {
    setMobileOpen((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div
      className={`w-full flex flex-col${isDesktop ? ' cursor-none' : ''}`}
      onMouseEnter={handleSectionEnter}
      onMouseLeave={handleSectionLeave}
    >
      <ServiceCursor active={cursorActive} />
      <ServicesHeader />

      {isDesktop ? (
        <div className="w-full flex min-h-[55vh]">
          {services.map((service, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div
                key={service.id}
                className="min-w-0"
                style={{
                  flexGrow: isExpanded ? 1.45 : 1,
                  flexShrink: 1,
                  flexBasis: '0%',
                  minWidth: 0,
                  willChange: 'flex-grow',
                  transition: shouldReduceMotion
                    ? 'none'
                    : 'flex-grow 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseEnter={() => scheduleHover(i)}
                onMouseLeave={cancelHover}
              >
                <ServiceCard
                  service={service}
                  index={i}
                  isExpanded={isExpanded}
                  onClick={() => handleCardClick(i)}
                />
              </div>
            );
          })}
        </div>
      ) : (
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
