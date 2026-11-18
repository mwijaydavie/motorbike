import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { renderDocument, sitePaths } from '../.vite/prerender/entry-static.js';

const pathFor = path => `dist${path === '/' ? '/index' : path}.html`;
const pages = new Map(await Promise.all(sitePaths.map(async path => [path, await readFile(pathFor(path), 'utf8')])));

test('entry pages and every model have standalone HTML and metadata', () => {
  for (const path of ['/', '/motorcycles', '/parts', '/story', '/contact', '/404']) assert(pages.has(path), path);
  const titles = new Set();
  for (const [path, html] of pages) {
    const expected = renderDocument(path);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert(title && !titles.has(title), `Missing or duplicate title at ${path}`);
    titles.add(title);
    assert(html.includes(`data-document="${path}"`), path);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, path);
    assert.equal(html.includes('name="robots" content="noindex"'), expected.kind === 'not-found', path);
  }
});

test('internal page and section links in the static build resolve', () => {
  const origin = 'https://altraware.test';
  for (const [path, html] of pages) {
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const target = new URL(href.replaceAll('&amp;', '&'), `${origin}${path}`);
      if (target.origin !== origin) continue;
      const destination = pages.get(target.pathname);
      assert(destination, `${path} links to missing ${href}`);
      if (target.hash) assert(destination.includes(`id="${target.hash.slice(1)}"`), `${path} links to missing ${href}`);
    }
  }
});

test('model pages link to an inquiry and the parts picker with the model selected', () => {
  const models = [...pages].filter(([path]) => path.startsWith('/motorcycles/'));
  assert(models.length > 0, 'Expected pre-rendered model pages');
  for (const [path, html] of models) {
    const id = path.split('/').at(-1);
    assert(html.includes(`href="/contact?topic=motorcycle&amp;bike=${id}"`), path);
    assert(html.includes(`href="/parts?bike=${id}#parts-finder"`), path);
  }
});

test('locally referenced scripts and media exist', async () => {
  const urls = new Set([...pages.values()].flatMap(html => [...html.matchAll(/\b(?:src|srcSet|href)="(\/(?:assets|media)\/[^" ]+)"/g)].map(([, url]) => url)));
  assert(urls.size > 0);
  await Promise.all([...urls].map(url => access(`dist${url}`)));
});
