import { useEffect, useRef } from 'react'

const BentoGrid = ({ addCursor, removeCursor, cursorModes }) => {
  const ref = useRef(null)

  // useEffect(() => {
  //   const el = ref.current
  //   if (!el) return
  //   // const handleEnter = () => addCursor(cursorModes.TARGET)
  //   // const handleLeave = () => removeCursor(cursorModes.TARGET)
  //   el.addEventListener('mouseenter', handleEnter)
  //   el.addEventListener('mouseleave', handleLeave)
  //   return () => {
  //     el.removeEventListener('mouseenter', handleEnter)
  //     el.removeEventListener('mouseleave', handleLeave)
  //   }
  // }, [addCursor, removeCursor, cursorModes])

  return (
    <section ref={ref} className="w-full pt-[9vh] px-1">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">

        {/* ─── 2. HEADLINE CARD ──────── */}
        <div className="col-span-1 md:col-span-2 row-span-2 bg-[#D9D2C5] dark:bg-[#1F1F1F] rounded-[28px] p-6 md:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden transition-colors duration-500 min-h-[320px] md:min-h-[400px]">
          <div className="absolute top-4 right-4 md:top-6 md:right-6 opacity-30 dark:opacity-20">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="#121212" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="25" stroke="#121212" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="10" stroke="#121212" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#121212" strokeWidth="0.5" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#121212" strokeWidth="0.5" />
              <rect x="20" y="20" width="60" height="60" rx="4" stroke="#121212" strokeWidth="0.5" />
              <rect x="35" y="35" width="30" height="30" rx="2" stroke="#121212" strokeWidth="0.5" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-xs md:text-sm font-['font-p-3'] font-medium tracking-widest uppercase text-[#121212]/50 dark:text-[#E2DACB]/50 mb-3">
              Design &bull; Develop &bull; Deliver
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['font-p-1'] leading-tight tracking-tight text-[#121212] dark:text-[#E2DACB] max-w-xl">
              Pioneer<br />Revolutionizing<br />Design
            </h1>
          </div>
        </div>

        {/* ─── 3. PROFILE CARD ──────── */}
        <div className="col-span-1 row-span-2 bg-[#D9D2C5] dark:bg-[#1F1F1F] rounded-[28px] overflow-hidden relative group transition-colors duration-500 min-h-[320px] md:min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#121212]/5 to-[#121212]/20 dark:from-[#E2DACB]/5 dark:to-[#E2DACB]/10 transition-opacity duration-500" />
          <div className="w-full h-full flex items-center justify-center bg-[#2C2C2E] dark:bg-[#2C2C2E]">
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#4E4C43] via-[#3A3933] to-[#121212] dark:from-[#3A3933] dark:via-[#2C2C2E] dark:to-[#121212] group-hover:scale-105 transition-transform duration-700 ease-out flex items-end justify-center pb-6">
                <div className="text-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-[#E2DACB]/30 mx-auto mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[#E2DACB]/20 to-[#E2DACB]/5" />
                  </div>
                  <p className="text-[#E2DACB] font-['font-p-3'] text-sm tracking-widest uppercase opacity-60">
                    Portrait
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4. PROJECTS CARD ──────── */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#D9D2C5] dark:bg-[#1F1F1F] rounded-[28px] p-6 md:p-8 transition-colors duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-2xl overflow-hidden bg-[#121212]/5 dark:bg-[#E2DACB]/5 min-h-[180px] flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-[#4E4C43] to-[#2C2C2E] dark:from-[#3A3933] dark:to-[#1F1F1F] flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E2DACB" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {['E-Commerce Redesign', 'Brand Identity System', 'Dashboard Analytics'].map((item, i) => (
                <div key={item} className="flex items-center gap-3 group">
                  <span className="text-[#121212]/30 dark:text-[#E2DACB]/30 font-['font-p-3'] text-xs font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-sm md:text-base font-['font-p-3'] font-medium text-[#121212] dark:text-[#E2DACB]">
                    {item}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#121212]/30 dark:text-[#E2DACB]/30 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  {i < 2 && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#121212]/10 dark:bg-[#E2DACB]/10" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 5. BIO CARD ──────── */}
        <div className="col-span-1 bg-[#D9D2C5] dark:bg-[#1F1F1F] rounded-[28px] p-6 md:p-8 flex flex-col justify-center transition-colors duration-500 min-h-[240px]">
          <p className="text-sm md:text-base font-['font-p-4'] leading-relaxed text-[#121212]/80 dark:text-[#E2DACB]/80">
            I am a passionate designer based in Delhi, crafting digital experiences that blend aesthetics with functionality. Every line of code, every pixel placed with intent.
          </p>
        </div>

        {/* ─── 6. CONTACT CARD ──────── */}
        <div className="col-span-1 bg-[#4E4C43] dark:bg-[#4E4C43] rounded-[28px] p-6 md:p-8 flex flex-col justify-between transition-colors duration-500 min-h-[240px]">
          <div>
            <p className="text-xs font-['font-p-3'] font-medium tracking-widest uppercase text-[#E2DACB]/60">
              Have a Question?
            </p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-['font-p-1'] text-[#E2DACB]">
              Contact Me
            </h3>
            <div className="flex flex-col items-end gap-2">
              {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href={`https://${social.toLowerCase()}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-['font-p-3'] text-[#E2DACB]/70 hover:text-[#E2DACB] transition-colors duration-300"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default BentoGrid
