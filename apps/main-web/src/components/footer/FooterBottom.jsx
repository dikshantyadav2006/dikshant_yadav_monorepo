/**
 * FooterBottom Component
 * Very subtle bottom row: copyright, built-with line, legal links.
 *
 * @param {Object} props
 * @param {string} props.currentYear
 * @param {string} props.fullName
 * @param {string} props.builtWith
 * @param {Array<{label: string, href: string}>} props.legal
 */
const FooterBottom = ({ currentYear, fullName, builtWith, legal }) => {
  return (
    <div className="border-t border-current/10 pt-4 md:pt-6">
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between md:gap-6">
        <p className="font-['font-p-2'] text-[10px] md:text-xs uppercase tracking-[0.18em] text-[var(--dark-color)]/45 dark:text-[var(--light-color)]/45">
          © {currentYear} {fullName}
        </p>

        <p className="hidden font-['font-p-2'] text-[10px] md:text-xs uppercase tracking-[0.18em] text-[var(--dark-color)]/35 dark:text-[var(--light-color)]/35 md:block md:text-center">
          {builtWith}
        </p>

        <nav aria-label="Legal" className="flex items-center gap-8">
          {legal.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="
                font-['font-p-2']
                text-[10px]
                md:text-xs
                uppercase
                tracking-[0.18em]
                text-[var(--dark-color)]/45
                dark:text-[var(--light-color)]/45
                transition-colors
                duration-300
                hover:text-[var(--dark-color)]
                dark:hover:text-[var(--light-color)]
                cursor-target
                cursor-none
              "
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="font-['font-p-2'] text-[10px] md:text-xs uppercase tracking-[0.18em] text-[var(--dark-color)]/35 dark:text-[var(--light-color)]/35 md:hidden">
          {builtWith}
        </p>
      </div>
    </div>
  );
};

export default FooterBottom;
