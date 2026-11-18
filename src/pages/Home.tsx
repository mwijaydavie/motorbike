import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, Package, Play, Route } from 'lucide-react';
import { bikes, categories, text } from '../content';
import { cataloguePath } from '../site';
import { BikeGrid } from '../components/Bikes';
import { Eyebrow, Mark } from '../components/Primitives';
import type { Locale } from '../components/Primitives';
import { useSceneShift } from '../motion/use-scene-shift';

export type FilmTrigger = (element: HTMLElement) => void;
const scenes = [
  { desktop: '/media/open-road.webp', mobile: '/media/open-road-mobile.webp', width: 1376, height: 768, label: text('Campaign / Open road', 'Kampeni / Barabara'), alt: text('Campaign artwork of a red dual-sport motorcycle in amber sunlight', 'Picha ya kampeni ya pikipiki nyekundu kwenye mwanga wa jua') },
  { desktop: '/media/roads-of-tanzania.webp', mobile: '/media/roads-mobile.webp', width: 1264, height: 848, label: text('Field notes / Tanzania', 'Safari zetu / Tanzania'), alt: text('Campaign artwork of a motorcyclist riding into green hills', 'Picha ya kampeni ya mwendesha pikipiki akielekea kwenye milima ya kijani') },
];
const rides = [
  { use: 'street', icon: Route, note: text('Daily rides', 'Safari za kila siku') },
  { use: 'adventure', icon: Compass, note: text('Beyond the city', 'Nje ya jiji') },
  { use: 'utility', icon: Package, note: text('Work & deliveries', 'Kazi na mizigo') },
] as const;

function Hero({ lang, t, openFilm }: Locale & { openFilm: FilmTrigger }) {
  const shift = useSceneShift(scenes.length);
  const active = shift.scene.index;
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-stage">
      <div className="hero-scene" data-mode={shift.scene.mode}>
        {scenes.map((image, i) => (i === 0 || i === active || shift.primed) && <picture className={`hero-picture hero-scene-${i}`} key={image.desktop} data-active={active === i} aria-hidden={active !== i}>
          <source media="(max-width: 700px)" srcSet={image.mobile} />
          <img ref={el => { shift.images.current[i] = el; }} src={image.desktop} alt={image.alt[lang]} width={image.width} height={image.height} fetchPriority={i === 0 ? 'high' : 'auto'} />
        </picture>)}
        <canvas className="hero-shift" ref={shift.canvas} width={1} height={1} aria-hidden="true" />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-sweep" aria-hidden="true" />
      <div className="hero-inner frame">
        <div className="hero-register micro" aria-hidden="true"><i /> ALTRAWARE / DSM <i /></div>
        <div className="hero-copy">
          <Eyebrow className="hero-eyebrow">{t('Kigamboni, Dar es Salaam', 'Kigamboni, Dar es Salaam')}</Eyebrow>
          <h1 className="display hero-title" id="hero-title">
            <span className="title-mask"><span>{t('THE ROAD', 'BARABARA')}</span></span>{' '}
            <span className="title-mask"><span className="accent">{t('IS YOURS.', 'NI YAKO.')}</span></span>
          </h1>
          <p className="hero-lead">{t('Fenghao motorcycles and spare parts. For the daily ride, the day’s work, and the road out of town.', 'Pikipiki za Fenghao na vipuri. Kwa safari za kila siku, kazi zako, na njia za nje ya mji.')}</p>
          <div className="hero-buttons">
            <a className="button button-lime" href="/motorcycles">{t('Explore motorcycles', 'Tazama pikipiki')} <ArrowUpRight size={19} aria-hidden="true" /></a>
            <button className="play-link" type="button" aria-haspopup="dialog" onClick={event => openFilm(event.currentTarget)}><span className="play-badge"><Play size={13} fill="currentColor" aria-hidden="true" /></span>{t('Play the film', 'Cheza video')}</button>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="hero-id micro" aria-hidden="true"><i /><span>DSM / TZ</span><span className="hero-id-rule" /></div>
          <div className="hero-controls" role="group" aria-label={t('Campaign images', 'Picha za kampeni')} data-shifting={shift.busy}>
            <div className="scene-caption" aria-live="polite">
              <span className="scene-count">0{active + 1}<i />0{scenes.length}</span>
              <span className="scene-label">{shift.unavailable ? t('Image unavailable', 'Picha haipatikani') : scenes[active].label[lang]}</span>
            </div>
            <button className="icon-button" type="button" aria-label={t('Previous image', 'Picha iliyotangulia')} aria-disabled={shift.busy || undefined} onPointerEnter={shift.warm} onFocus={shift.warm} onClick={() => shift.change(-1)}><ArrowLeft size={17} aria-hidden="true" /></button>
            <button className="icon-button" type="button" aria-label={t('Next image', 'Picha inayofuata')} aria-disabled={shift.busy || undefined} onPointerEnter={shift.warm} onFocus={shift.warm} onClick={() => shift.change(1)}><ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </div>
  </section>;
}

