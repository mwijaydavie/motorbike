import { useLayoutEffect, useState } from 'react';

// Start with the same query-independent markup on the server and browser,
// then pick up shareable filter / inquiry values before the hydrated paint.
export function usePageQuery() {
  const [search, setSearch] = useState('');
  useLayoutEffect(() => {
    const read = () => setSearch(window.location.search);
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);

  function update(values: Record<string, string | undefined>, push = false) {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (url.href === window.location.href) return;
    if (push) history.pushState(history.state, '', url);
    else history.replaceState(history.state, '', url);
    setSearch(url.search);
  }

  return { params: new URLSearchParams(search), update };
}
