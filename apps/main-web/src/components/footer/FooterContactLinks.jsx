import { TextSwap } from '@dikshant/ui';

/**
 * FooterContactLinks Component
 * Minimal contact + social links with smooth underline reveal on hover.
 *
 * @param {Object} props
 * @param {Array<{label: string, href: string, target?: string, rel?: string}>} props.links
 */
const FooterContactLinks = ({ links }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-14">
      {links.map((link) => (
        <a
          key={link.href + link.label}
          href={link.href}
          target={link.target}
          rel={link.rel || undefined}
          className="
            group
            relative
            inline-block
            font-['font-p-3']
            text-sm
            md:text-base
            font-normal
            tracking-wide
            text-[var(--dark-color)]/70
            dark:text-[var(--light-color)]/70
            transition-colors
            duration-300
            hover:text-[var(--dark-color)]
            dark:hover:text-[var(--light-color)]
            cursor-pointer
            pb-0.5
          "
        >
          <span className="relative inline-block">
            <TextSwap text={link.label} stagger={0.03} />
            <span
              aria-hidden="true"
              className="
                absolute
                bottom-0
                left-0
                h-px
                w-full
                origin-left
                scale-x-0
                bg-current
                transition-transform
                duration-500
                ease-[cubic-bezier(0.16,1,0.3,1)]
                group-hover:scale-x-100
              "
            />
          </span>
        </a>
      ))}
    </div>
  );
};

export default FooterContactLinks;
