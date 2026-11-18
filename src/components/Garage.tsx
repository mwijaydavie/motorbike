import { useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { details, maker200 } from '../content';
import { Eyebrow, Mark } from './Primitives';
import type { Locale } from './Primitives';

export function Garage({ lang, t }: Locale) {
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
        <div className="section-lead garage-lead" data-reveal>
          <div>
            <Eyebrow index="03">{t('Inside the garage', 'Ndani ya warsha')}</Eyebrow>
            <h2 className="display section-title" id="garage-title">{t('A CLOSER LOOK.', 'ANGALIA KWA KARIBU.')}</h2>
          </div>
          <p>{t('Select a marker to inspect the Fenghao FH200-19. The photo comes from the manufacturer’s catalogue.', 'Chagua alama ili kuangalia Fenghao FH200-19 kwa karibu. Picha imetoka kwenye katalogi ya mtengenezaji.')}</p>
        </div>
        <div className="inspection" data-reveal>
          <div className="inspection-stage" onPointerMove={moveRig} onPointerLeave={resetRig}>
            <div className="inspection-coords" aria-hidden="true"><span>FIG / 01</span><span>FH200-19</span></div>
            <div className="inspection-rig">
              <img src="/media/fenghao-200-red.webp" alt={t('Manufacturer side view of a red and black Fenghao FH200-19', 'Picha ya pembeni ya Fenghao FH200-19 nyekundu na nyeusi kutoka kwa mtengenezaji')} width="1100" height="727" loading="lazy" />
              {details.map((d, i) => (
                <button key={d.id} className="hotspot" type="button" style={{ left: `${d.x}%`, top: `${d.y}%` }} onClick={() => setPointIndex(i)} aria-pressed={i === pointIndex} aria-label={t(`Inspect ${d.label.en.toLowerCase()}`, `Angalia ${d.label.sw.toLowerCase()}`)}><Plus size={17} strokeWidth={2} aria-hidden="true" /></button>
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
