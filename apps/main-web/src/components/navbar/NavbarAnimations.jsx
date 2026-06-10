import { useRef } from "react";
import gsap from "gsap";

const useNavbarAnimations = (showNav, setShowNav) => {
  const navCardRef = useRef([]);
  const spanRefs = useRef([]);
  const navCardLinksRefs = useRef([]);

  // Animate the Navbar (Show/Hide)
  const animateNavbarCard = () => {
    gsap.to(navCardRef.current, {
      opacity: 1,
      y: showNav ? "-150%" : "0%",
      duration: 1,
      ease: "power1.out",
    });

    setShowNav(!showNav);
  };

  const navCardToggleButton = () => {
    animateNavbarCard();

    if (!showNav) {
      gsap.to(spanRefs.current[0], {
        x: "100%",
        y: "100%",
        duration: 0.5,
        ease: "power1.inOut",
        rotate: "45deg",
      });

      gsap.to(spanRefs.current[1], {
        opacity: 0,
        x: "100%",
        delay: 0.5,
        duration: 0.5,
        ease: "power1.inOut",
      });

      gsap.to(spanRefs.current[2], {
        x: "100%",
        y: "-100%",
        duration: 0.5,
        ease: "power1.inOut",
        rotate: "-45deg",
      });

    } else {
      gsap.to(spanRefs.current[0], {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power1.inOut",
        rotate: "0deg",
      });

      gsap.to(spanRefs.current[1], {
        x: 0,
        opacity: 1,
        duration: 0.5,
        delay:.5,
        ease: "power1.inOut",
      });

      gsap.to(spanRefs.current[2], {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power1.inOut",
        rotate: "0deg",
      });
    }
  };

  return { navCardRef, spanRefs, navCardLinksRefs, navCardToggleButton };
};

export default useNavbarAnimations;
