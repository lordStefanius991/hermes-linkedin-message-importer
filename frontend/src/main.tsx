import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './base.css';
import './index.css';
import './layout.css';
import './messages.css';

// ===== DEBUG LOG =====
console.log('[Hermes][RENDERER] main.tsx start');

window.addEventListener('error', (event) => {
  console.error('[Hermes][RENDERER] window error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Hermes][RENDERER] unhandled rejection:', event.reason);
});

// ===== RENDER ROOT =====
const container = document.getElementById('root');

if (!container) {
  console.error('[Hermes][RENDERER] ERRORE GRAVE: elemento #root non trovato nel DOM');
} else {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
