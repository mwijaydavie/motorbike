import { ArrowUp, ArrowUpRight, Globe2, Instagram, Menu, X } from 'lucide-react';
import { instagram, maker } from '../content';
import type { Language } from '../content';
import { sections } from '../site';
import type { Page, Section } from '../site';
import { ExternalLink, Logo, Mark } from './Primitives';
import type { Locale } from './Primitives';

export function Header({ page, lang, t, changeLanguage }: Locale & { page: Page; changeLanguage: (lang: Language) => void }) {
  const current = page.kind === 'bike' ? 'motorcycles' : page.kind;
  function active(id: Section) { return id === current ? (page.kind === 'bike' ? 'location' : 'page') : undefined; }

  return <header className="site-header">
    <div className="header-inner frame">
      <a className="brand-link" href="/" aria-current={current === 'home' ? 'page' : undefined}><Logo /><span className="sr-only"> {t('home', 'nyumbani')}</span></a>
      <nav className="desktop-nav" aria-label={t('Main navigation', 'Menyu kuu')}>
        {sections.slice(0, 3).map(item => <a href={`/${item.id}`} key={item.id} aria-current={active(item.id)}><span aria-hidden="true">{item.number}.</span>{item.label[lang]}</a>)}
      </nav>
      <div className="header-actions">
        <button className="language-switch" type="button" onClick={() => changeLanguage(lang === 'en' ? 'sw' : 'en')}>
          <Globe2 size={15} aria-hidden="true" /><strong>{lang.toUpperCase()}</strong><span aria-hidden="true"> / {lang === 'en' ? 'SW' : 'EN'}</span><span className="sr-only"> — {t('Switch to Kiswahili', 'Change language to English')}</span>
        </button>
        <a className="button header-contact" href="/contact" aria-current={active('contact')}>{t('Get in touch', 'Wasiliana')} <ArrowUpRight aria-hidden="true" size={16} /></a>
        <details className="mobile-menu" onKeyDown={event => {
          if (event.key !== 'Escape' || !event.currentTarget.open) return;
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary')?.focus();
        }}>
          <summary className="icon-button" aria-label={t('Navigation menu', 'Menyu ya tovuti')}><Menu className="menu-show" size={21} aria-hidden="true" /><X className="menu-hide" size={21} aria-hidden="true" /></summary>
          <nav className="mobile-nav" aria-label={t('Main navigation', 'Menyu kuu')}>
            {sections.map(item => <a key={item.id} href={`/${item.id}`} aria-current={active(item.id)} onClick={event => {
              const menu = event.currentTarget.closest('details');
              if (menu && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) menu.open = false;
            }}><span aria-hidden="true">{item.number}.</span>{item.label[lang]}<ArrowUpRight size={19} aria-hidden="true" /></a>)}
          </nav>
        </details>
      </div>
    </div>
  </header>;
}

export function Footer({ lang, t }: Locale) {
  return <footer className="site-footer">
    <div className="frame">
      <div className="footer-main">
        <div className="footer-brand"><a href="/"><Logo /><span className="sr-only"> {t('home', 'nyumbani')}</span></a><p>{t('Motorcycles and spares for the roads of Tanzania.', 'Pikipiki na vipuri kwa barabara za Tanzania.')}</p></div>
        <nav aria-label={t('Footer navigation', 'Menyu ya chini')}>
          <p className="micro">{t('Explore', 'Tazama')}</p>
          {sections.map(item => <a key={item.id} href={`/${item.id}`}>{item.label[lang]}</a>)}
          <a href="/parts#garage">{t('Garage', 'Warsha')}</a>
        </nav>
        <div className="footer-social">
          <p className="micro"><Mark /> KIGAMBONI / DAR ES SALAAM</p>
          <ExternalLink href={instagram}><Instagram size={16} aria-hidden="true" /> @pikipikialtraware</ExternalLink>
          <ExternalLink href={maker}>{t('About Fenghao', 'Kuhusu Fenghao')}</ExternalLink>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Altraware Motors</span>
        <ExternalLink href="https://altra.tanzaniareach.com/" className="parent-brand"><img src="/media/altraware-original.webp" alt="" width="14" height="10" /> Altraware Technology</ExternalLink>
        <a href="#top" className="back-top">{t('Back to top', 'Rudi juu')} <ArrowUp size={14} aria-hidden="true" /></a>
      </div>
    </div>
  </footer>;
}
