import { Activity as Pulse, ArrowRight, Box, CircleCheck, ClipboardList, MessageSquare, PackageCheck, Plus, Truck } from 'lucide-react';
import { bikes } from '../content';
import type { Locale } from '../components/Primitives';
import { DEFAULT_MODEL, isOpen } from './core.js';
import type { Activity, Inquiry, RequestType, Workspace } from './core.js';
import { availabilityLabels, channelLabels, displayDate, requestLabels, stageLabels, tzDay } from './labels';
import { Empty, Pill } from './ui';

export function Overview({ state, openView, newInquiry, editInquiry, lang, t }: Locale & {
  state: Workspace; openView: (view: 'inventory' | 'inquiries') => void; newInquiry: () => void; editInquiry: (inquiry: Inquiry) => void;
}) {
  const listing = bikes.map(bike => state.models[bike.id] ?? DEFAULT_MODEL);
  const listed = listing.filter(model => model.listed);
  const inStock = listed.filter(model => model.availability === 'in-stock');
  const open = state.inquiries.filter(isOpen);
  const quoted = open.filter(inquiry => inquiry.stage === 'quoted');
  const cards = [
    { icon: Box, value: listed.length, label: t('Listed models', 'Modeli kwenye katalogi'), foot: t(`${listing.length} models in catalogue`, `Modeli ${listing.length} kwenye katalogi`), tone: 'sage' },
    { icon: PackageCheck, value: inStock.length, label: t('Models in stock', 'Modeli zilizopo'), foot: t(`${inStock.reduce((n, item) => n + (item.units ?? 0), 0)} tracked units`, `Idadi inayofuatiliwa: ${inStock.reduce((n, item) => n + (item.units ?? 0), 0)}`), tone: 'lime' },
    { icon: MessageSquare, value: open.length, label: t('Open inquiries', 'Maulizo yanayoendelea'), foot: t(`${open.filter(inquiry => inquiry.stage === 'new').length} waiting for first reply`, `${open.filter(inquiry => inquiry.stage === 'new').length} yanasubiri jibu la kwanza`), tone: 'sand' },
    { icon: ClipboardList, value: quoted.length, label: t('Quotes to follow up', 'Bei za kufuatilia'), foot: t('Marked as quoted by your team', 'Timu imeweka alama ya bei kutumwa'), tone: 'blue' },
  ];
  const statuses = [
    { key: 'in-stock', tone: 'green', label: availabilityLabels['in-stock'][lang], count: inStock.length },
    { key: 'order', tone: 'blue', label: availabilityLabels.order[lang], count: listed.filter(item => item.availability === 'order').length },
    { key: 'ask', tone: 'neutral', label: availabilityLabels.ask[lang], count: listed.filter(item => item.availability === 'ask').length },
    { key: 'sold-out', tone: 'red', label: availabilityLabels['sold-out'][lang], count: listed.filter(item => item.availability === 'sold-out').length },
    ...(listing.length > listed.length ? [{ key: 'hidden', tone: 'muted', label: t('Not listed', 'Hazijaorodheshwa'), count: listing.length - listed.length }] : []),
  ];
  const now = Date.now();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = now - (6 - index) * 86_400_000;
    const key = tzDay(date);
    return { label: displayDate(date, lang, { weekday: 'short' }), date: displayDate(date, lang), today: index === 6, count: state.inquiries.filter(item => tzDay(item.createdAt) === key).length };
  });
  const newThisWeek = days.reduce((n, day) => n + day.count, 0);
  const scale = Math.max(3, Math.ceil(Math.max(...days.map(day => day.count)) / 3) * 3);
  const queue = [...open].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  return <>
    <div className="ops-stats">
      {cards.map(({ icon: Icon, value, label, foot, tone }) => <article className="ops-card ops-stat" key={label}>
        <span className="ops-stat-icon" data-tone={tone}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span><p>{label}</p><strong>{value}</strong><small>{foot}</small>
      </article>)}
    </div>
    <div className="ops-split ops-dashboard-row">
      <section className="ops-card ops-pulse" aria-labelledby="pulse-heading">
        <div className="ops-card-head"><div><span className="ops-kicker"><Pulse size={14} aria-hidden="true" /> {t('Activity', 'Shughuli')}</span><h2 id="pulse-heading">{t('Inquiry pulse', 'Mwenendo wa maulizo')}</h2><p>{t('Requests recorded by your team, not site visits.', 'Maulizo yaliyorekodiwa na timu, si matembezi ya tovuti.')}</p></div><span className="ops-period">{t('Last 7 days', 'Siku 7 zilizopita')}</span></div>
        <div className="ops-chart-summary"><strong>{newThisWeek}</strong><span>{t('inquiries recorded', 'maulizo yaliyorekodiwa')}</span></div>
        <div className="ops-chart" role="img" aria-label={`${t('Inquiries by day', 'Maulizo kwa siku')}: ${days.map(day => `${day.date}: ${day.count}`).join(', ')}`}>
          <div className="ops-axis" aria-hidden="true">{[scale, scale * 2 / 3, scale / 3, 0].map(n => <span key={n}>{n}</span>)}</div>
          <div className="ops-plot" aria-hidden="true">
            <div className="ops-gridlines"><i /><i /><i /><i /></div>
            {days.map(day => <div className="ops-bar-col" key={day.date}><div className="ops-bar-base"><span className="ops-bar" data-today={day.today} style={{ height: day.count ? `${day.count / scale * 100}%` : '2px' }} title={`${day.date}: ${day.count}`} /></div><small>{day.label}</small></div>)}
          </div>
        </div>
      </section>
      <section className="ops-card ops-stock-summary" aria-labelledby="catalogue-health">
        <div className="ops-card-head"><div><span className="ops-kicker"><Truck size={14} aria-hidden="true" /> {t('Storefront', 'Tovuti ya wateja')}</span><h2 id="catalogue-health">{t('Catalogue status', 'Hali ya katalogi')}</h2><p>{t('Availability shown to visitors.', 'Upatikanaji unaoonekana kwa wateja.')}</p></div></div>
        <div className="ops-stock-bar" aria-hidden="true">{statuses.filter(status => status.count).map(status => <span key={status.key} data-tone={status.tone} style={{ flexGrow: status.count }} />)}</div>
        <ul className="ops-stock-legend">{statuses.map(status => <li key={status.key}><Pill tone={status.tone}>{status.label}</Pill><strong>{status.count}</strong></li>)}</ul>
        <button className="ops-link" type="button" onClick={() => openView('inventory')}>{t('Manage inventory', 'Simamia stock')} <ArrowRight size={15} aria-hidden="true" /></button>
      </section>
    </div>
    <div className="ops-split ops-dashboard-row">
      <section className="ops-card ops-queue" aria-labelledby="queue-heading">
        <div className="ops-card-head"><div><h2 id="queue-heading">{t('Follow-up queue', 'Foleni ya kufuatilia')}</h2><p>{t('Open inquiries with the most recent activity.', 'Maulizo yanayoendelea, yaliyo na shughuli za karibuni.')}</p></div><button type="button" className="ops-button ops-button-outline" onClick={() => openView('inquiries')}>{t('View all', 'Tazama yote')} <ArrowRight size={15} aria-hidden="true" /></button></div>
        {queue.length ? <ul className="ops-queue-list">{queue.map(item => <li key={item.id}><button type="button" onClick={() => editInquiry(item)}>
          <span className="ops-queue-icon"><MessageSquare size={16} aria-hidden="true" /></span><span><strong>{item.request}</strong><small>{item.reference} · {channelLabels[item.channel][lang]}</small></span><Pill tone={item.stage}>{stageLabels[item.stage][lang]}</Pill>
        </button></li>)}</ul> : <Empty title={t('No open inquiries', 'Hakuna maulizo yanayoendelea')} note={t('Record a DM, a call or an in-store request to follow it here.', 'Rekodi DM, simu au ulizo la dukani ili ulifuatilie hapa.')}><button className="ops-button ops-button-outline" type="button" onClick={newInquiry}><Plus size={15} aria-hidden="true" />{t('Add an inquiry', 'Ongeza ulizo')}</button></Empty>}
      </section>
      <section className="ops-card ops-activity" aria-labelledby="activity-heading">
        <div className="ops-card-head"><div><h2 id="activity-heading">{t('Recent changes', 'Mabadiliko ya karibuni')}</h2><p>{t('Latest saves in this workspace.', 'Mabadiliko yaliyohifadhiwa hapa karibuni.')}</p></div></div>
        {state.activity.length ? <ul className="ops-activity-list">{state.activity.slice(0, 4).map(event => <Event key={event.id} event={event} lang={lang} t={t} />)}</ul> : <Empty title={t('Nothing changed yet', 'Hakuna mabadiliko bado')} note={t('Saved inventory and inquiry changes appear here.', 'Mabadiliko ya stock na maulizo yataonekana hapa.')} />}
      </section>
    </div>
  </>;
}

function Event({ event, lang, t }: Locale & { event: Activity }) {
  const label = event.kind === 'model' ? t('Inventory updated', 'Stock imesasishwa') : event.kind === 'inquiry-added' ? t('Inquiry recorded', 'Ulizo limerekodiwa') : event.kind === 'inquiry-removed' ? t('Inquiry removed', 'Ulizo limeondolewa') : t('Inquiry updated', 'Ulizo limesasishwa');
  const subject = event.kind === 'model' ? bikes.find(bike => bike.id === event.target)?.name : requestLabels[event.target as RequestType]?.[lang];
  return <li><span className="ops-queue-icon"><CircleCheck size={16} strokeWidth={1.8} aria-hidden="true" /></span><span><strong>{label}</strong><small>{subject} · {displayDate(event.at, lang)}</small></span></li>;
}
