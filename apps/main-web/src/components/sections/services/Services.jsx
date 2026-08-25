import { useState, useCallback, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import ServicesHeader from './ServicesHeader';
import ServiceCard from './ServiceCard';
import ServiceAccordion from './ServiceAccordion';
import services from './servicesData';

function Services({ isDesktop }) {
  const [hoveredService, setHoveredService] = useState(-1);
  const [activeService, setActiveService] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const hoverTimer = useRef(null);

  const expandedIndex = hoveredService !== -1 ? hoveredService : activeService;

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  const scheduleHover = useCallback((index) => {
    clearTimeout(hoverTimer.current);
    // 60ms debounce — just enough to prevent flicker when crossing borders,
    // but feels immediate to the user
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
  }, []);

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
      className="w-full h-[85vh] flex flex-col overflow-hidden"
      onMouseLeave={handleSectionLeave}
    >
      <ServicesHeader />

      {isDesktop ? (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {services.map((service, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div
                key={service.id}
                className="min-w-0 flex flex-col overflow-hidden"
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
        <div className="flex-1 overflow-y-auto">
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
