'use client';

import React, { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion((window.scrollY / scrollHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-[9999] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-accent via-indigo-500 to-cyan-400 transition-all duration-75 ease-out"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
export default ReadingProgress;
