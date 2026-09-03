import React from 'react';

/**
 * FooterTaglines Component
 * Small uppercase role descriptors under the name.
 *
 * @param {Object} props
 * @param {string[]} props.taglines
 */
const FooterTaglines = ({ taglines }) => {
  return (
    <p
      aria-label="Roles"
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-x-5
        gap-y-2
        md:gap-x-10
        font-['font-p-3']
        text-[10px]
        md:text-xs
        font-medium
        uppercase
        tracking-[0.28em]
        text-[var(--dark-color)]/55
        dark:text-[var(--light-color)]/55
      "
    >
      {taglines.map((tagline, i) => (
        <React.Fragment key={tagline}>
          {i > 0 && (
            <span
              aria-hidden="true"
              className="w-1 h-1 rounded-full bg-current opacity-40"
            />
          )}
          <span>{tagline}</span>
        </React.Fragment>
      ))}
    </p>
  );
};

export default FooterTaglines;
