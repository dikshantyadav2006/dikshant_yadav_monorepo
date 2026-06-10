import React, {useRef,useEffect} from "react";
import Hero from "./Hero";
import HeroAboutMe from "./HeroAboutMe";

const MainHero = ({ addCursor, removeCursor, cursorModes }) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Direct imperative event handlers (NO STATE)
    // On hover: Hide all cursors (for liquid ether interaction)
    const handleEnter = () => {
      addCursor(cursorModes.FOLLOWER)
    }
    // On leave: Restore splash cursor
    const handleLeave = () => {
      removeCursor(cursorModes.FOLLOWER)
    }

    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [addCursor, removeCursor, cursorModes])
  return (
    <>
      <div ref={ref} className="w-full  relative min-h-[100vh]  flex justify-between flex-col items-center ">
        <div className="w-full h-2vh bg-gray-700"></div>
        <div className="mb-[5vh]">
          <Hero />
        </div>
      </div>
    </>
  );
};

export default MainHero;
