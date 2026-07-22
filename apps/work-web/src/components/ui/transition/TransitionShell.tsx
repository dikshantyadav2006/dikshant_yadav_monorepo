'use client';

import TransitionProvider from './TransitionContext';
import TransitionOverlay from './TransitionOverlay';

export default function TransitionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TransitionProvider>
      <TransitionOverlay />
      {children}
    </TransitionProvider>
  );
}
