import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './ops.css';
import { Operations } from './Operations';

createRoot(document.querySelector('#ops-root')!).render(<StrictMode><Operations /></StrictMode>);
