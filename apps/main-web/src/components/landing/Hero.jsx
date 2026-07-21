import React from "react";
import CreativeText from "../animation/text/CreativeText";

const Hero = () => {
  return (
    <div>
      <div className="flex justify-between items-center flex-wrap flex-col gap-5 lg:flex-row selection:bg-transparent selection:text-[--dark-color]">
        <div className="uppercase text-[12vh] h-[13vh] md:text-[20vh] md:h-[21vh] lg:text-[10vw] relative lg:h-[11vw] font-[text1] overflow-hidden p-0 inline-block scale-y-150 sm:scale-y-125 sm:scale-x-150 md:scale-y-100 lg:scale-x-100 text-[#F94A13]">
          <CreativeText text={"creative "} />
        </div>

        <div className="uppercase text-[12vh] h-[13vh] md:text-[20vh] md:h-[21vh] lg:text-[10vw] relative lg:h-[11vw] font-[text1] overflow-hidden p-0 inline-block scale-y-150 md:scale-y-100 sm:scale-y-125 sm:scale-x-150 lg:scale-x-100 text-[#F94A13]">
          <CreativeText text={"developer"} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
