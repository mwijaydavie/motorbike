import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, Check, Eye, Info, Trash2 } from 'lucide-react';
import type { Bike } from '../content';
import type { Locale } from '../components/Primitives';
import { bikePath } from '../site';
import { AVAILABILITY, CHANNELS, REQUEST_TYPES, STAGES } from './core.js';
import type { Availability, Inquiry, InquiryInput, Mutation, StockRecord } from './core.js';
import { availabilityLabels, channelLabels, money, requestLabels, stageLabels } from './labels';
import { EditorDialog, Pill, errorCode, errorMessage } from './ui';

type EditorProps = Locale & { close: () => void; save: (mutation: Mutation) => Promise<void> };
const asNumber = (input: string) => input.trim() === '' ? null : Number(input);

export function ModelEditor({ bike, stock, close, save, lang, t }: EditorProps & { bike: Bike; stock: StockRecord }) {
  const [availability, setAvailability] = useState(stock.availability);
  const [units, setUnits] = useState(stock.units?.toString() ?? '');
  const [price, setPrice] = useState(stock.priceTzs?.toString() ?? '');
  const [listed, setListed] = useState(stock.listed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || error === 'conflict') return;
    setBusy(true);
    setError('');
    try { await save({ action: 'save-model', modelId: bike.id, data: { listed, availability, units: asNumber(units), priceTzs: asNumber(price) } }); }
    catch (e) { setError(errorCode(e)); }
    finally { setBusy(false); }
  }
  const previewPrice = asNumber(price);
  return <EditorDialog title={bike.name} note={t('Update availability, your internal count, and the public price.', 'Sasisha upatikanaji, idadi ya ndani na bei ya tovuti.')} close={close} busy={busy} t={t}>
    <form onSubmit={submit} className="ops-form">
      <div className="ops-form-body">
        <label>{t('Availability', 'Upatikanaji')}<select value={availability} onChange={event => setAvailability(event.target.value as Availability)}>{AVAILABILITY.map(status => <option value={status} key={status}>{availabilityLabels[status][lang]}</option>)}</select></label>
        <div className="ops-form-grid"><label>{t('Units on hand', 'Idadi iliyopo')}<input type="number" min="0" max="99999" step="1" value={units} placeholder={t('Unknown', 'Haijulikani')} onChange={event => setUnits(event.target.value)} /><small>{t('Private. At least 1 to mark in stock.', 'Ya ndani. Angalau 1 kuweka ipo dukani.')}</small></label>
          <label>{t('Public price (TSh)', 'Bei ya tovuti (TSh)')}<input type="number" min="1" max="999999999" step="1" value={price} placeholder={t('On request', 'Kwa kuuliza')} onChange={event => setPrice(event.target.value)} /><small>{t('Leave empty for “Ask for price”.', 'Acha wazi ili wateja waulize bei.')}</small></label></div>
        <label className="ops-check-card"><input type="checkbox" checked={listed} onChange={event => setListed(event.target.checked)} /><span><strong>{t('Show in catalogue', 'Onyesha kwenye katalogi')}</strong><small>{t('Turning this off removes the model from browse results. Its old link still works and shows a not-listed notice.', 'Ukizima, modeli haitaonekana kwenye orodha. Link ya zamani bado itafunguka na kuonyesha kwamba haijaorodheshwa.')}</small></span></label>
        <section className="ops-preview" aria-label={t('Storefront preview', 'Muonekano kwa wateja')}><span className="ops-kicker"><Eye size={14} aria-hidden="true" />{t('Storefront preview', 'Muonekano kwa wateja')}</span><strong>{bike.name}</strong>
          {listed ? <div><Pill tone={availability}>{availabilityLabels[availability][lang]}</Pill><span>{previewPrice != null && previewPrice > 0 ? money(previewPrice) : t('Ask for price', 'Uliza bei')}</span></div> : <p>{t('Not listed in the catalogue.', 'Haijaorodheshwa kwenye katalogi.')}</p>}
        </section>
        {error && <p className="ops-form-error" role="alert">{errorMessage(error, t)}</p>}
      </div>
      <div className="ops-dialog-actions"><a href={bikePath(bike.id)} className="ops-link" target="_blank" rel="noreferrer">{t('View model', 'Tazama modeli')} <ArrowUpRight size={15} aria-hidden="true" /></a><button type="submit" className="ops-button ops-button-primary" disabled={busy || error === 'conflict'}><Check size={16} aria-hidden="true" />{busy ? t('Saving…', 'Inahifadhi…') : t('Save inventory', 'Hifadhi stock')}</button></div>
    </form>
  </EditorDialog>;
}

