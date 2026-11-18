import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpRight, Inbox, X } from 'lucide-react';
import type { Locale } from '../components/Primitives';
import { OpsError } from './core.js';

export function OpsLogo() {
  return <span className="ops-logo"><span className="ops-logo-icon"><img src="/media/altraware-mark.webp" alt="" width="31" height="22" /></span><span><strong>ALTRAWARE</strong><small>OPERATIONS</small></span></span>;
}
export function Pill({ tone = 'neutral', children }: { tone?: string; children: ReactNode }) {
  return <span className="ops-pill" data-tone={tone}><i aria-hidden="true" />{children}</span>;
}
export function Empty({ title, note, children }: { title: string; note: string; children?: ReactNode }) {
  return <div className="ops-empty"><Inbox size={27} aria-hidden="true" /><strong>{title}</strong><p>{note}</p>{children}</div>;
}
export function StoreLink({ t }: Pick<Locale, 't'>) {
  const label = t('View storefront', 'Fungua tovuti');
  return <a className="ops-button ops-button-outline ops-store-link" href="/" target="_blank" rel="noreferrer" aria-label={label} title={label}><span>{label}</span><ArrowUpRight size={15} aria-hidden="true" /></a>;
}
export function EditorDialog({ title, note, close, busy, children, t }: { title: string; note: string; close: () => void; busy: boolean; children: ReactNode; t: Locale['t'] }) {
  const element = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = element.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return <dialog aria-labelledby="ops-editor-title" className="ops-dialog" ref={element} onCancel={event => { event.preventDefault(); if (!busy) close(); }}>
    <div className="ops-dialog-head"><div><span className="ops-kicker">{t('Operations desk', 'Dawati la usimamizi')}</span><h2 id="ops-editor-title">{title}</h2><p>{note}</p></div>
      <button type="button" className="ops-icon-button" aria-label={t('Close editor', 'Funga kihariri')} onClick={close} disabled={busy}><X size={21} aria-hidden="true" /></button></div>
    {children}
  </dialog>;
}
export function errorCode(error: unknown) { return error instanceof OpsError ? error.code : 'service_unavailable'; }
export function errorMessage(code: string, t: Locale['t']) {
  switch (code) {
    case 'bad_password': return t('That password didn’t match.', 'Nenosiri hilo si sahihi.');
    case 'rate_limited': return t('Too many attempts. Try again in about 10 minutes.', 'Majaribio mengi. Jaribu tena baada ya takribani dakika 10.');
    case 'sign_in_required': return t('Your session ended. Sign in again.', 'Kipindi chako kimeisha. Ingia tena.');
    case 'invalid_origin': return t('Open this workspace directly in its own tab and try again.', 'Fungua ukurasa huu moja kwa moja kwenye kichupo chake, kisha jaribu tena.');
    case 'storage_blocked': return t('This browser didn’t allow saving the demo. Open it directly in a new tab.', 'Kivinjari hakikuruhusu kuhifadhi mfano. Fungua kwenye kichupo kipya moja kwa moja.');
    case 'conflict': return t('A newer change exists. Close this editor, refresh the workspace, and reopen the record.', 'Kuna mabadiliko mapya. Funga kihariri, pakia upya, kisha fungua rekodi tena.');
    case 'stock_required': return t('In-stock models need at least one unit.', 'Modeli iliyo dukani inahitaji angalau kipande kimoja.');
    case 'stock_not_empty': return t('An out-of-stock model cannot have units remaining.', 'Modeli iliyoisha haiwezi kuwa na idadi iliyobaki.');
    case 'missing_inquiry': return t('This inquiry no longer exists. Refresh the workspace.', 'Ulizo hili halipo tena. Pakia upya.');
    case 'inquiry_limit': return t('The workspace holds up to 300 inquiries. Remove an old record you no longer need.', 'Nafasi inahifadhi maulizo 300. Ondoa rekodi ya zamani ambayo haihitajiki.');
    case 'required_fields': return t('Add a reference and describe the request.', 'Weka jina la rejea na eleza ombi.');
    case 'invalid_fields': case 'invalid_numbers': return t('Check the form. Use whole numbers for stock and price.', 'Kagua fomu. Tumia namba kamili kwa idadi na bei.');
    case 'network': return t('Could not connect. Check your connection and try again.', 'Muunganisho haukupatikana. Kagua intaneti kisha jaribu tena.');
    default: return t('The workspace couldn’t complete that request. Please try again.', 'Ombi halikukamilika. Tafadhali jaribu tena.');
  }
}
