import { renderToString } from 'react-dom/server';
import { App } from './App';
import { pageMeta, resolvePage, sitePaths } from './site';

export { sitePaths };
export function renderDocument(path: string) {
  const page = resolvePage(path);
  return { html: renderToString(<App page={page} />), ...pageMeta(page, 'en'), kind: page.kind };
}
