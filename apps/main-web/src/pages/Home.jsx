import MainHero from "../components/landing/MainHero";
import { Footer } from '@components/footer';
import { ThinkingNote, LogoMarquee } from '@sections';
import { DomainNetwork } from '@dikshant/ui';
import { Section } from '@layout';

function Home({ addCursor, removeCursor, cursorModes, isDarkMode, isDesktop }) {
  return (
    <>
      <Section
        id="hero"
        as="div"
        className="relative w-full"
      >
        <MainHero addCursor={addCursor} removeCursor={removeCursor} cursorModes={cursorModes} isDesktop={isDesktop} />
      </Section>
      <div className="w-screen" data-scroll-container>
        <Section id="thinking">
          <ThinkingNote addCursor={addCursor} removeCursor={removeCursor} cursorModes={cursorModes} />
          <div className="mix-blend-difference">
              <LogoMarquee isDarkMode={isDarkMode} />
          </div>
        </Section>
        <Section id="footer">
          <Footer addCursor={addCursor} removeCursor={removeCursor} cursorModes={cursorModes} />
        </Section>
      </div>
    </>
  );
}

export default Home;
