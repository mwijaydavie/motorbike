import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { bikes, categories } from '../content';
import type { Bike, Category } from '../content';
import { inquiryPath, normalizePath, pathWith } from '../site';
import { BikeGrid, BikeVisual } from '../components/Bikes';
import { Breadcrumb, Chapter, ExternalLink, Eyebrow, NextLink } from '../components/Primitives';
import type { Locale } from '../components/Primitives';
import { usePageQuery } from '../components/use-page-query';

const filters: Category[] = ['all', 'street', 'adventure', 'utility', 'other'];
const searchable = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export function MotorcyclesPage({ lang, t }: Locale) {
  const { params, update } = usePageQuery();
  const allFilter = useRef<HTMLButtonElement>(null);
  const use = filters.find(key => key === params.get('use')) ?? 'all';
  const search = params.get('q')?.slice(0, 80) ?? '';
  const query = searchable(search);
  const results = bikes.filter(bike => (use === 'all' || bike.category === use) && (!query || searchable(`${bike.brand ?? 'Pikipiki Altraware'} ${bike.name} ${bike.number}`).includes(query)));
  const filtered = use !== 'all' || search.length > 0;
  function clearFilters() {
    update({ use: undefined, q: undefined }, true);
    allFilter.current?.focus();
  }
  return <>
    <Chapter number="01" label={t('Motorcycles', 'Pikipiki')} title={t('THE LINEUP.', 'AINA ZA PIKIPIKI.')} t={t}
      note={t('For the commute, the longer ride or a day at work. Start with how you ride, then ask us about the model you like.', 'Kwa safari za mjini, safari ndefu au kazi. Chagua kulingana na matumizi, kisha tuulize kuhusu modeli unayoipenda.')} />
    <section className="paper-section catalog-page" aria-labelledby="catalog-heading">
      <div className="frame">
        <div className="catalog-top"><h2 id="catalog-heading" className="micro"><SlidersHorizontal size={16} aria-hidden="true" /> {t('Browse the range', 'Tazama modeli')}</h2><span className="micro live-count" role="status"><i /> {t(`${results.length} of ${bikes.length} models`, `Modeli ${results.length} kati ya ${bikes.length}`)}</span></div>
        <div className="catalog-controls">
          <div className="filters" role="group" aria-label={t('Filter by riding style', 'Chuja kwa aina ya safari')}>
            {filters.map(key => <button key={key} ref={key === 'all' ? allFilter : undefined} className="filter" type="button" aria-pressed={key === use} onClick={() => update({ use: key === 'all' ? undefined : key }, true)}>{categories[key][lang]}</button>)}
          </div>
          <div className="search-box">
            <Search size={17} aria-hidden="true" /><input type="search" aria-label={t('Search models', 'Tafuta modeli')} placeholder={t('Search models', 'Tafuta modeli')} value={search} maxLength={80} onChange={event => update({ q: event.currentTarget.value })} />
          </div>
        </div>
        {filtered && <button className="text-link clear-filters" type="button" onClick={clearFilters}><X size={14} aria-hidden="true" />{t('Clear filters', 'Ondoa vichujio')}</button>}
        {results.length > 0 ? <BikeGrid items={results} lang={lang} t={t} key={use} animate={filtered} /> : <div className="empty-state">
          <Search size={26} aria-hidden="true" /><h3 className="display">{t('NO MATCHES.', 'HAKUNA MATOKEO.')}</h3>
          <p>{t('Try a model name like Xpress, or look in a different riding category.', 'Jaribu jina kama Xpress, au chagua aina nyingine ya safari.')}</p>
          <button className="button button-dark" type="button" onClick={clearFilters}>{t('Show all models', 'Onyesha modeli zote')}</button>
        </div>}
        <p className="catalog-disclaimer">{t('The lineup includes seller listings and a labelled manufacturer preview. Ask us to confirm today’s stock and price.', 'Katalogi ina matangazo ya muuzaji na modeli iliyowekewa alama kutoka kwa mtengenezaji. Tuulize kuthibitisha upatikanaji na bei ya leo.')}</p>
      </div>
    </section>
    <NextLink label={t('Altraware / Parts', 'Altraware / Vipuri')} title={t('LOOKING FOR A PART?', 'UNATAFUTA KIPURI?')} url="/parts" action={t('Explore spare parts', 'Tazama vipuri')} />
  </>;
}

