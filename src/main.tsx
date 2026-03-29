import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('CRITICAL RENDER ERROR:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-center; background: #fef2f2; padding: 2rem; font-family: sans-serif;">
        <div style="max-width: 400px; width: 100%; background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); text-align: center;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Render-Fehler</h1>
          <p style="color: #4b5563; margin-bottom: 1.5rem;">Die App konnte nicht gestartet werden.</p>
          <pre style="text-align: left; background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; font-size: 0.75rem; overflow: auto; max-height: 200px;">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </div>
    `;
  }
}
