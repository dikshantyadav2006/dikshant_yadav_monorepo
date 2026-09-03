import { useState, useCallback, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { DirectionalCursor } from '@dikshant/ui';
import ServicesHeader from './ServicesHeader';
import ServiceCard from './ServiceCard';
import ServiceAccordion from './ServiceAccordion';
import services from './servicesData';

function Services({ isDesktop }) {
  const [hoveredService, setHoveredService] = useState(-1);
  const [activeService, setActiveService] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(null);
  const [cursorActive, setCursorActive] = useState(false);
  const [linkHover, setLinkHover] = useState(false);
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
    setLinkHover(false);
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
      className={`w-full flex flex-col${isDesktop ? ' cursor-none' : ''} min-h-[110vh]`}
      onMouseEnter={handleSectionEnter}
      onMouseLeave={handleSectionLeave}
    >
      {/* Shared directional cursor (same as work-site project nav)
          Active over the whole section; arrow rotates 45° right + small scale on link hover */}
      <DirectionalCursor
        active={cursorActive}
        label={linkHover ? 'Open' : 'Scroll'}
        rotation={linkHover ? 45 : 0}
        scaled={linkHover}
      />
      <ServicesHeader />

      {isDesktop ? (
        <div className="w-full flex flex-1">
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
                onMouseEnter={() => {
                  scheduleHover(i);
                  setLinkHover(true);
                }}
                onMouseLeave={() => {
                  cancelHover();
                  setLinkHover(false);
                }}
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
