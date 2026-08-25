const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

function ServicesHeader() {
  return (
    <div className="w-full flex items-start justify-between px-[4vw] md:px-[6vw] lg:px-[4vw] border-b border-[--dark-color]/20 dark:border-[--light-color]/20">
      <h2 className="font-['font-p-1'] text-[clamp(48px,10vh,120px)] leading-none tracking-tight uppercase m-0 p-0 select-none">
        SERVICES
      </h2>
      <span className="font-['font-p-2'] text-[10px] md:text-xs uppercase tracking-widest opacity-50 mt-[2vh]">
        DSGN/4
      </span>
    </div>
  );
}

export default ServicesHeader;
