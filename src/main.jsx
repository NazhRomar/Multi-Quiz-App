import './style.css';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('app-root')).render(<App />);

// PWA offline support (dist/sw.js is generated at build time — see
// vite.config.js). Production only, so the dev server never serves stale
// cached code.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
