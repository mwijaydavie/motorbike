import { ArrowUpRight, Instagram } from 'lucide-react';
import { categories } from '../content';
import type { Bike } from '../content';
import { bikePath } from '../site';
import type { Locale } from './Primitives';

export function visualLabel(bike: Bike, t: Locale['t']) {
  if (bike.imageType === 'reference') return t('Reference photo', 'Picha ya mfano');
  if (bike.imageType === 'maker') return t('Maker preview', 'Kutoka kwa mtengenezaji');
  return t('Instagram listing', 'Tangazo la Instagram');
}

export function BikeVisual({ bike, lang, t, detail = false }: Locale & { bike: Bike; detail?: boolean }) {
  const label = visualLabel(bike, t);
  return <div className={`bike-visual bike-visual-${bike.category}`}>
    <span className="bike-mark" aria-hidden="true">{bike.number}</span>
    <div className="bike-image-meta"><span className="bike-category">{categories[bike.category][lang]}</span><span>{label}</span></div>
    {bike.image ? <img src={bike.image} alt={detail ? (bike.imageType === 'reference' ? t('Reference image of a different Fenghao model', 'Picha ya mfano wa modeli nyingine ya Fenghao') : bike.name) : ''}
      loading={detail ? 'eager' : 'lazy'} fetchPriority={detail ? 'high' : 'auto'} decoding="async" /> : <span className="bike-photo-link"><Instagram size={23} strokeWidth={1.4} aria-hidden="true" /> {t('Photos in the original post', 'Picha zipo kwenye chapisho')}</span>}
    <span className="visual-corner" aria-hidden="true" />
  </div>;
}

export function BikeGrid({ items, lang, t, animate = false }: Locale & { items: Bike[]; animate?: boolean }) {
  return <div className={`bike-grid${animate ? ' bike-grid-refresh' : ''}`}>
    {items.map((bike, index) => <article className="bike-card" data-reveal key={bike.id} style={{ '--order': index % 3 } as React.CSSProperties}>
      <BikeVisual bike={bike} lang={lang} t={t} />
      <div className="bike-copy">
        <div>
          <span className="bike-brand">{bike.brand ?? 'Pikipiki Altraware'}</span>
          <h3 className="display bike-name"><a className="bike-link" href={bikePath(bike.id)}>{bike.name}</a></h3>
          <p className="bike-meta">{bike.cc[lang]}<i aria-hidden="true" />{bike.price ? t('See posted price', 'Tazama bei iliyotajwa') : t('Ask for price', 'Uliza bei')}</p>
        </div>
        <span className="bike-arrow"><ArrowUpRight size={22} strokeWidth={1.6} aria-hidden="true" /></span>
      </div>
    </article>)}
  </div>;
}