const blank: InquiryInput = { reference: '', request: '', contact: '', notes: '', type: 'motorcycle', channel: 'instagram', stage: 'new' };
export function InquiryEditor({ inquiry, close, save, lang, t }: EditorProps & { inquiry?: Inquiry }) {
  const [fields, setFields] = useState<InquiryInput>(inquiry ?? blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  function field<K extends keyof InquiryInput>(key: K, value: InquiryInput[K]) { setFields(previous => ({ ...previous, [key]: value })); }
  async function submit(change: Mutation) {
    if (busy || error === 'conflict') return;
    setBusy(true);
    setError('');
    try { await save(change); }
    catch (e) { setError(errorCode(e)); }
    finally { setBusy(false); }
  }
  return <EditorDialog title={inquiry ? t('Edit inquiry', 'Hariri ulizo') : t('New inquiry', 'Ulizo jipya')} note={t('Internal follow-up only. Saving won’t send a reply or contact the customer.', 'Ni kwa ufuatiliaji wa ndani. Kuhifadhi hakutatuma jibu wala kuwasiliana na mteja.')} close={close} busy={busy} t={t}>
    <form className="ops-form" onSubmit={event => { event.preventDefault(); void submit({ action: 'save-inquiry', id: inquiry?.id, data: fields }); }}>
      <div className="ops-form-body">
        <label>{t('Customer reference', 'Rejea ya mteja')}<input required maxLength={80} value={fields.reference} placeholder={t('e.g. Walk-in 12 or first name', 'mf. Mteja 12 au jina la kwanza')} onChange={event => field('reference', event.target.value)} /></label>
        <label>{t('What are they asking for?', 'Wanauliza kuhusu nini?')}<input required maxLength={160} value={fields.request} placeholder={t('e.g. Price for FH 125 Xpress', 'mf. Bei ya FH 125 Xpress')} onChange={event => field('request', event.target.value)} /></label>
        <div className="ops-form-grid"><label>{t('Request type', 'Aina ya ombi')}<select value={fields.type} onChange={event => field('type', event.target.value as InquiryInput['type'])}>{REQUEST_TYPES.map(key => <option key={key} value={key}>{requestLabels[key][lang]}</option>)}</select></label>
          <label>{t('Channel', 'Njia')}<select value={fields.channel} onChange={event => field('channel', event.target.value as InquiryInput['channel'])}>{CHANNELS.map(key => <option value={key} key={key}>{channelLabels[key][lang]}</option>)}</select></label></div>
        <label>{t('Stage', 'Hatua')}<select value={fields.stage} onChange={event => field('stage', event.target.value as InquiryInput['stage'])}>{STAGES.map(key => <option key={key} value={key}>{stageLabels[key][lang]}</option>)}</select></label>
        <label>{t('Contact reference (optional)', 'Rejea ya mawasiliano (si lazima)')}<input maxLength={100} value={fields.contact} placeholder={t('e.g. Instagram handle', 'mf. Jina la Instagram')} onChange={event => field('contact', event.target.value)} /></label>
        <label>{t('Internal notes (optional)', 'Maelezo ya ndani (si lazima)')}<textarea rows={3} maxLength={600} value={fields.notes} placeholder={t('Next step or details you need to confirm', 'Hatua inayofuata au maelezo ya kuthibitisha')} onChange={event => field('notes', event.target.value)} /></label>
        {confirming && inquiry && <div className="ops-confirm"><Info size={18} aria-hidden="true" /><div><strong>{t('Permanently remove this inquiry?', 'Ondoa ulizo hili kabisa?')}</strong><p>{t('Its notes and contact reference will be removed from the workspace.', 'Maelezo na rejea ya mawasiliano vitaondolewa hapa.')}</p><div><button type="button" className="ops-button ops-button-outline" onClick={() => setConfirming(false)} disabled={busy}>{t('Keep it', 'Lihifadhi')}</button><button type="button" className="ops-button ops-button-danger" onClick={() => void submit({ action: 'remove-inquiry', id: inquiry.id })} disabled={busy || error === 'conflict'}>{t('Remove inquiry', 'Ondoa ulizo')}</button></div></div></div>}
        {error && <p className="ops-form-error" role="alert">{errorMessage(error, t)}</p>}
      </div>
      <div className="ops-dialog-actions">{inquiry ? <button type="button" className="ops-link ops-danger-link" onClick={() => setConfirming(true)} disabled={busy || confirming}><Trash2 size={15} aria-hidden="true" />{t('Remove…', 'Ondoa…')}</button> : <button className="ops-link" type="button" onClick={close} disabled={busy}>{t('Cancel', 'Ghairi')}</button>}<button className="ops-button ops-button-primary" type="submit" disabled={busy || confirming || error === 'conflict'}><Check size={16} aria-hidden="true" />{busy ? t('Saving…', 'Inahifadhi…') : t('Save inquiry', 'Hifadhi ulizo')}</button></div>
    </form>
  </EditorDialog>;
}
