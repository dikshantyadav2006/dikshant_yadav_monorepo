import { motion } from 'framer-motion';
import { Footer } from '@components/footer';
import { LogoMarquee } from '@sections';
import { DomainNetwork } from '@dikshant/ui';
import { ScrambledText } from '@animation';
import { Section } from '@layout';
import { footerContent } from '@/constants/footerLinks';

const channelVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 * i },
  }),
};

function Connect({ addCursor, removeCursor, cursorModes, isDarkMode }) {
  return (
    <div className="w-screen" data-scroll-container>
      {/* ─── Hero ─────────────── */}
      <Section id="connect" as="header" className="relative w-full min-h-[72vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <p className="font-['Inter',_sans-serif] text-xs md:text-sm uppercase tracking-[0.35em] text-[var(--dark-color)]/50 dark:text-[var(--light-color)]/50 mb-6">
          hello@dikshantyadav.in
        </p>

        <h1 className="font-['font-p-1'] uppercase leading-none tracking-tight text-[var(--dark-color)] dark:text-[var(--light-color)]">
          <ScrambledText
            radius={120}
            duration={1.1}
            speed={0.6}
            scrambleChars="<>"
            className="!m-0 !max-w-none !font-['font-p-1'] !text-[clamp(48px,11vw,160px)] !leading-none uppercase"
          >
            Let’s connect
          </ScrambledText>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -80px 0px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-['font-p-4'] text-base md:text-xl uppercase leading-relaxed tracking-wide font-extralight max-w-2xl mt-8 text-[var(--dark-color)]/70 dark:text-[var(--light-color)]/70"
        >
          Open to collaborations, freelance projects, and good conversations.
          Pick a channel below — the network will take it from here.
        </motion.p>
      </Section>

      {/* ─── Domain network ───── */}
      <Section id="network">
        <DomainNetwork
          isDarkMode={isDarkMode}
          cursorEvents={{ addCursor, removeCursor, cursorModes }}
        />
      </Section>

      {/* ─── Footer (form + brand) ── */}
      <Section id="footer">
        <Footer
          addCursor={addCursor}
          removeCursor={removeCursor}
          cursorModes={cursorModes}
          isDarkMode={isDarkMode}
        />
      </Section>
    </div>
  );
}

export default Connect;
