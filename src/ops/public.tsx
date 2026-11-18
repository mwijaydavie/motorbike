import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { publicCatalogue } from './core.js';
import type { PublicCatalogue } from './core.js';

const empty: PublicCatalogue = { models: {} };
const Context = createContext(empty);
export const usePublicModels = () => useContext(Context).models;

export function PublicStockProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const [catalogue, setCatalogue] = useState(empty);
  useEffect(() => {
    if (!enabled) return;
    let controller: AbortController | undefined;
    let cleanupDemo: (() => void) | undefined;
    let active = true;
    if (import.meta.env.MODE === 'ops-demo') {
      void import('./demo').then(({ loadDemo, DEMO_STORAGE_KEY }) => {
        if (!active) return;
        const read = () => setCatalogue(publicCatalogue(loadDemo()));
        function onStorage(event: StorageEvent) { if (event.key === DEMO_STORAGE_KEY || event.key === null) read(); }
        window.addEventListener('storage', onStorage);
        window.addEventListener('pageshow', read);
        cleanupDemo = () => {
          window.removeEventListener('storage', onStorage);
          window.removeEventListener('pageshow', read);
        };
        read();
      }).catch(() => { if (active) setCatalogue(empty); });
    }
    function read() {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      void fetch('/api/catalogue', { signal, credentials: 'omit', cache: 'no-store' }).then(response => {
        if (!response.ok) throw new Error('Unavailable');
        return response.json();
      }).then(result => { if (!signal.aborted) setCatalogue(publicCatalogue(result)); })
        .catch(() => { if (!signal.aborted) setCatalogue(empty); });
    }
    function onRestore(event: PageTransitionEvent) { if (event.persisted) read(); }
    if (import.meta.env.MODE !== 'ops-demo') {
      read();
      window.addEventListener('pageshow', onRestore);
    }
    return () => {
      active = false;
      cleanupDemo?.();
      controller?.abort();
      window.removeEventListener('pageshow', onRestore);
    };
  }, [enabled]);
  return <Context.Provider value={catalogue}>{children}</Context.Provider>;
}
