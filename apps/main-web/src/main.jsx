import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(<App />)

// Remove loading screen after React has committed
requestAnimationFrame(() => requestAnimationFrame(() => window.removeLoader()))

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
