import { useState } from 'react';
import { ArrowUpRight, Box, Pencil, Search } from 'lucide-react';
import { bikes } from '../content';
import type { Bike } from '../content';
import type { Locale } from '../components/Primitives';
import { bikePath } from '../site';
import { AVAILABILITY, DEFAULT_MODEL, STAGES } from './core.js';
import type { Inquiry, Workspace } from './core.js';
import { availabilityLabels, channelLabels, displayDate, money, requestLabels, stageLabels } from './labels';
import { Empty, Pill } from './ui';

export function Inventory({ state, edit, lang, t }: Locale & { state: Workspace; edit: (bike: Bike) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const rows = bikes.map(bike => ({ bike, record: state.models[bike.id] ?? DEFAULT_MODEL })).filter(({ bike, record }) => (
    (filter === 'all' || (filter === 'unlisted' ? !record.listed : record.availability === filter)) && `${bike.name} ${bike.brand ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
  ));
  return <section className="ops-card ops-register" aria-label={t('Model inventory', 'Stock ya modeli')}>
    <div className="ops-register-head"><div><h2>{t('Motorcycle catalogue', 'Katalogi ya pikipiki')}</h2><p>{t('Counts stay private. Availability and published prices appear on the storefront.', 'Idadi ni ya ndani. Upatikanaji na bei zilizochapishwa zinaonekana kwenye tovuti.')}</p></div><span className="ops-period" role="status">{rows.length} {t('models', 'modeli')}</span></div>
    <div className="ops-toolbar">
      <label className="ops-search"><Search size={17} aria-hidden="true" /><span className="ops-sr">{t('Search models', 'Tafuta modeli')}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('Search models…', 'Tafuta modeli…')} /></label>
      <label className="ops-filter"><span className="ops-sr">{t('Filter by availability', 'Chuja kwa upatikanaji')}</span><select value={filter} onChange={event => setFilter(event.target.value)}>
        <option value="all">{t('All availability', 'Upatikanaji wote')}</option>
        {AVAILABILITY.map(value => <option value={value} key={value}>{availabilityLabels[value][lang]}</option>)}
        <option value="unlisted">{t('Not listed', 'Hazijaorodheshwa')}</option>
      </select></label>
    </div>
    {rows.length ? <div className="ops-table-wrap"><table className="ops-table" aria-label={t('Motorcycle inventory', 'Stock ya pikipiki')}><thead><tr>
      <th scope="col">{t('Model', 'Modeli')}</th><th scope="col">{t('Availability', 'Upatikanaji')}</th><th scope="col">{t('Units', 'Idadi')}</th><th scope="col">{t('Public price', 'Bei ya tovuti')}</th><th scope="col">{t('Listing', 'Tangazo')}</th><th scope="col" className="ops-table-actions">{t('Manage', 'Simamia')}</th>
    </tr></thead><tbody>{rows.map(({ bike, record }) => <tr key={bike.id}>
      <td data-label={t('Model', 'Modeli')}><span className="ops-model"><span className="ops-thumb">{bike.image ? <img src={bike.image} alt="" width="52" height="38" /> : <Box size={19} aria-hidden="true" />}</span><span><strong>{bike.name}</strong><small>{bike.brand ?? 'Altraware'} · {bike.cc[lang]}</small></span></span></td>
      <td data-label={t('Availability', 'Upatikanaji')}><Pill tone={record.availability}>{availabilityLabels[record.availability][lang]}</Pill></td>
      <td data-label={t('Units', 'Idadi')} className="ops-table-number">{record.units ?? '—'}</td>
      <td data-label={t('Public price', 'Bei ya tovuti')} className="ops-table-number">{record.listed && record.priceTzs != null ? money(record.priceTzs) : '—'}</td>
      <td data-label={t('Listing', 'Tangazo')}><span className="ops-listing" data-listed={record.listed}>{record.listed ? t('Listed', 'Inaonekana') : t('Hidden from browse', 'Haipo kwenye orodha')}</span></td>
      <td className="ops-table-actions"><a href={bikePath(bike.id)} target="_blank" rel="noreferrer" className="ops-icon-button" aria-label={`${t('Open storefront page for', 'Fungua ukurasa wa')} ${bike.name}`}><ArrowUpRight size={16} aria-hidden="true" /></a><button type="button" className="ops-icon-button ops-edit" onClick={() => edit(bike)} aria-label={`${t('Edit', 'Hariri')} ${bike.name}`}><Pencil size={15} aria-hidden="true" /></button></td>
    </tr>)}</tbody></table></div> : <Empty title={t('No matching models', 'Hakuna modeli zinazolingana')} note={t('Clear the search or choose a different availability.', 'Ondoa utafutaji au chagua hali nyingine.')}><button type="button" className="ops-button ops-button-outline" onClick={() => { setQuery(''); setFilter('all'); }}>{t('Clear filters', 'Ondoa vichujio')}</button></Empty>}
  </section>;
}

export function InquiryRegister({ state, edit, lang, t }: Locale & { state: Workspace; edit: (inquiry: Inquiry) => void }) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<'all' | Inquiry['stage']>('all');
  const q = query.trim().toLowerCase();
  const rows = [...state.inquiries].filter(item => (stage === 'all' || item.stage === stage) && `${item.reference} ${item.request} ${item.contact}`.toLowerCase().includes(q)).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  return <section className="ops-card ops-register" aria-label={t('Inquiry register', 'Rejesta ya maulizo')}>
    <div className="ops-register-head"><div><h2>{t('Inquiry register', 'Rejesta ya maulizo')}</h2><p>{t('Record and follow up with people who contacted you. No Instagram sync.', 'Rekodi na fuatilia waliowasiliana nanyi. Hakuna uunganishaji wa Instagram.')}</p></div><span className="ops-period" role="status">{rows.length} {t('inquiries', 'maulizo')}</span></div>
    <div className="ops-toolbar ops-inquiry-toolbar"><div className="ops-stage-filters" role="group" aria-label={t('Filter by stage', 'Chuja kwa hatua')}>
      {(['all', ...STAGES] as const).map(key => <button type="button" key={key} className="ops-filter-button" aria-pressed={key === stage} onClick={() => setStage(key)}>{key === 'all' ? t('All', 'Yote') : stageLabels[key][lang]}<span>{key === 'all' ? state.inquiries.length : state.inquiries.filter(item => item.stage === key).length}</span></button>)}
    </div><label className="ops-search"><Search size={17} aria-hidden="true" /><span className="ops-sr">{t('Search inquiries', 'Tafuta maulizo')}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('Search inquiries…', 'Tafuta maulizo…')} /></label></div>
    {rows.length ? <div className="ops-table-wrap"><table className="ops-table" aria-label={t('Customer inquiries', 'Maulizo ya wateja')}><thead><tr>
      <th scope="col">{t('Request', 'Ombi')}</th><th scope="col">{t('Channel', 'Njia')}</th><th scope="col">{t('Stage', 'Hatua')}</th><th scope="col">{t('Updated', 'Ilisasishwa')}</th><th scope="col" className="ops-table-actions">{t('Manage', 'Simamia')}</th>
    </tr></thead><tbody>{rows.map(item => <tr key={item.id}>
      <td data-label={t('Request', 'Ombi')}><span className="ops-item-copy"><strong>{item.request}</strong><small>{item.reference} · {requestLabels[item.type][lang]}</small></span></td>
      <td data-label={t('Channel', 'Njia')}>{channelLabels[item.channel][lang]}</td>
      <td data-label={t('Stage', 'Hatua')}><Pill tone={item.stage}>{stageLabels[item.stage][lang]}</Pill></td>
      <td data-label={t('Updated', 'Ilisasishwa')} className="ops-table-number">{displayDate(item.updatedAt, lang)}</td>
      <td className="ops-table-actions"><button type="button" className="ops-icon-button ops-edit" onClick={() => edit(item)} aria-label={`${t('Edit inquiry', 'Hariri ulizo')}: ${item.request}`}><Pencil size={15} aria-hidden="true" /></button></td>
    </tr>)}</tbody></table></div> : <Empty title={t('No inquiries here yet', 'Hakuna maulizo hapa bado')} note={t('Change the filters or use New inquiry to record a request.', 'Badili vichujio au tumia Ulizo jipya kurekodi ombi.')} />}
  </section>;
}
