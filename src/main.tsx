import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeDatabase } from './lib/db';
import './index.css';
import { Analytics } from '@vercel/analytics/react';

// Initialize database before rendering
initializeDatabase().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
      <Analytics />
    </React.StrictMode>
  );
});

// Service Worker registration for PWA is handled by vite-plugin-pwa automatically in production
// but for manual registration if needed:
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
*/
