import React, { useState } from "react";
import { Nav, TopScroller } from '@components/navbar';
import MainHero from "./components/landing/MainHero";
import useNavbarAnimations from "./components/navbar/NavbarAnimations";
import { Footer } from '@components/footer';
import { BackgroundLayers } from '@layout';
import { LogoMarquee, OutroMarquee, ThinkingNote, Projects_showcase } from '@sections';
import { useLocomotiveScroll, useScrollLock, useDarkMode, useCustomCursorHook } from '@hooks';
import { ElasticString, LandingAnimation ,AnimationCircularText2 } from '@animation';



function App() {

  // =================================================================================================
  const { scrollRef } = useLocomotiveScroll();

  // Navbar State & Refs for Animations
  const [showNav, setShowNav] = useState(false);
  const { navCardRef, spanRefs, navCardLinksRefs, navCardToggleButton } =
    useNavbarAnimations(showNav, setShowNav);

  // Scroll Lock Logic
  useScrollLock(scrollRef, showNav);

  // Dark Mode Hook with localStorage persistence
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Custom cursor hook - MULTI-CURSOR SET-BASED SYSTEM
  // Allows multiple cursors simultaneously (e.g., SPLASH + TARGET)
  // React is EVENT DISPATCHER ONLY, cursor logic is fully isolated
  const {
    CursorRenderer,
    addCursor,
    removeCursor,
    clearCursors,
    cursorModes
  } = useCustomCursorHook()

  return (
    <>
      {/* CRITICAL: CursorRenderer at TOP LEVEL, OUTSIDE all state and blend-mode divs */}
      {/* Renders once, persists for entire app lifetime, never re-mounts */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99999] ">
        <LandingAnimation />
      </div>
      <div className="mix-blend-difference z-[9999] pointer-events-none fixed top-0 left-0 w-full h-full">
        <CursorRenderer />
      </div>

      <div
        className={`dark:selection:bg-[--light-color] dark:selection:text-[--dark-color] relative w-screen  transition-colors duration-500 text-[--dark-color] dark:text-[--light-color] 
        }`}
      >
        <BackgroundLayers isDarkMode={isDarkMode} />
        <nav className="w-screen fixed z-[999]">
          <TopScroller />
          <Nav
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            showNav={showNav}
            navCardToggleButton={navCardToggleButton}
            navCardRef={navCardRef}
            spanRefs={spanRefs}
            navCardLinksRefs={navCardLinksRefs}
            addCursor={addCursor}
            removeCursor={removeCursor}
            cursorModes={cursorModes}
          />
        </nav>
        <MainHero
          addCursor={addCursor}
          removeCursor={removeCursor}
          cursorModes={cursorModes}
        />
        <div className="relative" style={{ width: "100vw", paddingTop: "30px", overflowX: "hidden", overflowY: "visible" }}>
          <div className="absolute top-[-60%] lg:top-[-40%] left-[15%] lg:left-[-15%]  w-full h-full pointer-events-none  mix-blend-difference text-white">
            <AnimationCircularText2 items={[
            { text: "CREATE •", radius: 100, fontSize: 20 },
            { text: "INNOVATE • INSPIRE • ", radius: 150, fontSize: 20 },
            { text: "DEPLOY • ", radius: 180, fontSize: 20 },
            { text: "DESIGN • DEVELOP • ", radius: 200, fontSize: 16 }
          ]}
          />
          </div>
          {/* This will be full screen width */}
          <ElasticString height={300} />
        </div>
        <div className="w-screen" data-scroll-container>
          {/* Other Sections can go here */}
          <OutroMarquee />
          <div className="X">
            <ThinkingNote
              addCursor={addCursor}
              removeCursor={removeCursor}
              cursorModes={cursorModes}
            />

            {/* <Projects_showcase
              addCursor={addCursor}
              removeCursor={removeCursor}
              cursorModes={cursorModes}
              isDarkMode={isDarkMode}
            /> */}
            <LogoMarquee isDarkMode={isDarkMode} />
          </div>
          <Footer
            addCursor={addCursor}
            removeCursor={removeCursor}
            cursorModes={cursorModes}
          />
        </div>
      </div>
    </>
  );
}

export default App;
