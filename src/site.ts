import { bikes, text } from './content.ts';
import type { Bike, Category, Language, LocalText } from './content.ts';

export type Section = 'motorcycles' | 'parts' | 'story' | 'contact';
export type Page = { kind: 'home' | Section | 'not-found' } | { kind: 'bike'; bike: Bike };
export const sections = [
  { id: 'motorcycles', number: '01', label: text('Motorcycles', 'Pikipiki') },
  { id: 'parts', number: '02', label: text('Spare parts', 'Vipuri') },
  { id: 'story', number: '03', label: text('Our story', 'Kuhusu sisi') },
  { id: 'contact', number: '04', label: text('Contact', 'Mawasiliano') },
] as const;

export function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

export function resolvePage(pathname: string): Page {
  const path = normalizePath(pathname);
  if (path === '/') return { kind: 'home' };
  const section = sections.find(s => path === `/${s.id}`);
  if (section) return { kind: section.id };
  const bike = bikes.find(item => path === bikePath(item.id));
  return bike ? { kind: 'bike', bike } : { kind: 'not-found' };
}

export const bikePath = (id: Bike['id']) => `/motorcycles/${id}`;
export const sitePaths = ['/', ...sections.map(s => `/${s.id}`), ...bikes.map(bike => bikePath(bike.id)), '/404'];

export function pathWith(path: string, values: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) query.set(key, value);
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

export type Topic = 'motorcycle' | 'parts' | 'wholesale' | 'general';
export const topics: Record<Topic, LocalText> = {
  motorcycle: text('Motorcycle', 'Pikipiki'), parts: text('Spare parts', 'Vipuri'),
  wholesale: text('Wholesale', 'Jumla'), general: text('General question', 'Swali la jumla'),
};
export function inquiryPath(topic: Topic, bike?: string, part?: string) {
  return pathWith('/contact', { topic, bike, part });
}
export function cataloguePath(use: Category = 'all') {
  return pathWith('/motorcycles', { use: use === 'all' ? undefined : use });
}

export function legacyPath(pathname: string, hash: string) {
  if (normalizePath(pathname) !== '/') return null;
  const section = sections.find(s => hash === `#${s.id}`);
  if (section) return `/${section.id}`;
  if (hash === '#garage') return '/parts#garage';
  const bike = bikes.find(item => hash === `#bike-${item.id}`);
  return bike ? bikePath(bike.id) : null;
}

const meta = {
  home: [text('Altraware Motors — Motorcycles & spare parts, Tanzania', 'Altraware Motors — Pikipiki na vipuri, Tanzania'), text('Shop Fenghao motorcycles and ask about spare parts with Pikipiki Altraware in Kigamboni, Dar es Salaam.', 'Tazama pikipiki za Fenghao na uliza kuhusu vipuri kwa Pikipiki Altraware, Kigamboni, Dar es Salaam.'), '/media/open-road.webp'],
  motorcycles: [text('Motorcycle lineup', 'Aina za pikipiki'), text('Browse the Altraware lineup by riding style, then see the original listing or ask about price and availability.', 'Chagua pikipiki kulingana na matumizi, kisha tazama tangazo au tuulize bei na upatikanaji.'), '/media/open-road.webp'],
  parts: [text('Motorcycle spare parts', 'Vipuri vya pikipiki'), text('Find help sourcing motorcycle parts in Kigamboni. Tell Altraware your model and the part you’re looking for.', 'Tafuta vipuri vya pikipiki Kigamboni. Tuambie modeli yako na kipuri unachotafuta.'), '/media/workshop.webp'],
  story: [text('Our story', 'Kuhusu sisi'), text('Meet Pikipiki Altraware, a motorcycle and spare-parts business in Kigamboni, Dar es Salaam.', 'Wafahamu Pikipiki Altraware, wauzaji wa pikipiki na vipuri Kigamboni, Dar es Salaam.'), '/media/roads-of-tanzania.webp'],
  contact: [text('Contact & inquiries', 'Mawasiliano na maswali'), text('Ask Pikipiki Altraware about motorcycles, spare parts and wholesale orders through Instagram.', 'Uliza Pikipiki Altraware kuhusu pikipiki, vipuri na oda za jumla kupitia Instagram.'), '/media/open-road.webp'],
  'not-found': [text('Page not found', 'Ukurasa haupatikani'), text('Find your way back to the Altraware Motors catalogue.', 'Rudi kwenye katalogi ya Altraware Motors.'), '/media/open-road.webp'],
} as const;

export function pageMeta(page: Page, lang: Language) {
  if (page.kind === 'bike') {
    const { bike } = page;
    const model = bike.brand && !bike.name.startsWith(bike.brand) ? `${bike.brand} ${bike.name}` : bike.name;
    return { title: `${model} — Altraware Motors`, description: bike.detail[lang], image: bike.image ?? '/media/open-road.webp' };
  }
  const [title, description, image] = meta[page.kind];
  return { title: title[lang] + (page.kind === 'home' ? '' : ' — Altraware Motors'), description: description[lang], image };
}