export function HomePage({ lang, t, openFilm }: Locale & { openFilm: FilmTrigger }) {
  return <>
    <Hero lang={lang} t={t} openFilm={openFilm} />
    <section className="ride-strip" aria-labelledby="ride-strip-title">
      <div className="frame ride-inner">
        <h2 id="ride-strip-title" className="micro"><Mark /> {t('Find your ride', 'Chagua safari yako')}</h2>
        {rides.map(({ use, icon: Icon, note }) => <a key={use} href={cataloguePath(use)}>
          <Icon strokeWidth={1.55} size={24} aria-hidden="true" /><span><strong>{categories[use][lang]}</strong><small>{note[lang]}</small></span><ArrowUpRight size={17} aria-hidden="true" />
        </a>)}
      </div>
    </section>
    <section className="home-lineup paper-section" aria-labelledby="home-lineup-title">
      <div className="frame">
        <div className="section-lead" data-reveal>
          <div><Eyebrow index="01">{t('Selected motorcycles', 'Pikipiki teule')}</Eyebrow><h2 className="display section-title" id="home-lineup-title">{t('MEET THE LINEUP.', 'CHAGUA PIKIPIKI.')}</h2></div>
          <a className="button button-outline-dark" href="/motorcycles">{t('See all motorcycles', 'Tazama pikipiki zote')} <ArrowUpRight aria-hidden="true" size={17} /></a>
        </div>
        <BikeGrid items={bikes.slice(0, 3)} lang={lang} t={t} />
      </div>
    </section>
    <section className="home-links paper-section" aria-labelledby="home-more-title">
      <div className="frame">
        <h2 className="sr-only" id="home-more-title">{t('Spare parts and our story', 'Vipuri na kuhusu sisi')}</h2>
        <div className="feature-grid">
          <a className="feature-panel" href="/parts" data-reveal>
            <img src="/media/workshop.webp" alt="" width="1200" height="669" loading="lazy" decoding="async" />
            <div className="feature-info"><Eyebrow index="02">{t('Spare parts', 'Vipuri')}</Eyebrow><h3 className="display">{t('KEEP IT RUNNING.', 'ENDELEA NA SAFARI.')}</h3><span className="feature-cta">{t('Find a part', 'Tafuta kipuri')} <ArrowUpRight aria-hidden="true" size={18} /></span></div>
          </a>
          <a className="feature-panel" href="/story" data-reveal>
            <img src="/media/roads-of-tanzania.webp" alt="" width="1264" height="848" loading="lazy" decoding="async" />
            <div className="feature-info"><Eyebrow index="03">{t('Our story', 'Kuhusu sisi')}</Eyebrow><h3 className="display">{t('ROOTED IN DAR.', 'TUNATOKA DAR.')}</h3><span className="feature-cta">{t('Meet Altraware', 'Ifahamu Altraware')} <ArrowUpRight aria-hidden="true" size={18} /></span></div>
          </a>
        </div>
      </div>
    </section>
  </>;
}
