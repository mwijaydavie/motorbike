import { StrictMode, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, Cog, Copy, Disc3, Globe2, Instagram,
  Link2, MapPin, Menu, MessageCircle, Play, Plus, X, Zap,
} from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import '@fontsource/barlow-condensed/latin-800-italic.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource-variable/inter';
import './styles.css';
import { useSceneShift } from './motion/use-scene-shift';
import {
  bikes, categories, details, directMessage, directions, instagram, maker, maker200, parts, reel, text,
} from './content';
import type { Bike, Category, Language, LocalText } from './content';

type Translate = (en: string, sw: string) => string;
type Section = { id: string; label: LocalText };
type Topic = 'motorcycle' | 'parts' | 'wholesale' | 'general';
type Inquiry = { topic?: Topic; subject?: string; model?: string };
type OpenFilm = (trigger: HTMLElement) => void;
type OpenInquiry = (inquiry: Inquiry, trigger?: HTMLElement) => void;
type Overlay = { kind: 'film' } | { kind: 'bike'; bike: Bike } | { kind: 'inquiry'; inquiry: Inquiry };
const sections: Section[] = [
  { id: 'motorcycles', label: text('Motorcycles', 'Pikipiki') },
  { id: 'parts', label: text('Spare parts', 'Vipuri') },
  { id: 'story', label: text('Our story', 'Kuhusu sisi') },
];

function Mark({ className = '' }: { className?: string }) {
  return <span className={`slash-mark ${className}`} aria-hidden="true"><i /><i /></span>;
}

function Logo() {
  return (
    <span className="logo">
      <img src="/media/altraware-mark.webp" alt="" width="42" height="29" />
      <span className="logotype"><strong>ALTRAWARE</strong>{' '}<small>MOTORS</small></span>
    </span>
  );
}

function Header({ lang, setLanguage, t }: { lang: Language; setLanguage: (lang: Language) => void; t: Translate }) {
  const [menu, setMenu] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenu(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [menu]);

  return (
    <header className="site-header" id="top">
      <div className="header-inner frame">
        <a href="#top" onClick={() => setMenu(false)}><Logo /><span className="sr-only"> {t('home', 'nyumbani')}</span></a>
        <nav className="desktop-nav" aria-label={t('Main navigation', 'Menyu kuu')}>
          {sections.map(s => <a href={`#${s.id}`} key={s.id}>{s.label[lang]}</a>)}
        </nav>
        <div className="header-actions">
          <button className="language-switch" onClick={() => setLanguage(lang === 'en' ? 'sw' : 'en')}>
            <Globe2 size={15} aria-hidden="true" /> <span>{lang === 'en' ? 'EN' : 'SW'}</span> <span className="lang-alternate">/ {lang === 'en' ? 'SW' : 'EN'}</span><span className="sr-only"> – {t('Switch to Kiswahili', 'Change language to English')}</span>
          </button>
          <a className="button header-contact" href="#contact">{t('Get in touch', 'Wasiliana')} <ArrowUpRight aria-hidden="true" size={16} /></a>
          <button type="button" className="icon-button menu-toggle" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? t('Close menu', 'Funga menyu') : t('Open menu', 'Fungua menyu')} onClick={() => setMenu(!menu)} ref={toggleRef}>
            {menu ? <X size={21} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <nav className="mobile-nav" id="mobile-menu" hidden={!menu} aria-label={t('Main navigation', 'Menyu kuu')}>
        {[...sections, { id: 'contact', label: text('Get in touch', 'Wasiliana') }].map((s, i) => (
          <a href={`#${s.id}`} key={s.id} onClick={() => setMenu(false)}><span>0{i + 1}</span> {s.label[lang]} <ArrowUpRight size={20} /></a>
        ))}
      </nav>
    </header>
  );
}

function Eyebrow({ index, children, className = '' }: { index?: string; children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}><Mark />{index && <><span className="eyebrow-index">{index}</span><span className="eyebrow-divider" aria-hidden="true">/</span></>}{children}</p>;
}

