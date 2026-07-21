import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

// Remove loading screen after React has committed
requestAnimationFrame(() => requestAnimationFrame(() => window.removeLoader()))

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Check for updates every hour
      setInterval(() => reg.update(), 60 * 60 * 1000);

      // Notify user when new version is waiting
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — optionally show a toast
            console.log('[SW] New version available. Refresh to update.');
          }
        });
      });
    });
  });

  // Reload page when SW takes over (new version activated)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
