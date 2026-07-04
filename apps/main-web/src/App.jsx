import { useState, useEffect } from "react";
import { Nav, TopScroller } from '@components/navbar';
import MainHero from "./components/landing/MainHero";
import useNavbarAnimations from "./components/navbar/NavbarAnimations";
import { Footer } from '@components/footer';
import { BackgroundLayers } from '@layout';
import { OutroMarquee, ThinkingNote, LogoMarquee } from '@sections';
import { useLocomotiveScroll, useScrollLock, useDarkMode, useCustomCursorHook } from '@hooks';
import { ElasticString, LandingAnimation ,AnimationCircularText2 } from '@animation';



function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function App() {
  const isDesktop = useIsDesktop();

  const { scrollRef } = useLocomotiveScroll();

  const [showNav, setShowNav] = useState(false);
  const { navCardRef, spanRefs, navCardToggleButton } =
    useNavbarAnimations(showNav, setShowNav);

  useScrollLock(scrollRef, showNav);

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const { CursorRenderer, addCursor, removeCursor, cursorModes } = useCustomCursorHook()

  return (
    <>
      {/* CRITICAL: CursorRenderer at TOP LEVEL, OUTSIDE all state and blend-mode divs */}
      {/* Renders once, persists for entire app lifetime, never re-mounts */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99999] ">
        <LandingAnimation />
      </div>
      <div className="mix-blend-difference z-[9999] pointer-events-none fixed top-0 left-0 w-full h-full">
        <CursorRenderer />
      </div >
      <div className="sticky top-0 left-0 w-full h-[100vh] z-0">
        <MainHero addCursor={addCursor} removeCursor={removeCursor} cursorModes={cursorModes} />
      </div>
      <nav className="fixed top-0 left-0 w-screen z-[999]">
        <TopScroller />
        <Nav
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          showNav={showNav}
          navCardToggleButton={navCardToggleButton}
          navCardRef={navCardRef}
          spanRefs={spanRefs}
          addCursor={addCursor}
          removeCursor={removeCursor}
          cursorModes={cursorModes}
        />
      </nav>
      <div className="relative dark:selection:bg-[--light-color] dark:selection:text-[--dark-color] z-0 w-screen transition-colors duration-500 text-[--dark-color] dark:text-[--light-color]">
        <BackgroundLayers isDarkMode={isDarkMode} />
        {isDesktop && (
          <div className="relative" style={{ width: "100vw", paddingTop: "30px", overflowX: "hidden", overflowY: "visible" }}>
            <div className="absolute top-[-60%] lg:top-[-40%] left-[15%] lg:left-[-15%] w-full h-full pointer-events-none mix-blend-difference text-white">
              <AnimationCircularText2 items={[
                { text: "CREATE •", radius: 100, fontSize: 20 },
                { text: "INNOVATE • INSPIRE • ", radius: 150, fontSize: 20 },
                { text: "DEPLOY • ", radius: 180, fontSize: 20 },
                { text: "DESIGN • DEVELOP • ", radius: 200, fontSize: 16 }
              ]}
              />
            </div>
            <ElasticString height={300} />
          </div>
        )}
        <div className="w-screen" data-scroll-container>
          <OutroMarquee />
          <div>
            <ThinkingNote addCursor={addCursor} removeCursor={removeCursor} cursorModes={cursorModes} />
            <LogoMarquee isDarkMode={isDarkMode} />
          </div>
          <Footer addCursor={addCursor} removeCursor={removeCursor} cursorModes={cursorModes} />
        </div>
      </div>
    </>
  );
}

export default App;
