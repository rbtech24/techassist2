import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Only register service worker in production
if (process.env.NODE_ENV === 'production') {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedRefresh() {},
      onOfflineReady() {}
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);