import { useState } from 'react'
import { motion } from 'framer-motion'
import { TransitionLink } from '@animation'
import { DirectionalCursor, TextSwap } from '@dikshant/ui'
import { footerContent } from '@/constants/footerLinks'

const EASE = [0.16, 1, 0.3, 1]

const NAV_LINKS = [
  { index: '01', label: 'Home', href: '/', external: false },
  { index: '02', label: 'Connect', href: '/connect', external: false },
  { index: '03', label: 'Works', href: 'https://work.dikshantyadav.in', external: true },
  { index: '04', label: 'Posts', href: 'https://post.dikshantyadav.in', external: true },
]

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

const NavLinkRow = ({ link, onNavigate, onEnter, onLeave }) => {
  const className = `
    group
    relative
    flex
    items-center
    justify-between
    gap-4
    overflow-hidden
    rounded-2xl
    px-4
    py-2.5
    md:px-8
    md:py-3.5
    cursor-default
    outline-none
    transition-transform
    duration-200
    active:translate-y-px
    focus-visible:outline-2
    focus-visible:outline-offset-4
    focus-visible:outline-current
  `

  const content = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 rounded-2xl bg-[var(--dark-color)] opacity-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-hover:opacity-100 dark:bg-[var(--light-color)]"
      />
      <span className="relative z-10 flex items-baseline gap-3 md:gap-6">
        <span className="font-['font-p-3'] text-xs md:text-sm uppercase tracking-[0.3em] text-current/40 transition-colors duration-300 group-hover:text-[var(--light-color)] dark:group-hover:text-[var(--dark-color)]">
          {link.index}
        </span>
        <span className="relative z-10 inline-block">
          <span className="inline-block font-['font-p-1'] text-[clamp(34px,6vw,64px)] uppercase leading-[0.95] tracking-tight text-current transition-all duration-500 ease-out group-hover:translate-x-3 group-hover:text-[var(--light-color)] dark:group-hover:text-[var(--dark-color)]">
            {link.label}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className="relative z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-current/20 text-current/50 transition-all duration-500 ease-out group-hover:rotate-45 group-hover:border-current/40 group-hover:text-[var(--light-color)] md:flex md:h-14 md:w-14 dark:group-hover:text-[var(--dark-color)]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      </span>
    </>
  )

  return (
    <motion.li variants={itemVariants}>
      {link.external ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className={className}
        >
          {content}
        </a>
      ) : (
        <TransitionLink
          href={link.href}
          onClick={onNavigate}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className={className}
        >
          {content}
        </TransitionLink>
      )}
    </motion.li>
  )
}

const NavbarCard = ({ showNav, isDarkMode, navCardToggleButton }) => {
  const [cursorActive, setCursorActive] = useState(false)
  const [cursorMeta, setCursorMeta] = useState({
    label: '',
    rotation: 0,
    arrowRotation: 0,
    scaled: false,
  })

  const socials = footerContent.contactLinks.filter((l) =>
    ['Instagram', 'GitHub', 'LinkedIn'].includes(l.label),
  )

  const handleLinkEnter = () =>
    setCursorMeta({ label: 'Open', rotation: 0, arrowRotation: 45, scaled: true })

  const handleLinkLeave = () =>
    setCursorMeta({ label: '', rotation: 0, arrowRotation: 0, scaled: false })

  return (
    <div
      className="relative h-full w-full overflow-y-auto"
      onMouseEnter={() => setCursorActive(true)}
      onMouseLeave={() => setCursorActive(false)}
    >
      <DirectionalCursor
        active={cursorActive}
        label={cursorMeta.label}
        rotation={cursorMeta.rotation}
        arrowRotation={cursorMeta.arrowRotation}
        scaled={cursorMeta.scaled}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[10vh] select-none font-['font-p-1'] text-[clamp(120px,22vw,300px)] uppercase leading-none tracking-tight text-current opacity-[0.04] [-webkit-text-stroke:1.5px_currentColor] md:right-8 dark:opacity-[0.06]"
      >
        Menu
      </span>

      <nav aria-label="Primary" className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-between px-6 pb-4 pt-16 md:px-12 md:pb-6 md:pt-20 lg:px-16">
        <motion.div
          initial="hidden"
          animate={showNav ? 'show' : 'hidden'}
          variants={listVariants}
          className="flex min-h-full flex-col"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between font-['font-p-3'] text-[10px] uppercase tracking-[0.35em] md:text-xs"
          >
            <p className="text-current/50">Menu</p>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  isDarkMode ? 'bg-[var(--secondary-light-color)]' : 'bg-[var(--secondary-dark-color)]'
                }`}
              />
              <p className="text-current/50">Available for work</p>
            </div>
          </motion.div>

          <motion.ul variants={listVariants} className="flex flex-col pt-2 md:pt-4">
            {NAV_LINKS.map((link) => (
              <NavLinkRow
                key={link.href + link.label}
                link={link}
                onNavigate={navCardToggleButton}
                onEnter={handleLinkEnter}
                onLeave={handleLinkLeave}
              />
            ))}
          </motion.ul>

          <motion.div
            variants={itemVariants}
            className="mt-6 grid gap-6 border-t border-current/10 pt-5 md:grid-cols-3 md:gap-8 md:pt-6"
          >
            <div className="font-['font-p-3']">
              <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-current/40 md:text-xs">
                Email
              </p>
              <a
                href={`mailto:${footerContent.contact.email}`}
                className="inline-block text-sm tracking-wide text-current/80 transition-colors duration-300 hover:text-current md:text-base"
              >
                <TextSwap text={footerContent.contact.email} stagger={0.03} />
              </a>
            </div>

            <div className="font-['font-p-3']">
              <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-current/40 md:text-xs">
                Location
              </p>
              <p className="text-sm tracking-wide text-current/80 md:text-base">
                {footerContent.contact.address}
              </p>
            </div>

            <div className="font-['font-p-3']">
              <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-current/40 md:text-xs">
                Socials
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {socials.map((social) => (
                  <a
                    key={social.href + social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-block text-sm tracking-wide text-current/80 transition-colors duration-300 hover:text-current md:text-base"
                  >
                    <TextSwap text={social.label} stagger={0.03} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </nav>
    </div>
  )
}

export default NavbarCard