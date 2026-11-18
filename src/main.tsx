import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/anton/latin-400.css';
import '@fontsource/barlow-condensed/latin-800-italic.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource-variable/inter';
import './styles.css';
import './motion/motion.css';
import { App } from './App';
import { legacyPath, normalizePath, resolvePage } from './site';

function redirectLegacyHash() {
  const { pathname, hash, search, origin } = window.location;
  const redirect = legacyPath(pathname, hash);
  if (!redirect) return false;
  const target = new URL(redirect, origin);
  target.search = search;
  window.location.replace(target.href);
  return true;
}

if (!redirectLegacyHash()) {
  window.addEventListener('hashchange', redirectLegacyHash);
  const path = normalizePath(window.location.pathname);
  const root = document.getElementById('root')!;
  const page = resolvePage(path);
  const app = <StrictMode><App page={page} /></StrictMode>;
  const expected = page.kind === 'not-found' ? '/404' : path;
  if (root.dataset.document === expected && root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
