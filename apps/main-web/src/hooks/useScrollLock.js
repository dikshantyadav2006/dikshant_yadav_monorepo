import { useEffect } from 'react';

/**
 * useScrollLock Hook
 * Locks/unlocks scroll based on showNav state
 * 
 * @param {object} scrollRef - Reference to Locomotive Scroll instance
 * @param {boolean} showNav - Whether navbar is open
 */
const useScrollLock = (scrollRef, showNav) => {
  useEffect(() => {
    if (scrollRef?.current) {
      if (showNav) {
        // Scroll ko pause kar do
        scrollRef.current.stop();
        // Background body ko bhi lock karo (extra safety)
        document.body.style.overflow = "hidden";
      } else {
        // Scroll wapas chalu karo
        scrollRef.current.start();
        document.body.style.overflow = "auto";
      }
    }
  }, [showNav, scrollRef]);
};

export default useScrollLock;
