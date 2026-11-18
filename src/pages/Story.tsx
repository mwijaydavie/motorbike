import { ArrowUpRight, Instagram, MapPin, Package, Play, Wrench } from 'lucide-react';
import { directions, instagram, maker } from '../content';
import { Breadcrumb, ExternalLink, Eyebrow, NextLink } from '../components/Primitives';
import type { Locale } from '../components/Primitives';
import type { FilmTrigger } from './Home';

export function StoryPage({ t, openFilm }: Locale & { openFilm: FilmTrigger }) {
  return <>
    <section className="story-hero" aria-labelledby="story-title">
      <picture className="story-photo"><source media="(max-width: 700px)" srcSet="/media/roads-mobile.webp" /><img src="/media/roads-of-tanzania.webp" alt="" width="1264" height="848" fetchPriority="high" /></picture>
      <div className="story-shade" aria-hidden="true" />
      <div className="frame">
        <Breadcrumb end={t('Our story', 'Kuhusu sisi')} t={t} />
        <div className="story-hero-inner">
          <div className="story-head"><Eyebrow index="03">{t('The Altraware story', 'Hadithi ya Altraware')}</Eyebrow>
            <h1 className="display chapter-title" id="story-title"><span>{t('ROOTED IN DAR.', 'TUNATOKA DAR.')}</span>{' '}<span className="accent">{t('READY TO RIDE.', 'TWENDE SAFARI.')}</span></h1>
            <p>{t('For the people who ride to earn a living, and the ones who ride just to see what’s around the bend.', 'Kwa wanaoendesha pikipiki kujipatia riziki, na wanaoendesha kwa hamu ya kuona kilicho mbele.')}</p>
          </div>
          <button className="story-play" type="button" aria-haspopup="dialog" onClick={event => openFilm(event.currentTarget)}><span><Play size={27} fill="currentColor" aria-hidden="true" /></span><strong>{t('Play the film', 'Cheza video')}</strong><small className="micro">00:11 / {t('CAMPAIGN', 'KAMPENI')}</small></button>
        </div>
      </div>
    </section>
    <section className="paper-section story-intro" aria-labelledby="story-about">
      <div className="frame">
        <div className="story-editorial" data-reveal><div><Eyebrow>{t('Pikipiki Altraware / Dar es Salaam', 'Pikipiki Altraware / Dar es Salaam')}</Eyebrow><h2 className="display section-title" id="story-about">{t('TWO WHEELS. MANY WAYS TO RIDE.', 'MAGURUDUMU MAWILI. SAFARI NYINGI.')}</h2></div>
          <div><p>{t('We’re Pikipiki Altraware, based in Kigamboni. We sell Fenghao motorcycles and spares, jumla na rejareja — wholesale and retail. Whether the bike is for work or the weekend, tell us what you need and we’ll help you find a place to start.', 'Sisi ni Pikipiki Altraware kutoka Kigamboni. Tunauza pikipiki za Fenghao na vipuri, jumla na rejareja. Iwe ni kwa kazi au matembezi ya mwisho wa wiki, tuambie unachohitaji tukusaidie kuanza.')}</p><ExternalLink href={instagram}><Instagram size={17} aria-hidden="true" /> @pikipikialtraware</ExternalLink></div>
        </div>
        <div className="story-facts">
          <div className="story-fact" data-reveal><MapPin size={26} aria-hidden="true" /><strong>{t('Based in Kigamboni', 'Tupo Kigamboni')}</strong><p>Dar es Salaam, Tanzania</p><ExternalLink href={directions}>{t('See the area on a map', 'Tazama eneo kwenye ramani')}</ExternalLink></div>
          <div className="story-fact" data-reveal><Package size={26} aria-hidden="true" /><strong>{t('Wholesale & retail', 'Jumla na rejareja')}</strong><p>{t('Ask about one bike or a bulk order.', 'Uliza kuhusu pikipiki moja au oda ya jumla.')}</p><a className="text-link" href="/contact?topic=wholesale">{t('Ask about orders', 'Uliza kuhusu oda')} <ArrowUpRight size={14} aria-hidden="true" /></a></div>
          <div className="story-fact" data-reveal><Wrench size={26} aria-hidden="true" /><strong>{t('Motorcycles & spares', 'Pikipiki na vipuri')}</strong><p>{t('Featuring Fenghao and other listings.', 'Tunaonyesha modeli za Fenghao na matangazo mengine.')}</p><ExternalLink href={maker}>{t('Learn about Fenghao', 'Jifunze kuhusu Fenghao')}</ExternalLink></div>
        </div>
      </div>
    </section>
    <NextLink label={t('Up next / The lineup', 'Inayofuata / Pikipiki')} title={t('FIND YOUR RIDE.', 'CHAGUA PIKIPIKI YAKO.')} url="/motorcycles" action={t('Explore motorcycles', 'Tazama pikipiki')} />
  </>;
}
