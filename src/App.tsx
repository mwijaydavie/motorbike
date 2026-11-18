import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, Instagram, X } from 'lucide-react';
import { reel } from './content';
import type { Language } from './content';
import { pageMeta } from './site';
import type { Page } from './site';
import { Footer, Header } from './components/Navigation';
import { Chapter, ExternalLink, Eyebrow } from './components/Primitives';
import type { Locale } from './components/Primitives';
import { useScrollMotion } from './motion/use-scroll-motion';
import { HomePage } from './pages/Home';
import { BikePage, MotorcyclesPage } from './pages/Motorcycles';
import { PartsPage } from './pages/Parts';
import { StoryPage } from './pages/Story';
import { ContactPage } from './pages/Contact';

function FilmDialog({ close, t }: { close: () => void; t: Locale['t'] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return <dialog ref={dialog} className="film-dialog" aria-labelledby="film-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
  }}>
    <button className="icon-button film-close" type="button" aria-label={t('Close film', 'Funga video')} onClick={close} autoFocus><X size={21} aria-hidden="true" /></button>
    {!unavailable && <video controls autoPlay muted playsInline src="/media/the-roads-we-ride.mp4" poster="/media/roads-of-tanzania.webp" preload="metadata" aria-label={t('The Roads We Ride, silent campaign film', 'Barabara Zetu, video ya kampeni isiyo na sauti')} onError={() => setUnavailable(true)} />}
    <div className="film-content">
      <Eyebrow>{t('Altraware / Campaign', 'Altraware / Kampeni')}</Eyebrow>
      <h2 id="film-title" className="display">{t('The roads we ride.', 'Barabara zetu.')}</h2>
      <p>{unavailable ? t('The film couldn’t play here. You can still watch the Xpress reel.', 'Video haikuweza kuchezwa hapa. Unaweza kutazama reel ya Xpress.') : t('A short edit made from our campaign artwork. Watch the Xpress reel for footage of the bike.', 'Video fupi iliyotengenezwa kwa picha za kampeni. Tazama reel ya Xpress kuona pikipiki halisi.')}</p>
      <ExternalLink href={reel}><Instagram aria-hidden="true" size={17} /> {t('Watch the Instagram reel', 'Tazama reel ya Instagram')}</ExternalLink>
    </div>
  </dialog>;
}

const languageKey = 'altraware-language';
export function App({ page }: { page: Page }) {
  const [lang, setLang] = useState<Language>('en');
  const [film, setFilm] = useState(false);
  const trigger = useRef<HTMLElement>(null);
  const main = useRef<HTMLElement>(null);
  const t: Locale['t'] = (en, sw) => lang === 'en' ? en : sw;
  const locale = { lang, t };

  useScrollMotion(main);
  useLayoutEffect(() => {
    // A restored page (Back/Forward cache) should follow the language just
    // chosen on another document, without rereading it on every render.
    const read = () => {
      try { setLang(localStorage.getItem(languageKey) === 'sw' ? 'sw' : 'en'); }
      catch { /* storage can be unavailable in an embedded preview */ }
    };
    read();
    window.addEventListener('pageshow', read);
    return () => window.removeEventListener('pageshow', read);
  }, []);
  useLayoutEffect(() => {
    const meta = pageMeta(page, lang);
    document.documentElement.lang = lang;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  }, [page, lang]);
  function changeLanguage(next: Language) {
    setLang(next);
    try { localStorage.setItem(languageKey, next); } catch { /* keep the current page usable */ }
  }
  function openFilm(element: HTMLElement) { trigger.current = element; setFilm(true); }
  function closeFilm() {
    setFilm(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }

  return <>
    <div id="top" aria-hidden="true" />
    <a href="#main-content" className="skip-link">{t('Skip to content', 'Ruka hadi maudhui')}</a>
    <Header page={page} changeLanguage={changeLanguage} {...locale} />
    <main id="main-content" ref={main} tabIndex={-1} className={`page page-${page.kind}`}>
      {page.kind === 'home' && <HomePage {...locale} openFilm={openFilm} />}
      {page.kind === 'motorcycles' && <MotorcyclesPage {...locale} />}
      {page.kind === 'bike' && <BikePage {...locale} bike={page.bike} />}
      {page.kind === 'parts' && <PartsPage {...locale} />}
      {page.kind === 'story' && <StoryPage {...locale} openFilm={openFilm} />}
      {page.kind === 'contact' && <ContactPage {...locale} />}
      {page.kind === 'not-found' && <>
        <Chapter number="404" label={t('Page not found', 'Ukurasa haupatikani')} title={t('OFF THE MAP.', 'NJE YA RAMANI.')} note={t('We couldn’t find this page. Head back to the lineup to get on the road again.', 'Hatukupata ukurasa huu. Rudi kwenye katalogi uchague pikipiki.')} t={t} />
        <div className="paper-section error-links"><div className="frame"><a className="button button-dark" href="/motorcycles">{t('Explore motorcycles', 'Tazama pikipiki')} <ArrowUpRight aria-hidden="true" size={17} /></a><a className="text-link" href="/">{t('Back to home', 'Rudi nyumbani')} <ArrowUpRight aria-hidden="true" size={15} /></a></div></div>
      </>}
    </main>
    <Footer {...locale} />
    {film && <FilmDialog close={closeFilm} t={t} />}
  </>;
}
