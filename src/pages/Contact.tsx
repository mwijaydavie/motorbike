import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Check, Copy, Instagram, MapPin } from 'lucide-react';
import { bikes, directMessage, directions, instagram, parts } from '../content';
import { topics } from '../site';
import type { Topic } from '../site';
import { Chapter, ExternalLink, Eyebrow } from '../components/Primitives';
import type { Locale } from '../components/Primitives';
import { usePageQuery } from '../components/use-page-query';

type Inquiry = { topic: Topic; model?: string; part?: string };
const topicOptions = Object.keys(topics) as Topic[];

function InquiryForm({ initial, lang, t }: Locale & { initial: Inquiry }) {
  const [topic, setTopic] = useState<Topic>(initial.topic);
  const [part, setPart] = useState(initial.part ?? '');
  const [model, setModel] = useState(initial.model ?? '');
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState<'yes' | 'manual' | null>(null);
  const preview = useRef<HTMLTextAreaElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (draft) preview.current?.focus(); }, [draft]);

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    const category = topic === 'parts' && parts.find(item => item.id === part);
    setCopied(null);
    setDraft([
      t('Hi Pikipiki Altraware!', 'Habari Pikipiki Altraware!'),
      `${t('Interested in', 'Ninahitaji')}: ${topics[topic][lang]}`,
      category ? `${t('Part category', 'Aina ya kipuri')}: ${category.label[lang]}` : '',
      model.trim() ? `${t('Model', 'Modeli')}: ${model.trim()}` : '',
      message.trim(),
    ].filter(Boolean).join('\n'));
  }
  async function copyMessage() {
    try { await navigator.clipboard.writeText(draft); setCopied('yes'); }
    catch { preview.current?.focus(); preview.current?.select(); setCopied('manual'); }
  }

  return <div className="inquiry-panel" aria-labelledby="inquiry-title">
    <Eyebrow index={draft ? '02' : '01'}>{draft ? t('Copy and send', 'Nakili na utume') : t('Prepare your message', 'Andaa ujumbe wako')}</Eyebrow>
    <h2 className="display inquiry-title" id="inquiry-title">{draft ? t('READY TO SEND.', 'TAYARI KUTUMA.') : t('TELL US WHAT YOU NEED.', 'TUAMBIE UNACHOHITAJI.')}</h2>
    {draft ? <div className="inquiry-form">
      <p>{t('Nothing has been sent. Copy this message, open Instagram, and paste it in our chat.', 'Hakuna kilichotumwa. Nakili ujumbe huu, fungua Instagram, kisha ubandike kwenye mazungumzo nasi.')}</p>
      <label>{t('Your prepared message', 'Ujumbe ulioandaliwa')}<textarea value={draft} ref={preview} rows={6} readOnly /></label>
      <div className="inquiry-actions"><button className="button button-outline-dark" type="button" onClick={copyMessage}>{t('Copy message', 'Nakili ujumbe')} {copied === 'yes' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}</button><ExternalLink className="button button-dark" href={directMessage}>{t('Open Instagram DM', 'Fungua Instagram DM')}</ExternalLink></div>
      <div className="message-footer"><button className="text-link" type="button" onClick={() => { setDraft(''); requestAnimationFrame(() => editor.current?.focus()); }}>{t('Edit message', 'Hariri ujumbe')}</button><span role="status">{copied === 'yes' ? t('Message copied.', 'Ujumbe umenakiliwa.') : copied === 'manual' ? t('Copy the selected text.', 'Nakili ujumbe uliochaguliwa.') : ''}</span></div>
    </div> : <form className="inquiry-form" onSubmit={prepare}>
      <p>{t('We’ll help you write a message to send through Instagram. No account or personal details needed here.', 'Tutakusaidia kuandika ujumbe wa kutuma kupitia Instagram. Huhitaji akaunti au taarifa binafsi hapa.')}</p>
      <div className="field-grid">
        <label>{t('I’m asking about', 'Ninauliza kuhusu')}<select value={topic} onChange={event => setTopic(event.currentTarget.value as Topic)}>{topicOptions.map(key => <option key={key} value={key}>{topics[key][lang]}</option>)}</select></label>
        <label>{t('Motorcycle model (optional)', 'Modeli ya pikipiki (si lazima)')}<input value={model} maxLength={80} placeholder={t('e.g. FH 125 Xpress', 'mf. FH 125 Xpress')} onChange={event => setModel(event.currentTarget.value)} /></label>
      </div>
      {topic === 'parts' && <label>{t('Part category (optional)', 'Aina ya kipuri (si lazima)')}<select value={part} onChange={event => setPart(event.currentTarget.value)}><option value="">{t('Not sure / Other', 'Sijui / Aina nyingine')}</option>{parts.map(item => <option value={item.id} key={item.id}>{item.label[lang]}</option>)}</select></label>}
      <label>{t('What do you need?', 'Unahitaji nini?')}<textarea ref={editor} required rows={4} maxLength={600} value={message} placeholder={t('Tell us the bike, part, or quantity you’re looking for…', 'Tueleze pikipiki, kipuri au idadi unayotafuta…')} onChange={event => setMessage(event.currentTarget.value)} /></label>
      <div className="inquiry-actions"><button className="button button-dark" type="submit" disabled={!message.trim()}>{t('Prepare message', 'Andaa ujumbe')} <ArrowRight aria-hidden="true" size={17} /></button></div>
    </form>}
  </div>;
}

export function ContactPage({ lang, t }: Locale) {
  const { params } = usePageQuery();
  const topic = topicOptions.find(key => key === params.get('topic')) ?? 'general';
  const bike = bikes.find(item => item.id === params.get('bike'));
  const part = topic === 'parts' ? parts.find(item => item.id === params.get('part')) : undefined;
  return <>
    <Chapter number="04" label={t('Contact', 'Mawasiliano')} title={t('LET’S TALK.', 'TUONGEE.')} note={t('Ask about a bike, a spare part or a bulk order. We’re in Kigamboni, Dar es Salaam.', 'Uliza kuhusu pikipiki, kipuri au oda ya jumla. Tupo Kigamboni, Dar es Salaam.')} t={t} />
    <section className="paper-section contact-page" aria-label={t('Contact Altraware', 'Wasiliana na Altraware')}>
      <div className="frame contact-grid">
        <InquiryForm lang={lang} t={t} initial={{ topic, model: bike?.name, part: part?.id }} key={`${topic}:${bike?.id ?? ''}:${part?.id ?? ''}`} />
        <aside className="contact-sidebar">
          <article className="contact-card"><Instagram size={25} aria-hidden="true" /><h2>{t('On Instagram', 'Kwenye Instagram')}</h2><p>{t('Prefer to chat directly? Send us a DM.', 'Ungependa kuzungumza moja kwa moja? Tutumie DM.')}</p><ExternalLink href={directMessage}>{t('Open Instagram DM', 'Fungua Instagram DM')}</ExternalLink><ExternalLink href={instagram}>@pikipikialtraware</ExternalLink></article>
          <article className="contact-card"><MapPin size={25} aria-hidden="true" /><h2>Kigamboni, Dar es Salaam</h2><p>{t('The map shows the area. DM us for the exact shop location before you set out.', 'Ramani inaonyesha eneo la Kigamboni. Tutumie DM kupata sehemu kamili ya duka kabla ya kuondoka.')}</p><ExternalLink href={directions}>{t('Kigamboni on the map', 'Kigamboni kwenye ramani')}</ExternalLink></article>
        </aside>
      </div>
    </section>
  </>;
}
