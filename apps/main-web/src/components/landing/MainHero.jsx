import { useEffect, useRef } from "react";
import Hero from "./Hero";

const MainHero = ({ addCursor, removeCursor, cursorModes }) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handleEnter = () => addCursor(cursorModes.FOLLOWER)
    const handleLeave = () => removeCursor(cursorModes.FOLLOWER)
    el.addEventListener('mouseenter', handleEnter)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mouseenter', handleEnter)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [addCursor, removeCursor, cursorModes])
  return (
    <>
      <div ref={ref} className="w-full relative min-h-[100vh] flex justify-between flex-col items-center bg-[#B5CFCF] overflow-hidden ">
        <div
          className="absolute inset-0 bottom-0 scale-105  h-full bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dczvhue59/image/upload/f_auto,q_auto/v1782389448/1000188258_caqvbu.png')" }}
        />
        <div className="absolute inset-0 h-full bg-black/10" />
        <div className="w-full h-2vh bg-gray-700"></div>
        <div className="mb-[5vh] relative z-10">
          <Hero />
        </div>
      </div>
    </>
  );
};

export default MainHero;
