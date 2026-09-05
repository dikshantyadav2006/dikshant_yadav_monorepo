import { useState, useLayoutEffect, useRef } from 'react';
import light from '../../assets/images/light.png';
import dark from '../../assets/images/dark.png';
import { GlowCursor } from '@dikshant/ui';
import NavbarCard from './NavbarCard.jsx';

const Nav = ({ isDarkMode, toggleDarkMode, showNav, navCardToggleButton, navCardRef, spanRefs }) => {
  const topBarRef = useRef(null);
  const [cardInset, setCardInset] = useState(0);

  const measureCardInset = () => {
    setCardInset(topBarRef.current ? topBarRef.current.offsetHeight : 0);
  };

  useLayoutEffect(() => {
    measureCardInset();
    window.addEventListener('resize', measureCardInset);
    return () => window.removeEventListener('resize', measureCardInset);
  }, []);

  const cardStyle = {
    top: cardInset,
    height: `calc(100dvh - ${cardInset}px)`,
  };

  return (
    <>
      <GlowCursor
        color={isDarkMode ? '#c9e7e7' : '#1d1e20'}
        secondaryColor={isDarkMode ? '#8dc8db' : '#3a3b3d'}
        trailLength={32}
        trailWidth={5}
        trailTaper={0.8}
        followSpeed={0.16}
        glowIntensity={1.4}
        glowSpread={1.0}
        hotspot={0.4}
        brightness={0.9}
        opacity={0.45}
        pulseSpeed={0.7}
        noiseStrength={0.03}
        idleFade
        idleTimeout={700}
        fadeDuration={900}
        blendMode={isDarkMode ? 'screen' : 'multiply'}
      >
        <nav ref={topBarRef} className="relative w-full cursor-default px-2 md:px-20 py-2 flex justify-between items-center">
          <h1 className="text-[.8rem] uppercase font-thin font-['boldtext'] text-[#F94A13]">Dikshant</h1>
          <div  className={`flex cursor-target justify-between min-h-[26px] transition-all items-center gap-1 bg-[--dark-color] dark:bg-[--light-color] ${showNav ? "rounded-sm pr-10" : "pr-2 rounded-lg"} pl-2 py-2`}>
            <button onClick={toggleDarkMode} className="px-2 cursor-target cursor-pointer ">
            {isDarkMode ? (
              <img className="p-[5px] rounded-full h-7 bg-[#1d1e20] opacity-70" src={light} alt="light mode icon" />
            ) : (
              <img className="p-[5px] rounded-full h-7 bg-[--dark-color] opacity-70 mix-blend-difference" src={dark} alt="dark mode icon" />
            )}
            </button>
            <div onClick={navCardToggleButton} className={`flex cursor-pointer items-center flex-col ${showNav ? "gap-[0px]" : "gap-[4px]"}`}>
              <span ref={(el) => (spanRefs.current[0] = el)} className={`w-8 h-[4px] cursor-pointer inline-block bg-[--light-color] dark:bg-[--dark-color] ${showNav ? "rounded-full" : "rounded-none"}`}></span>
              <span ref={(el) => (spanRefs.current[1] = el)} className={`w-8 h-[4px] cursor-pointer inline-block bg-[--light-color] dark:bg-[--dark-color] ${showNav ? "rounded-full" : "rounded-none"}`}></span>
              <span ref={(el) => (spanRefs.current[2] = el)} className={`w-8 h-[4px] cursor-pointer inline-block bg-[--light-color] dark:bg-[--dark-color] ${showNav ? "rounded-full" : "rounded-none"}`}></span>
            </div>
          </div>
        </nav>
      </GlowCursor>
      <div ref={navCardRef} style={cardStyle} className={`z-[-1] left-0 absolute w-full ${showNav ? "bg-[--light-color] dark:bg-[--dark-color] text-[--dark-color] dark:text-[--light-color]" : "pointer-events-none bg-[--dark-color] dark:bg-[--light-color] text-[--light-color] dark:text-[--dark-color] "} border-b-2 border-[--dark-color] dark:border-[--light-color] `}  >
      <NavbarCard 
            showNav={showNav}
            isDarkMode={isDarkMode}
            navCardToggleButton={navCardToggleButton}
      />
      </div>
    </>
  );
};

export default Nav;