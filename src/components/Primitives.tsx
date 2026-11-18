import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Language } from '../content';

export type Translate = (en: string, sw: string) => string;
export type Locale = { lang: Language; t: Translate };

export function Mark({ className = '' }: { className?: string }) {
  return <span className={`slash-mark ${className}`} aria-hidden="true"><i /><i /></span>;
}

export function Logo() {
  return <span className="logo">
    <img src="/media/altraware-mark.webp" alt="" width="42" height="29" />
    <span className="logotype"><strong>ALTRAWARE</strong>{' '}<small>MOTORS</small></span>
  </span>;
}

export function Eyebrow({ index, children, className = '' }: { index?: string; children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}><Mark />{index && <><span className="eyebrow-index">{index}</span><span aria-hidden="true">/</span></>}{children}</p>;
}

export function Breadcrumb({ t, end, middle }: { t: Translate; end: string; middle?: { url: string; label: string } }) {
  return <nav className="breadcrumbs" aria-label={t('Breadcrumb', 'Njia ya ukurasa')}>
    <ol>
      <li><a href="/">{t('Home', 'Nyumbani')}</a></li>
      {middle && <li><ChevronRight size={12} aria-hidden="true" /><a href={middle.url}>{middle.label}</a></li>}
      <li><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">{end}</span></li>
    </ol>
  </nav>;
}

export function Chapter({ number, label, title, accent, note, t }: { number: string; label: string; title: string; accent?: string; note?: string; t: Translate }) {
  return <section className="chapter">
    <div className="frame">
      <Breadcrumb t={t} end={label} />
      <div className="chapter-core">
        <div className="chapter-marker" aria-hidden="true"><span>AM</span><b>{number}</b><i /></div>
        <div className="chapter-copy">
          <Eyebrow index={number}>{label}</Eyebrow>
          <h1 className="display chapter-title"><span>{title}</span>{accent && <span className="accent">{accent}</span>}</h1>
        </div>
        {note && <p className="chapter-note">{note}</p>}
      </div>
    </div>
  </section>;
}

export function NextLink({ label, title, url, action }: { label: string; title: string; url: string; action: string }) {
  return <aside className="next-band">
    <a className="frame next-inner" href={url}>
      <div><Eyebrow>{label}</Eyebrow><h2 className="display">{title}</h2></div>
      <span className="next-action">{action}<ArrowRight aria-hidden="true" size={22} /></span>
    </a>
  </aside>;
}

export function ExternalLink({ href, children, className = 'text-link' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight aria-hidden="true" size={15} /></a>;
}
