import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Nav, TopScroller } from '@components/navbar';
import useNavbarAnimations from "./components/navbar/NavbarAnimations";
import { SectionBackgroundProvider } from '@layout';
import { useLocomotiveScroll, useScrollLock, useDarkMode, useCustomCursorHook } from '@hooks';
import { LandingAnimation, TransitionShell } from '@animation';
import Home from "./pages/Home";
import Connect from "./pages/Connect";
import NotFound from "./pages/NotFound";



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
  const location = useLocation();

  const { scrollRef } = useLocomotiveScroll([location.pathname]);

  const [showNav, setShowNav] = useState(false);
  const { navCardRef, spanRefs, navCardToggleButton } =
    useNavbarAnimations(showNav, setShowNav);

  useScrollLock(scrollRef, showNav);

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const { CursorRenderer, addCursor, removeCursor, cursorModes } = useCustomCursorHook()

  const cursorProps = { addCursor, removeCursor, cursorModes }

  return (
    <TransitionShell>
      {/* CRITICAL: CursorRenderer at TOP LEVEL, OUTSIDE all state and blend-mode divs */}
      {/* Renders once, persists for entire app lifetime, never re-mounts */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99999] ">
        <LandingAnimation />
      </div>
      <div className="mix-blend-difference z-[9999] pointer-events-none fixed top-0 left-0 w-full h-full">
        <CursorRenderer />
      </div >
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
        <SectionBackgroundProvider isDarkMode={isDarkMode}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  {...cursorProps}
                  isDarkMode={isDarkMode}
                  isDesktop={isDesktop}
                />
              }
            />
            <Route
              path="/connect"
              element={
                <Connect
                  {...cursorProps}
                  isDarkMode={isDarkMode}
                />
              }
            />
            <Route
              path="*"
              element={
                <NotFound {...cursorProps} />
              }
            />
          </Routes>
        </SectionBackgroundProvider>
      </div>
    </TransitionShell>
  );
}

export default App;
