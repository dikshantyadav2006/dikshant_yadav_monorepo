'use client';

import { useEffect, useRef } from 'react';

const linkBase = {
  fontFamily: 'Geist, Inter, sans-serif',
  fontSize: 13,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  padding: '14px 28px',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 999,
  background: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

/**
 * NotFoundPage
 *
 * Shared, framework-agnostic 404 page. Renders as a full-viewport dark
 * section styled to match the dikshantyadav.in portfolio.
 *
 * Portability notes:
 * - Core layout uses inline styles so it works in any Tailwind config
 *   (main-web, post-web, work-web) or no Tailwind at all.
 * - Pass a `LinkComponent` (e.g. react-router `Link` or `next/link`)
 *   to avoid full-page reloads; defaults to a plain anchor tag.
 *
 * @param {Object}  props
 * @param {string|Function} [props.LinkComponent='a'] - Element used for CTAs
 * @param {string}  [props.linkProp='href']  - Which prop drives navigation:
 *                                             'href' (plain <a>, next/link) or
 *                                             'to' (react-router Link)
 * @param {string}  [props.homeHref='/']      - Destination for "back home"
 * @param {string}  [props.connectHref='/connect'] - Destination for "connect"
 * @param {string}  [props.code='404']        - Big status code
 * @param {string}  [props.title='PAGE NOT FOUND']
 * @param {string}  [props.description]
 * @param {Object}  [props.cursorEvents]      - { addCursor, removeCursor, cursorModes }
 */
function NotFoundPage({
  LinkComponent = 'a',
  linkProp = 'href',
  homeHref = '/',
  connectHref = '/connect',
  code = '404',
  title = 'PAGE NOT FOUND',
  description = "This page wandered off the network. Let's route you back to somewhere that exists.",
  cursorEvents = null,
}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!cursorEvents || !sectionRef.current) return;
    const { addCursor, removeCursor, cursorModes } = cursorEvents;
    const el = sectionRef.current;
    const handleEnter = () => addCursor(cursorModes.TARGET);
    const handleLeave = () => removeCursor(cursorModes.TARGET);
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [cursorEvents]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#121315',
        color: '#ffffff',
        overflow: 'hidden',
        padding: '96px 24px',
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 50% 40%, rgba(139,92,246,0.10), transparent 60%)',
        }}
      />

      {/* Ghost grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: 640,
        }}
      >
        <p
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 12,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(139,92,246,0.9)',
            marginBottom: 16,
          }}
        >
          Error — Route Offline
        </p>

        <h1
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(96px, 24vw, 220px)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            margin: 0,
            background:
              'linear-gradient(180deg, #ffffff 30%, rgba(139,92,246,0.35))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            userSelect: 'none',
          }}
        >
          {code}
        </h1>

        <h2
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 'clamp(14px, 2vw, 18px)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 500,
            margin: '28px 0 14px',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 15,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 460,
            margin: '0 auto 40px',
          }}
        >
          {description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <LinkComponent
            {...(linkProp === 'to' ? { to: homeHref } : { href: homeHref })}
            style={linkBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#121315';
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
            }}
          >
            ← Back Home
          </LinkComponent>

          <LinkComponent
            {...(linkProp === 'to' ? { to: connectHref } : { href: connectHref })}
            style={{
              ...linkBase,
              background: '#8b5cf6',
              borderColor: '#8b5cf6',
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#a78bfa';
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#8b5cf6';
              e.currentTarget.style.borderColor = '#8b5cf6';
            }}
          >
            Connect ↗
          </LinkComponent>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
