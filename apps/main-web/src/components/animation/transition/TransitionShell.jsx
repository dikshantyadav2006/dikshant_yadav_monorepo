import TransitionProvider from './TransitionContext';
import TransitionOverlay from './TransitionOverlay';

export default function TransitionShell({ children }) {
  return (
    <TransitionProvider>
      <TransitionOverlay />
      {children}
    </TransitionProvider>
  );
}