export function BikePage({ bike, lang, t }: Locale & { bike: Bike }) {
  const [catalogueUrl, setCatalogueUrl] = useState('/motorcycles');
  useLayoutEffect(() => {
    // Keep the visible return link useful after opening a filtered listing.
    const previous = new URL(document.referrer, window.location.origin);
    if (previous.origin !== window.location.origin || normalizePath(previous.pathname) !== '/motorcycles') return;
    const use = filters.find(key => key !== 'all' && key === previous.searchParams.get('use'));
    setCatalogueUrl(pathWith('/motorcycles', { use, q: previous.searchParams.get('q')?.slice(0, 80) }));
  }, []);
  const related = [...bikes.filter(item => item.category === bike.category && item.id !== bike.id), ...bikes.filter(item => item.category !== bike.category)].slice(0, 2);
  return <>
    <section className="product-page paper-section" aria-labelledby="product-title">
      <div className="frame">
        <Breadcrumb t={t} end={bike.name} middle={{ url: catalogueUrl, label: t('Motorcycles', 'Pikipiki') }} />
        <a href={catalogueUrl} className="text-link product-back"><ArrowLeft aria-hidden="true" size={16} />{t('Back to motorcycles', 'Rudi kwenye pikipiki')}</a>
        <div className="product-core">
          <div className="product-visual"><BikeVisual bike={bike} lang={lang} t={t} detail />
            <div className="product-visual-foot micro"><span>AM / {bike.number}</span><span>{bike.image ? t('Side view', 'Mwonekano wa pembeni') : t('See original listing', 'Angalia tangazo la awali')}</span></div>
          </div>
          <div className="product-main">
            <Eyebrow>{bike.brand ?? 'Pikipiki Altraware'} / {categories[bike.category][lang]}</Eyebrow>
            <h1 id="product-title" className="display product-title">{bike.name}</h1>
            <p>{bike.detail[lang]}</p>
            <dl className="product-facts">
              <div><dt>{t('Engine class', 'Daraja la injini')}</dt><dd>{bike.cc[lang]}</dd></div>
              <div><dt>{bike.price ? t('Price in original post', 'Bei kwenye chapisho') : t('Price & stock', 'Bei na upatikanaji')}</dt><dd>{bike.price ?? t('On request', 'Uliza')}</dd></div>
              {bike.registration && <div><dt>{t('Registration', 'Usajili')}</dt><dd>{t('Mentioned in the listing', 'Umetajwa kwenye tangazo')}</dd></div>}
            </dl>
            <div className="product-actions"><a className="button button-dark" href={inquiryPath('motorcycle', bike.id)}>{t('Ask about this bike', 'Uliza kuhusu pikipiki hii')} <ArrowUpRight aria-hidden="true" size={17} /></a>
              <ExternalLink href={bike.source}>{bike.imageType === 'maker' ? t('Manufacturer listing', 'Katalogi ya mtengenezaji') : t('Original Instagram post', 'Chapisho la Instagram')}</ExternalLink></div>
            {bike.imageType === 'reference' && <p className="reference-note">{t('Reference photo: a different Fenghao model. See the original post for this listing.', 'Picha ni ya modeli nyingine ya Fenghao. Tazama chapisho la awali la modeli hii.')} {bike.referenceSource && <ExternalLink href={bike.referenceSource}>{t('Photo source', 'Chanzo cha picha')}</ExternalLink>}</p>}
            {bike.imageType === 'maker' && <p className="reference-note">{t('Manufacturer preview. This is not a stock listing.', 'Mfano kutoka kwa mtengenezaji; hauonyeshi kuwa bidhaa ipo dukani.')}</p>}
          </div>
        </div>
        <div className="fitment-cross" data-reveal><div><Eyebrow>{t('Already ride this model?', 'Unaendesha modeli hii tayari?')}</Eyebrow><p>{t('Take the model name with you into the parts finder.', 'Nenda kwenye sehemu ya vipuri ukiwa na jina la modeli hii.')}</p></div><a className="button button-outline-dark" href={`${pathWith('/parts', { bike: bike.id })}#parts-finder`}>{t('Ask for compatible parts', 'Uliza vipuri vinavyofaa')} <ArrowUpRight size={18} aria-hidden="true" /></a></div>
      </div>
    </section>
    <section className="related-section paper-section" aria-labelledby="related-heading">
      <div className="frame"><div className="section-lead" data-reveal><div><Eyebrow>{t('Keep exploring', 'Endelea kutazama')}</Eyebrow><h2 id="related-heading" className="display section-title">{t('MORE TO RIDE.', 'PIKIPIKI NYINGINE.')}</h2></div><a className="text-link" href="/motorcycles">{t('View all motorcycles', 'Tazama pikipiki zote')} <ArrowUpRight size={16} aria-hidden="true" /></a></div>
        <BikeGrid items={related} lang={lang} t={t} />
      </div>
    </section>
  </>;
}
