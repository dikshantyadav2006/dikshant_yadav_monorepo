import { TransitionLink } from '@animation';
import { TextSwap } from '@dikshant/ui';

/**
 * FooterNav Component
 * Ultra-minimal centered navigation row.
 * Links slide upward slightly on scroll entry (handled by parent GSAP timeline).
 *
 * @param {Object} props
 * @param {Array<{label: string, href: string, external?: boolean, target?: string, rel?: string}>} props.links
 */
const FooterNav = ({ links }) => {
  return (
    <nav
      aria-label="Footer navigation"
      className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16"
    >
      {links.map((link) => {
        const El = link.external ? 'a' : TransitionLink;
        const base = link.external
          ? {
              href: link.href,
              target: '_blank',
              rel: 'noopener noreferrer',
            }
          : { href: link.href };
        return (
          <El
            key={link.href + link.label}
            {...base}
            className="
              group
              relative
              font-['font-p-3']
              text-xs md:text-sm
              font-medium
              uppercase
              tracking-[0.22em]
              text-[var(--dark-color)]/60
              dark:text-[var(--light-color)]/60
              transition-colors
              duration-300
              hover:text-[var(--dark-color)]
              dark:hover:text-[var(--light-color)]
              cursor-target
              cursor-none
              pb-1
            "
          >
            <span className="relative inline-block">
              <TextSwap text={link.label} stagger={0.025} />
              <span
                aria-hidden="true"
                className="
                  absolute
                  bottom-[-2px]
                  left-0
                  h-px
                  w-full
                  origin-left
                  scale-x-0
                  bg-current
                  transition-transform
                  duration-300
                  ease-out
                  group-hover:scale-x-100
                "
              />
            </span>
          </El>
        );
      })}
    </nav>
  );
};

export default FooterNav;
