import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'grapesjs/dist/css/grapes.min.css';
import './app/styles/index.css';
import { App } from './App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found in document.');
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
