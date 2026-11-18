import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderDocument, sitePaths } from '../.vite/prerender/entry-static.js';

const template = await readFile('dist/index.html', 'utf8');
const publicSite = process.env.SITE_URL ?? 'https://motorbike-omega.vercel.app';
const root = '<div id="root"></div>';
const metaBlock = /<!--page-meta:start-->[\s\S]*?<!--page-meta:end-->/;
if (!template.includes(root) || !metaBlock.test(template)) throw new Error('Missing page template markers');

const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
for (const path of sitePaths) {
  const { html, title, description, image, kind } = renderDocument(path);
  const media = kind === 'home' ? [image, '/media/open-road-mobile.webp'] : kind === 'story' ? [image, '/media/roads-mobile.webp'] : null;
  const metadata = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:image" content="${escape(new URL(image, publicSite).href)}">`,
    ...(media ? [
      `<link rel="preload" as="image" href="${media[0]}" media="(width > 700px)">`,
      `<link rel="preload" as="image" href="${media[1]}" media="(width <= 700px)">`,
    ] : []),
    ...(kind === 'not-found' ? ['<meta name="robots" content="noindex">'] : []),
  ].join('\n    ');
  const output = join('dist', path === '/' ? 'index.html' : `${path.slice(1)}.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, template.replace(metaBlock, () => metadata).replace(root, () => `<div id="root" data-document="${escape(path)}">${html}</div>`));
}
console.log(`Pre-rendered ${sitePaths.length - 1} pages and a 404 document.`);
