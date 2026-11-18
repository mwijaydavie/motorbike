import { ArrowUpRight, Cog, Disc3, Link2, Zap } from 'lucide-react';
import { bikes, parts } from '../content';
import { inquiryPath } from '../site';
import { Breadcrumb, Eyebrow, NextLink } from '../components/Primitives';
import type { Locale } from '../components/Primitives';
import { Garage } from '../components/Garage';
import { usePageQuery } from '../components/use-page-query';

const icons = [Cog, Link2, Disc3, Zap];

export function PartsPage({ lang, t }: Locale) {
  const { params, update } = usePageQuery();
  const bike = bikes.find(item => item.id === params.get('bike'));
  return <>
    <section className="parts-hero" aria-labelledby="parts-title">
      <div className="frame">
        <Breadcrumb end={t('Spare parts', 'Vipuri')} t={t} />
        <div className="parts-intro">
          <div className="parts-head">
            <Eyebrow index="02">{t('Altraware / Spare parts', 'Altraware / Vipuri')}</Eyebrow>
            <h1 className="display chapter-title" id="parts-title"><span>{t('KEEP IT', 'ENDELEA')}</span>{' '}<span className="accent">{t('RUNNING.', 'NA SAFARI.')}</span></h1>
            <p>{t('One part or a bulk order. Tell us what you ride, and we’ll help you check fit and availability.', 'Kipuri kimoja au oda ya jumla. Tuambie unachoendesha, tukusaidie kuangalia kama kipuri kinafaa na kinapatikana.')}</p>
            <div className="parts-actions">
              <a className="button button-lime" href="#parts-finder">{t('Find your part', 'Tafuta kipuri')} <ArrowUpRight size={18} aria-hidden="true" /></a>
              <a className="text-link" href="#garage">{t('Explore the Garage', 'Chunguza warsha')} <ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="parts-art"><img src="/media/workshop.webp" alt={t('Editorial close-up of a motorcycle engine and drive chain', 'Picha ya karibu ya injini na mnyororo wa pikipiki')} width="1200" height="669" fetchPriority="high" />
            <span className="parts-art-caption micro">AM / {t('WORKSHOP', 'WARSHA')}</span></div>
        </div>
      </div>
    </section>
    <section className="paper-section parts-finder" id="parts-finder" aria-labelledby="finder-title">
      <div className="frame">
        <div className="section-lead" data-reveal><div><Eyebrow>{t('Parts finder', 'Kitafuta vipuri')}</Eyebrow><h2 id="finder-title" className="display section-title">{t('WHAT DO YOU NEED?', 'UNAHITAJI NINI?')}</h2></div><p>{t('Choose your bike if you know it, then select a part category. You can give us the exact part name or more details in your message.', 'Chagua pikipiki yako kama unaijua, kisha aina ya kipuri. Unaweza kutaja jina halisi la kipuri au maelezo zaidi kwenye ujumbe.')}</p></div>
        <div className="fitment-bar" data-reveal>
          <div className="finder-step"><span className="step-number" aria-hidden="true">01</span><div><h3>{t('Start with your bike', 'Anza na pikipiki yako')}</h3><p>{t('Optional — you can type another model later.', 'Si lazima — unaweza kuandika modeli nyingine baadaye.')}</p></div></div>
          <label className="model-select"><span className="sr-only">{t('Choose a motorcycle model', 'Chagua modeli ya pikipiki')}</span><select value={bike?.id ?? ''} onChange={event => update({ bike: event.currentTarget.value })}>
            <option value="">{t('Select a model (optional)', 'Chagua modeli (si lazima)')}</option>
            {bikes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select></label>
        </div>
        <div className="finder-step part-step" data-reveal><span className="step-number" aria-hidden="true">02</span><div><h3>{t('Choose a part category', 'Chagua aina ya kipuri')}</h3><p>{t('We’ll open an inquiry with your choices filled in.', 'Tutafungua ujumbe wenye chaguo ulilofanya.')}</p></div></div>
        <div className="parts-grid">
          {parts.map((part, i) => {
            const Icon = icons[i];
            return <a className="part-tile" href={inquiryPath('parts', bike?.id, part.id)} key={part.id} data-reveal style={{ '--order': i } as React.CSSProperties}>
              <span className="part-icon"><Icon size={28} strokeWidth={1.5} aria-hidden="true" /><ArrowUpRight size={18} aria-hidden="true" /></span><strong>{part.label[lang]}</strong><span>{part.examples[lang]}</span>
            </a>;
          })}
        </div>
        <div className="parts-uncertain" data-reveal><p>{t('Not sure what it’s called? Describe where it fits or share a picture when you message us.', 'Hujui kinaitwaje? Eleza kinapofungwa au tuma picha kwenye mazungumzo nasi.')}</p><a className="text-link" href={inquiryPath('parts', bike?.id)}>{t('Ask without a category', 'Uliza bila kuchagua aina')} <ArrowUpRight aria-hidden="true" size={16} /></a></div>
      </div>
    </section>
    <Garage lang={lang} t={t} />
    <NextLink label={t('Workshop / Wholesale', 'Warsha / Jumla')} title={t('ORDERING IN BULK?', 'UNAAGIZA JUMLA?')} url={inquiryPath('wholesale', bike?.id)} action={t('Ask about wholesale', 'Uliza kuhusu jumla')} />
  </>;
}
