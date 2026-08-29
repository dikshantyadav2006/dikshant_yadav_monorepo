import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTransition, TRANSITION_PHASE } from './TransitionContext';

const MotionLink = motion(Link);

const TransitionLink = forwardRef(function TransitionLink(
  { href, children, onClick, target, rel, ...rest },
  ref,
) {
  const { startTransition, phase } = useTransition();
  const location = useLocation();

  const handleClick = (e) => {
    if (phase !== TRANSITION_PHASE.IDLE) {
      e.preventDefault();
      return;
    }
    if (target === '_blank') return;
    if (href === location.pathname) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    onClick?.();
    startTransition(href);
  };

  return (
    <MotionLink
      ref={ref}
      to={href}
      onClick={handleClick}
      target={target}
      rel={rel}
      {...rest}
    >
      {children}
    </MotionLink>
  );
});

export default TransitionLink;