const scenes = [
  { desktop: '/media/ride-hero.webp', mobile: '/media/ride-hero-mobile.webp', width: 1376, height: 768, label: text('Fenghao / 200 Series', 'Fenghao / Mfululizo wa 200'), alt: text('Campaign artwork of a red Fenghao dual-sport motorcycle on a dusty road', 'Picha ya kampeni ya pikipiki nyekundu ya Fenghao kwenye barabara ya vumbi') },
  { desktop: '/media/roads-of-tanzania.webp', mobile: '/media/roads-mobile.webp', width: 1264, height: 848, label: text('Field notes / Tanzania', 'Safari zetu / Tanzania'), alt: text('Campaign artwork of a motorcyclist riding into green hills', 'Picha ya kampeni ya mwendesha pikipiki akielekea kwenye milima ya kijani') },
];

function Hero({ lang, t, openFilm }: { lang: Language; t: Translate; openFilm: OpenFilm }) {
  const shift = useSceneShift(scenes.length);
  const sceneIndex = shift.scene.index;
  const scene = scenes[sceneIndex];
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-scene" data-mode={shift.scene.mode}>
        {scenes.map((image, i) => (i === 0 || i === sceneIndex || shift.primed) && (
          <picture className={`hero-picture hero-scene-${i}`} key={image.desktop} data-active={sceneIndex === i} aria-hidden={sceneIndex !== i}>
            <source media="(max-width: 700px)" srcSet={image.mobile} />
            <img ref={el => { shift.images.current[i] = el; }} src={image.desktop} alt={image.alt[lang]} width={image.width} height={image.height}
              fetchPriority={i === 0 ? 'high' : 'auto'} />
          </picture>
        ))}
        <canvas className="hero-shift" ref={shift.canvas} width={1} height={1} aria-hidden="true" />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-inner frame">
        <div className="hero-register" aria-hidden="true"><span /> <span>DSM / TZ</span></div>
        <div className="hero-copy">
          <Eyebrow className="hero-eyebrow">{t('Kigamboni, Dar es Salaam', 'Kigamboni, Dar es Salaam')}</Eyebrow>
          <h1 id="hero-title" className={`display hero-title ${lang === 'sw' ? 'hero-title-sw' : ''}`}>
            <span>{t('BUILT FOR', 'PANDA')}</span>
            <span className="accent">{t('THE RIDE.', 'PIKIPIKI.')}</span>
          </h1>
          <p className="hero-lead">{t('Fenghao motorcycles and spare parts. For the streets of Dar and the roads beyond.', 'Pikipiki za Fenghao na vipuri. Kwa mitaa ya Dar na safari za mbali.')}</p>
          <div className="hero-buttons">
            <a className="button button-lime" href="#motorcycles">{t('Explore motorcycles', 'Tazama pikipiki')} <ArrowUpRight size={18} aria-hidden="true" /></a>
            <button className="play-link" type="button" onClick={event => openFilm(event.currentTarget)}>
              <span className="play-badge"><Play size={13} fill="currentColor" aria-hidden="true" /></span>{t('Play the film', 'Cheza video')}
            </button>
          </div>
        </div>
        <div className="hero-footer">
          <a href="#motorcycles" className="scroll-cue"><ArrowDown size={14} aria-hidden="true" /> {t('Scroll to explore', 'Shuka kuona zaidi')}</a>
          <div className="hero-controls" role="group" aria-label={t('Campaign images', 'Picha za kampeni')} data-shifting={shift.busy}>
            <div className="scene-caption" aria-live="polite">
              <span className="scene-count">0{sceneIndex + 1}<i />0{scenes.length}</span>
              <span className="scene-label">{shift.unavailable ? t('Image unavailable', 'Picha haipatikani') : scene.label[lang]}</span>
            </div>
            <button className="icon-button" type="button" aria-label={t('Previous image', 'Picha iliyotangulia')} aria-disabled={shift.busy || undefined} onPointerEnter={shift.warm} onFocus={shift.warm} onClick={() => shift.change(-1)}><ArrowLeft size={17} aria-hidden="true" /></button>
            <button className="icon-button" type="button" aria-label={t('Next image', 'Picha inayofuata')} aria-disabled={shift.busy || undefined} onPointerEnter={shift.warm} onFocus={shift.warm} onClick={() => shift.change(1)}><ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecStrip({ t }: { t: Translate }) {
  const items = [t('FENGHAO MOTORCYCLES', 'PIKIPIKI ZA FENGHAO'), t('MOTORCYCLE SPARE PARTS', 'VIPURI VYA PIKIPIKI'), t('WHOLESALE & RETAIL', 'JUMLA NA REJAREJA'), 'KIGAMBONI, DAR ES SALAAM'];
  return <div className="spec-strip"><ul className="frame">{items.map(line => <li key={line}><Mark />{line}</li>)}</ul></div>;
}

function BikeVisual({ bike, lang, t }: { bike: Bike; lang: Language; t: Translate }) {
  return (
    <span className={`bike-visual bike-visual-${bike.category}`}>
      <span className="bike-mark" aria-hidden="true">{bike.number}</span>
      <span className="bike-category">{categories[bike.category][lang]}</span>
      <span className="bike-visual-note">{bike.imageType === 'reference' ? t('Reference photo', 'Picha ya mfano') : bike.imageType === 'maker' ? t('Maker preview', 'Kutoka kwa mtengenezaji') : t('Instagram listing', 'Tangazo la Instagram')}</span>
      {bike.image ? <img src={bike.image} alt="" loading="lazy" decoding="async" /> : <span className="bike-photo-link" aria-hidden="true"><Instagram size={23} strokeWidth={1.3} /> {t('Photos in the original post', 'Picha zipo kwenye chapisho')}</span>}
    </span>
  );
}

function Catalog({ lang, t, openBike }: { lang: Language; t: Translate; openBike: (bike: Bike, trigger: HTMLElement) => void }) {
  const [filter, setFilter] = useState<Category>('all');
  const [expanded, setExpanded] = useState(false);
  const filterOptions: Category[] = ['all', 'street', 'adventure', 'utility'];
  const filtered = bikes.filter(bike => filter === 'all' || bike.category === filter);
  const visible = filter === 'all' && !expanded ? filtered.slice(0, 3) : filtered;
  return (
    <section className="catalog" id="motorcycles" aria-labelledby="catalog-title">
      <div className="frame">
        <div className="section-lead catalog-lead">
          <div>
            <Eyebrow index="01">{t('The motorcycle range', 'Aina za pikipiki')}</Eyebrow>
            <h2 className="display section-title" id="catalog-title" tabIndex={-1}>{t('MEET THE LINEUP.', 'CHAGUA PIKIPIKI.')}</h2>
          </div>
          <p>{t('Your daily commute, a workhorse for the business, or a bike for the long way home. Find the ride that fits.', 'Kwa safari za kila siku, shughuli za biashara au safari ndefu. Chagua pikipiki inayokufaa.')}</p>
        </div>
        <div className="catalog-controls">
          <div className="filters" role="group" aria-label={t('Filter motorcycles', 'Chuja pikipiki')}>
            {filterOptions.map(key => <button type="button" className={`filter${filter === key ? ' active' : ''}`} aria-pressed={filter === key} onClick={() => setFilter(key)} key={key}>{categories[key][lang]}</button>)}
          </div>
          <div className="catalog-count" aria-live="polite"><span />{t(`Showing ${visible.length} of ${filtered.length}`, `Zinaonekana ${visible.length} kati ya ${filtered.length}`)}</div>
        </div>
        <div className="bike-grid" id="bike-grid">
          {visible.map(bike => (
            <article className="bike-card" key={bike.id}>
              <BikeVisual bike={bike} lang={lang} t={t} />
              <div className="bike-copy">
                <div>
                  <span className="bike-brand">{bike.brand ?? 'Pikipiki Altraware'}</span>
                  <h3 className="bike-name">
                    <button className="bike-trigger" type="button" onClick={event => openBike(bike, event.currentTarget)}>{bike.name}<span className="sr-only"> – {t('View details', 'Tazama maelezo')}</span></button>
                  </h3>
                  <span className="bike-meta">{bike.cc[lang]}<i />{bike.price ?? t('Price on request', 'Uliza bei')}</span>
                </div>
                <span className="bike-arrow"><ArrowUpRight size={21} strokeWidth={1.7} aria-hidden="true" /></span>
              </div>
            </article>
          ))}
        </div>
        {filter === 'all' && <div className="catalog-more"><button className="button button-outline-dark" type="button" aria-controls="bike-grid" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? t('Show featured bikes', 'Onyesha pikipiki teule') : t('View all motorcycles', 'Tazama pikipiki zote')} {expanded ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </button></div>}
      </div>
    </section>
  );
}

const partIcons = [Cog, Link2, Disc3, Zap];
function Parts({ lang, t, inquire }: { lang: Language; t: Translate; inquire: OpenInquiry }) {
  return (
    <section className="parts" id="parts" aria-labelledby="parts-title">
      <div className="frame">
        <div className="parts-feature">
          <div className="parts-art">
            <img src="/media/workshop.webp" alt={t('Editorial close-up of a motorcycle engine and drive chain', 'Picha ya karibu ya injini na mnyororo wa pikipiki')} width="1200" height="669" loading="lazy" />
            <div className="parts-art-label"><span>AM /</span> {t('Workshop', 'Warsha')}</div>
          </div>
          <div className="parts-copy">
            <Eyebrow index="02">{t('Spare parts', 'Vipuri')}</Eyebrow>
            <h2 className="display section-title" id="parts-title">{t('KEEP IT', 'ENDELEA')}<br /><span className="accent">{t('RUNNING.', 'NA SAFARI.')}</span></h2>
            <p>{t('Tell us what you ride and which part you need. We’ll help you check the fit and find out what’s available, whether you’re buying one part or ordering in bulk.', 'Tuambie modeli ya pikipiki yako na kipuri unachohitaji. Tutakusaidia kuangalia kama kinafaa na kinapatikana, kwa rejareja au jumla.')}</p>
            <button className="button button-lime" type="button" onClick={event => inquire({ topic: 'parts' }, event.currentTarget)}>{t('Find a spare part', 'Tafuta kipuri')} <ArrowUpRight size={18} /></button>
          </div>
        </div>
        <div className="parts-grid">
          {parts.map((part, i) => {
            const Icon = partIcons[i];
            return (
              <button type="button" className="part-item" onClick={event => inquire({ topic: 'parts', subject: part.label[lang] }, event.currentTarget)} key={part.id}>
                <span className="part-icon"><Icon size={23} strokeWidth={1.5} /><ArrowUpRight size={17} /></span>
                <span className="part-name">{part.label[lang]}</span><span className="part-examples">{part.examples[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Garage({ lang, t }: { lang: Language; t: Translate }) {
  const [pointIndex, setPointIndex] = useState(0);
  const point = details[pointIndex];
  function moveRig(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.x) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.y) / bounds.height - 0.5) * 10;
    event.currentTarget.style.setProperty('--rig-x', `${x}px`);
    event.currentTarget.style.setProperty('--rig-y', `${y}px`);
  }
  function resetRig(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.style.removeProperty('--rig-x');
    event.currentTarget.style.removeProperty('--rig-y');
  }
  return (
    <section className="garage" id="garage" aria-labelledby="garage-title">
      <div className="frame">
        <div className="section-lead garage-lead">
          <div>
            <Eyebrow index="03">{t('Inside the garage', 'Ndani ya warsha')}</Eyebrow>
            <h2 className="display section-title" id="garage-title">{t('A CLOSER LOOK.', 'ANGALIA KWA KARIBU.')}</h2>
          </div>
          <p>{t('Select a marker to inspect the Fenghao FH200-19. The photo comes from the manufacturer’s catalogue.', 'Chagua alama ili kuangalia Fenghao FH200-19 kwa karibu. Picha imetoka kwenye katalogi ya mtengenezaji.')}</p>
        </div>
        <div className="inspection">
          <div className="inspection-stage" onPointerMove={moveRig} onPointerLeave={resetRig}>
            <div className="inspection-coords" aria-hidden="true"><span>FIG / 01</span><span>FH200-19</span></div>
            <div className="inspection-rig">
              <img src="/media/fenghao-200-red.webp" alt={t('Manufacturer side view of a red and black Fenghao FH200-19', 'Picha ya pembeni ya Fenghao FH200-19 nyekundu na nyeusi kutoka kwa mtengenezaji')} width="1100" height="727" loading="lazy" />
              {details.map((d, i) => (
                <button key={d.id} className="hotspot" type="button" style={{ left: `${d.x}%`, top: `${d.y}%` }} onClick={() => setPointIndex(i)} aria-pressed={i === pointIndex} aria-label={t(`Inspect ${d.label.en.toLowerCase()}`, `Angalia ${d.label.sw.toLowerCase()}`)}><Plus size={17} strokeWidth={2} /></button>
              ))}
            </div>
            <div className="inspection-coords bottom" aria-hidden="true"><span><Mark /> FENGHAO / 200</span><span>{t('Side profile', 'Mwonekano wa pembeni')}</span></div>
          </div>
          <div className="inspection-info">
            <div className="inspection-detail" aria-live="polite">
              <span className="inspection-kicker">0{pointIndex + 1} / 0{details.length}</span>
              <h3>{point.label[lang]}</h3>
              <p>{point.detail[lang]}</p>
            </div>
            <div className="inspection-steps" role="group" aria-label={t('Choose a motorcycle detail', 'Chagua sehemu ya pikipiki')}>
              {details.map((d, i) => <button type="button" key={d.id} aria-pressed={i === pointIndex} aria-label={`0${i + 1}: ${d.label[lang]}`} onClick={() => setPointIndex(i)}>0{i + 1}</button>)}
            </div>
            <a className="text-link" href={maker200} target="_blank" rel="noreferrer">{t('Manufacturer listing', 'Katalogi ya mtengenezaji')} <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Story({ t, openFilm }: { t: Translate; openFilm: OpenFilm }) {
  return (
    <section id="story" className="story" aria-labelledby="story-title">
      <picture className="story-image"><source media="(max-width: 700px)" srcSet="/media/roads-mobile.webp" /><img src="/media/roads-of-tanzania.webp" alt="" width="1264" height="848" loading="lazy" /></picture>
      <div className="story-shade" aria-hidden="true" />
      <div className="story-inner frame">
        <div className="story-copy">
          <Eyebrow index="04">{t('Our story', 'Kuhusu sisi')}</Eyebrow>
          <h2 className="display section-title" id="story-title">{t('ROOTED IN DAR.', 'TUNATOKA DAR.')}<br /><span className="accent">{t('READY TO RIDE.', 'TWENDE SAFARI.')}</span></h2>
          <p>{t('We’re Pikipiki Altraware, based in Kigamboni. We sell Fenghao motorcycles and spares, jumla na rejareja, for the people who ride to earn a living and those who ride for the joy of it.', 'Sisi ni Pikipiki Altraware, kutoka Kigamboni. Tunauza pikipiki za Fenghao na vipuri, jumla na rejareja, kwa wanaotumia pikipiki kujipatia riziki na wanaopenda tu kuendesha.')}</p>
          <a className="story-profile" href={instagram} target="_blank" rel="noreferrer"><Instagram size={17} /> @pikipikialtraware <ArrowUpRight size={15} /></a>
        </div>
        <button type="button" className="story-play" onClick={event => openFilm(event.currentTarget)}><span><Play size={27} fill="currentColor" aria-hidden="true" /></span><small>{t('The roads we ride', 'Barabara zetu')}</small></button>
      </div>
    </section>
  );
}

function Contact({ t, inquire }: { t: Translate; inquire: OpenInquiry }) {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="frame contact-inner">
        <div>
          <Eyebrow index="05">{t('Kigamboni / Dar es Salaam', 'Kigamboni / Dar es Salaam')}</Eyebrow>
          <h2 className="display section-title" id="contact-title">{t('LET’S TALK PIKIPIKI.', 'TUONGEE PIKIPIKI.')}</h2>
        </div>
        <div className="contact-actions">
          <p>{t('Shopping for a bike or looking for a hard-to-find part? Tell us what you need.', 'Unatafuta pikipiki au kipuri kigumu kupatikana? Tuambie unachohitaji.')}</p>
          <button type="button" className="button button-dark" onClick={event => inquire({}, event.currentTarget)}>{t('Start an inquiry', 'Anza kuuliza')} <ArrowUpRight size={18} /></button>
          <a className="text-link" href={directions} target="_blank" rel="noreferrer"><MapPin size={15} /> {t('Kigamboni on the map', 'Kigamboni kwenye ramani')} <ArrowUpRight size={13} /></a>
        </div>
      </div>
    </section>
  );
}

function Footer({ lang, t }: { lang: Language; t: Translate }) {
  return (
    <footer className="site-footer">
      <div className="frame">
        <div className="footer-main">
          <div><a href="#top" className="footer-logo"><Logo /><span className="sr-only"> {t('home', 'nyumbani')}</span></a><p>{t('Motorcycles & spare parts.\nKigamboni, Dar es Salaam, Tanzania.', 'Pikipiki na vipuri.\nKigamboni, Dar es Salaam, Tanzania.')}</p></div>
          <nav aria-label={t('Footer navigation', 'Menyu ya chini')}>
            {sections.map(s => <a href={`#${s.id}`} key={s.id}>{s.label[lang]}</a>)}
            <a href="#garage">{t('Bike detail viewer', 'Chunguza pikipiki')}</a>
          </nav>
          <div className="footer-social"><a href={instagram} target="_blank" rel="noreferrer"><Instagram size={18} /> @pikipikialtraware <ArrowUpRight size={15} /></a><a href={maker} target="_blank" rel="noreferrer">{t('About Fenghao', 'Kuhusu Fenghao')} <ArrowUpRight size={14} /></a></div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Altraware Motors</span>
          <a href="https://altra.tanzaniareach.com/" target="_blank" rel="noreferrer"><img src="/media/altraware-original.webp" alt="" width="14" height="10" /> Altraware Technology <ArrowUpRight size={12} /></a>
          <a href="#top" className="back-top">{t('Back to top', 'Rudi juu')} <ArrowUp size={14} /></a>
        </div>
      </div>
    </footer>
  );
}

function Dialog({ children, className, close, t }: { children: ReactNode; className: string; close: () => void; t: Translate }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog ref={ref} className={`dialog ${className}`} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>
      <button className="icon-button dialog-close" type="button" aria-label={t('Close dialog', 'Funga dirisha')} onClick={close} autoFocus><X size={22} /></button>
      {children}
    </dialog>
  );
}

function BikeDetails({ bike, lang, t, inquire }: { bike: Bike; lang: Language; t: Translate; inquire: OpenInquiry }) {
  return (
    <>
      <BikeVisual bike={bike} lang={lang} t={t} />
      <div className="dialog-content">
        <Eyebrow>{bike.brand ?? 'Pikipiki Altraware'} / {categories[bike.category][lang]}</Eyebrow>
        <h2 className="display dialog-title" id="dialog-title">{bike.name}</h2>
        <p>{bike.detail[lang]}</p>
        <dl className="bike-facts">
          <div><dt>{t('Engine class', 'Daraja la injini')}</dt><dd>{bike.cc[lang]}</dd></div>
          <div><dt>{bike.price ? t('Price in original post', 'Bei kwenye chapisho') : t('Price & stock', 'Bei na upatikanaji')}</dt><dd>{bike.price ?? t('On request', 'Uliza')}</dd></div>
          {bike.registration && <div><dt>{t('Registration', 'Usajili')}</dt><dd>{t('Mentioned in listing', 'Umetajwa kwenye tangazo')}</dd></div>}
        </dl>
        {bike.imageType === 'reference' && <p className="reference-note">{t('Reference photo: a different Fenghao model. Use the original post to see this listing.', 'Picha ni ya modeli nyingine ya Fenghao. Tazama chapisho la awali ili kuiona modeli hii.')} <a href={bike.referenceSource} target="_blank" rel="noreferrer">{t('Photo source', 'Chanzo cha picha')} <ArrowUpRight size={13} /></a></p>}
        <div className="dialog-actions">
          <button className="button button-dark" type="button" onClick={() => inquire({ topic: 'motorcycle', model: bike.name })}>{t('Ask about this bike', 'Uliza kuhusu pikipiki hii')} <ArrowUpRight size={17} /></button>
          <a className="text-link" href={bike.source} target="_blank" rel="noreferrer">{bike.imageType === 'maker' ? t('Manufacturer listing', 'Katalogi ya mtengenezaji') : t('Original Instagram post', 'Chapisho la Instagram')} <ArrowUpRight size={14} /></a>
        </div>
      </div>
    </>
  );
}

const topics: Record<Topic, LocalText> = {
  motorcycle: text('Motorcycle', 'Pikipiki'), parts: text('Spare parts', 'Vipuri'), wholesale: text('Wholesale', 'Jumla'), general: text('General question', 'Swali la jumla'),
};

function InquiryForm({ inquiry, lang, t }: { inquiry: Inquiry; lang: Language; t: Translate }) {
  const [topic, setTopic] = useState<Topic>(inquiry.topic ?? 'general');
  const [model, setModel] = useState(inquiry.model ?? '');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const preview = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (ready) preview.current?.focus(); }, [ready]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    const label = topic === inquiry.topic && inquiry.subject ? inquiry.subject : topics[topic][lang];
    setCopyStatus('');
    setReady([t('Hi Pikipiki Altraware!', 'Habari Pikipiki Altraware!'), `${t('Interested in', 'Ninahitaji')}: ${label}`, model.trim() ? `${t('Model', 'Modeli')}: ${model.trim()}` : '', body].filter(Boolean).join('\n'));
  }
  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(ready);
      setCopyStatus(t('Message copied.', 'Ujumbe umenakiliwa.'));
    } catch {
      preview.current?.select();
      setCopyStatus(t('Copy the selected text.', 'Nakili ujumbe uliochaguliwa.'));
    }
  }
  return (
    <div className="dialog-content">
      <Eyebrow>{t('Pikipiki Altraware / Inquiries', 'Pikipiki Altraware / Maswali')}</Eyebrow>
      <h2 className="display dialog-title" id="dialog-title">{inquiry.subject || t('Let’s talk.', 'Tuongee.')}</h2>
      {ready ? (
        <div className="inquiry-form">
          <p>{t('Copy this message, open Instagram and paste it into your chat with us. Nothing has been sent yet.', 'Nakili ujumbe huu, fungua Instagram na ubandike kwenye mazungumzo nasi. Ujumbe bado haujatumwa.')}</p>
          <label>{t('Your prepared message', 'Ujumbe ulioandaliwa')}<textarea ref={preview} value={ready} readOnly rows={5} /></label>
          <div className="dialog-actions">
            <button type="button" className="button button-outline-dark" onClick={copyMessage}>{t('Copy message', 'Nakili ujumbe')} {copyStatus === t('Message copied.', 'Ujumbe umenakiliwa.') ? <Check size={16} /> : <Copy size={16} />}</button>
            <a className="button button-dark" href={directMessage} target="_blank" rel="noreferrer">{t('Open Instagram DM', 'Fungua Instagram DM')} <ArrowUpRight size={16} /></a>
          </div>
          <div className="message-footer"><button className="text-link" type="button" onClick={() => setReady('')}>{t('Edit message', 'Hariri ujumbe')}</button><span role="status">{copyStatus}</span></div>
        </div>
      ) : (
        <form className="inquiry-form" onSubmit={submit}>
          <p>{t('Tell us what you need. We’ll prepare a message for you to send through Instagram.', 'Tuambie unachohitaji. Tutakuandalia ujumbe wa kutuma kupitia Instagram.')}</p>
          <label>{t('I’m asking about', 'Ninauliza kuhusu')}<select value={topic} onChange={e => setTopic(e.target.value as Topic)}>{(Object.keys(topics) as Topic[]).map(key => <option key={key} value={key}>{topics[key][lang]}</option>)}</select></label>
          <label>{t('Motorcycle model (optional)', 'Modeli ya pikipiki (si lazima)')}<input value={model} onChange={e => setModel(e.target.value)} maxLength={80} placeholder={t('e.g. Fenghao FH 125 Xpress', 'mf. Fenghao FH 125 Xpress')} /></label>
          <label>{t('What do you need?', 'Unahitaji nini?')}<textarea required maxLength={600} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder={t('Tell us the part, bike, or quantity you’re looking for…', 'Tueleze kipuri, pikipiki au idadi unayotafuta…')} /></label>
          <div className="dialog-actions">
            <button type="submit" className="button button-dark" disabled={!message.trim()}>{t('Prepare message', 'Andaa ujumbe')} <ArrowRight size={17} /></button>
            <a className="text-link" href={directMessage} target="_blank" rel="noreferrer"><MessageCircle size={16} /> {t('DM us directly', 'Tutumie DM moja kwa moja')}</a>
          </div>
        </form>
      )}
    </div>
  );
}

function Film({ t }: { t: Translate }) {
  const [unavailable, setUnavailable] = useState(false);
  return (
    <>
      {!unavailable && <video src="/media/the-roads-we-ride.mp4" poster="/media/roads-of-tanzania.webp" controls autoPlay muted playsInline preload="metadata" aria-label={t('The Roads We Ride, a silent campaign film', 'Barabara Zetu, video ya kampeni isiyo na sauti')} onError={() => setUnavailable(true)} />}
      <div className="dialog-content">
        <Eyebrow>{t('Altraware Motors / 11 sec', 'Altraware Motors / sekunde 11')}</Eyebrow>
        <h2 className="display dialog-title" id="dialog-title">{t('The roads we ride.', 'Barabara zetu.')}</h2>
        <p>{unavailable ? t('This browser couldn’t play the film. You can still watch the Xpress reel on Instagram.', 'Kivinjari hiki hakijaweza kucheza video. Unaweza kutazama reel ya Xpress kwenye Instagram.') : t('A short motion edit made from our campaign artwork. For footage of the bikes, watch our Xpress reel.', 'Video fupi iliyotengenezwa kwa picha za kampeni. Kwa video ya pikipiki halisi, tazama reel yetu ya Xpress.')}</p>
        <a className="text-link" href={reel} target="_blank" rel="noreferrer"><Instagram size={16} /> {t('Watch the Instagram reel', 'Tazama reel ya Instagram')} <ArrowUpRight size={15} /></a>
      </div>
    </>
  );
}

function bikeFromHash() {
  const hash = window.location.hash;
  return bikes.find(bike => hash === `#bike-${bike.id}`);
}

function App() {
  const [lang, setLang] = useState<Language>(() => {
    try { return localStorage.getItem('altraware-language') === 'sw' ? 'sw' : 'en'; }
    catch { return 'en'; }
  });
  const [overlay, setOverlay] = useState<Overlay | null>(() => {
    const bike = bikeFromHash();
    return bike ? { kind: 'bike', bike } : null;
  });
  const origin = useRef('#motorcycles');
  const overlayTrigger = useRef<HTMLElement | null>(null);
  const t: Translate = (en, sw) => lang === 'en' ? en : sw;

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('altraware-language', lang); } catch { /* storage can be unavailable in a preview iframe */ }
  }, [lang]);
  useEffect(() => {
    function syncHash() {
      const bike = bikeFromHash();
      setOverlay(current => bike ? { kind: 'bike', bike } : current?.kind === 'bike' ? null : current);
    }
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  function openBike(bike: Bike, trigger: HTMLElement) {
    overlayTrigger.current = trigger;
    origin.current = window.location.hash || '#motorcycles';
    window.history.replaceState(null, '', `#bike-${bike.id}`);
    setOverlay({ kind: 'bike', bike });
  }
  function resetBikeHash() {
    if (bikeFromHash()) window.history.replaceState(null, '', origin.current);
  }
  const inquire: OpenInquiry = (inquiry, trigger) => {
    if (trigger) overlayTrigger.current = trigger;
    resetBikeHash();
    setOverlay({ kind: 'inquiry', inquiry });
  };
  function closeOverlay() {
    resetBikeHash();
    const trigger = overlayTrigger.current;
    overlayTrigger.current = null;
    setOverlay(null);
    requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      else if (window.location.hash === '#motorcycles') document.getElementById('catalog-title')?.focus();
    });
  }
  const openFilm: OpenFilm = trigger => {
    overlayTrigger.current = trigger;
    setOverlay({ kind: 'film' });
  };

  return (
    <>
      <a href="#main-content" className="skip-link">{t('Skip to content', 'Ruka hadi maudhui')}</a>
      <Header lang={lang} setLanguage={setLang} t={t} />
      <main id="main-content" tabIndex={-1}>
        <Hero lang={lang} t={t} openFilm={openFilm} />
        <SpecStrip t={t} />
        <Catalog lang={lang} t={t} openBike={openBike} />
        <Parts lang={lang} t={t} inquire={inquire} />
        <Garage lang={lang} t={t} />
        <Story t={t} openFilm={openFilm} />
        <Contact t={t} inquire={inquire} />
      </main>
      <Footer lang={lang} t={t} />
      {overlay && (
        <Dialog className={`dialog-${overlay.kind}`} close={closeOverlay} t={t} key={overlay.kind}>
          {overlay.kind === 'bike' && <BikeDetails bike={overlay.bike} lang={lang} t={t} inquire={inquire} />}
          {overlay.kind === 'film' && <Film t={t} />}
          {overlay.kind === 'inquiry' && <InquiryForm inquiry={overlay.inquiry} lang={lang} t={t} />}
        </Dialog>
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
