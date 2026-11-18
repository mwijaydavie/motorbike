import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Box, ChevronRight, FlaskConical, Globe2, LayoutDashboard, LockKeyhole, LogOut, MapPin, MessageSquare, Plus, RefreshCcw, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Bike, Language } from '../content';
import type { Locale } from '../components/Primitives';
import { readWorkspace, restoreDemo, signIn, signOut, writeWorkspace } from './client';
import { DEFAULT_MODEL } from './core.js';
import type { Inquiry, Mutation, Workspace } from './core.js';
import { InquiryEditor, ModelEditor } from './Editors';
import { displayDate } from './labels';
import { DEMO_MODE } from './mode';
import { Overview } from './Overview';
import { InquiryRegister, Inventory } from './Registers';
import { EditorDialog, OpsLogo, Pill, StoreLink, errorCode, errorMessage } from './ui';

const nav = [
  { key: 'overview', icon: LayoutDashboard, en: 'Overview', sw: 'Muhtasari' },
  { key: 'inventory', icon: Box, en: 'Inventory', sw: 'Stock' },
  { key: 'inquiries', icon: MessageSquare, en: 'Inquiries', sw: 'Maulizo' },
] as const;
type View = typeof nav[number]['key'];
type Gate = 'loading' | 'locked' | 'setup' | 'unavailable' | 'ready';
type Editor = { kind: 'model'; bike: Bike; revision: number } | { kind: 'inquiry'; inquiry?: Inquiry; revision: number } | { kind: 'reset' };
type Notice = { state: 'saved' | 'reset' | 'refreshed' | 'error'; code?: string };
const languageKey = 'altraware-language';
function route(): View { const name = new URLSearchParams(window.location.search).get('view'); return nav.find(item => item.key === name)?.key ?? 'overview'; }
function storedLanguage(): Language { try { return window.localStorage.getItem(languageKey) === 'sw' ? 'sw' : 'en'; } catch { return 'en'; } }

function LanguageButton({ lang, t, change }: Locale & { change: () => void }) {
  const label = t('EN / SW — Switch to Kiswahili', 'SW / EN — Change language to English');
  return <button className="ops-language" type="button" aria-label={label} onClick={change}><Globe2 size={16} aria-hidden="true" /><strong>{lang.toUpperCase()}</strong><span aria-hidden="true">/ {lang === 'en' ? 'SW' : 'EN'}</span></button>;
}

export function Operations() {
  const [view, setView] = useState<View>(route);
  const [lang, setLang] = useState<Language>(storedLanguage);
  const [gate, setGate] = useState<Gate>('loading');
  const [state, setState] = useState<Workspace | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const t: Locale['t'] = (en, sw) => lang === 'en' ? en : sw;
  const locale = { lang, t };
  function switchLanguage() {
    const next = lang === 'en' ? 'sw' : 'en';
    setLang(next);
    try { window.localStorage.setItem(languageKey, next); } catch { /* current selection still works */ }
  }
  useLayoutEffect(() => { document.documentElement.lang = lang; document.title = t('Altraware Motors — Operations', 'Altraware Motors — Usimamizi'); }, [lang]);
  useEffect(() => {
    const navigate = () => setView(route());
    function restore(event: PageTransitionEvent) {
      // Re-check private access after returning to a cached document.
      if (!DEMO_MODE && event.persisted) window.location.reload();
    }
    window.addEventListener('popstate', navigate);
    window.addEventListener('pageshow', restore);
    return () => {
      window.removeEventListener('popstate', navigate);
      window.removeEventListener('pageshow', restore);
    };
  }, []);
  useEffect(() => {
    let alive = true;
    void readWorkspace().then(result => { if (alive) { setState(result); setGate('ready'); } }).catch(error => { if (alive) failGate(error); });
    return () => { alive = false; };
  }, []);
  function failGate(error: unknown) {
    const code = errorCode(error);
    setState(null);
    setEditor(null);
    setGate(code === 'sign_in_required' ? 'locked' : code === 'not_configured' ? 'setup' : 'unavailable');
  }
  function navigate(next: View) {
    if (view === next) return;
    const url = new URL(window.location.href);
    if (next === 'overview') url.searchParams.delete('view');
    else url.searchParams.set('view', next);
    window.history.pushState(null, '', url);
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  async function reload() {
    if (refreshing) return;
    setRefreshing(true);
    try { setState(await readWorkspace()); setGate('ready'); setNotice({ state: 'refreshed' }); }
    catch (error) {
      if (!state || errorCode(error) === 'sign_in_required') failGate(error);
      else setNotice({ state: 'error', code: errorCode(error) });
    } finally { setRefreshing(false); }
  }
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try { await signOut(); setState(null); setNotice(null); setEditor(null); setGate('locked'); }
    catch (error) { setNotice({ state: 'error', code: errorCode(error) }); }
    finally { setLoggingOut(false); }
  }
  async function mutate(change: Mutation) {
    if (!editor || editor.kind === 'reset') return;
    try {
      const next = await writeWorkspace(change, editor.revision);
      setState(next);
      setEditor(null);
      setNotice({ state: 'saved' });
    } catch (error) { if (errorCode(error) === 'sign_in_required') failGate(error); throw error; }
  }
  async function reset() {
    setResetting(true);
    setResetError('');
    try { setState(await restoreDemo()); setNotice({ state: 'reset' }); setEditor(null); }
    catch (error) { setResetError(errorCode(error)); }
    finally { setResetting(false); }
  }
  async function login(password: string) {
    setState(await signIn(password));
    setNotice(null);
    setGate('ready');
  }

  if (!state || gate !== 'ready') return <Login gate={gate} loading={refreshing} retry={reload} login={login} changeLanguage={switchLanguage} {...locale} />;

  const newInquiry = () => setEditor({ kind: 'inquiry', revision: state.revision });
  const editInquiry = (inquiry: Inquiry) => setEditor({ kind: 'inquiry', inquiry, revision: state.revision });
  const info = view === 'overview' ? {
    title: t('Operations dashboard', 'Dashibodi ya usimamizi'), note: t('Keep an eye on inventory and the next customer follow-up.', 'Fuatilia stock na maulizo yanayohitaji jibu.'),
  } : view === 'inventory' ? {
    title: t('Manage inventory', 'Simamia stock'), note: t('Review model listings and keep availability up to date.', 'Kagua matangazo ya modeli na sasisha upatikanaji.'),
  } : { title: t('Customer inquiries', 'Maulizo ya wateja'), note: t('Track requests from the first message to the final outcome.', 'Fuatilia maulizo kuanzia ujumbe wa kwanza hadi yanapokamilika.') };
  const label = nav.find(item => item.key === view)?.[lang];
  const status = notice?.state === 'error' ? errorMessage(notice.code ?? '', t) : notice?.state === 'saved' ? t('Changes saved.', 'Mabadiliko yamehifadhiwa.') : notice?.state === 'reset' ? t('Demo restored to its sample data.', 'Mfano umerudishwa kwenye data yake ya awali.') : notice?.state === 'refreshed' ? t('Workspace refreshed.', 'Nafasi imesasishwa.') : '';
  return <div className="ops-shell">
    <a className="ops-skip" href="#ops-main">{t('Skip to workspace', 'Ruka hadi usimamizi')}</a>
    <aside className="ops-sidebar" aria-label={t('Operations navigation', 'Menyu ya usimamizi')}>
      <a className="ops-brand" href="/admin"><OpsLogo /></a>
      <div className="ops-location"><MapPin size={17} aria-hidden="true" /><span><strong>Kigamboni</strong><small>Dar es Salaam, TZ</small></span></div>
      <div className="ops-nav-wrap"><span className="ops-kicker">{t('Workspace', 'Nafasi ya kazi')}</span><nav className="ops-nav" aria-label={t('Admin sections', 'Sehemu za usimamizi')}>
        {nav.map(({ key, icon: Icon, en, sw }) => <button key={key} type="button" onClick={() => navigate(key)} aria-current={view === key ? 'page' : undefined}><Icon size={18} strokeWidth={1.85} aria-hidden="true" /><span>{t(en, sw)}</span>{view === key && <ChevronRight className="ops-active-arrow" size={15} aria-hidden="true" />}</button>)}
      </nav></div>
      <div className="ops-side-foot">
        <div className="ops-side-mode">{DEMO_MODE ? <FlaskConical size={19} aria-hidden="true" /> : <ShieldCheck size={19} aria-hidden="true" />}<div><strong>{DEMO_MODE ? t('Demo workspace', 'Nafasi ya mfano') : t('Private workspace', 'Nafasi binafsi')}</strong><small>{DEMO_MODE ? t('Sample data • this browser', 'Data ya mfano • kivinjari hiki') : t('Signed-in staff only', 'Kwa walioingia tu')}</small></div></div>
        <a href="/" target="_blank" rel="noreferrer" className="ops-side-action"><ArrowUpRight size={16} aria-hidden="true" />{t('Open storefront', 'Fungua tovuti')}</a>
        {DEMO_MODE ? <button type="button" className="ops-side-action" onClick={() => { setResetError(''); setEditor({ kind: 'reset' }); }}><RotateCcw size={15} aria-hidden="true" />{t('Reset demo', 'Rudisha mfano')}</button> : <button type="button" className="ops-side-action" onClick={logout} disabled={loggingOut}><LogOut size={16} aria-hidden="true" />{t('Sign out', 'Toka')}</button>}
      </div>
    </aside>
    <div className="ops-workspace">
      <header className="ops-topbar">
        <div className="ops-crumbs"><span>{t('Operations', 'Usimamizi')}</span><ChevronRight size={14} aria-hidden="true" /><strong>{label}</strong></div>
        <div className="ops-top-actions"><Pill tone={DEMO_MODE ? 'demo' : 'green'}>{DEMO_MODE ? t('Demo mode', 'Hali ya mfano') : t('Private access', 'Ufikiaji binafsi')}</Pill><LanguageButton change={switchLanguage} {...locale} /><StoreLink t={t} />
          {!DEMO_MODE && <button className="ops-icon-button ops-mobile-exit" type="button" aria-label={t('Sign out', 'Toka')} onClick={logout} disabled={loggingOut}><LogOut size={17} aria-hidden="true" /></button>}
        </div>
      </header>
      <main id="ops-main" tabIndex={-1} className="ops-main">
        <div className="ops-heading"><div><span className="ops-kicker ops-heading-kicker"><i aria-hidden="true" />{t('Altraware / Management desk', 'Altraware / Dawati la usimamizi')}</span><h1 ref={heading} tabIndex={-1}>{info.title}</h1><p>{info.note}</p></div>
          <div className="ops-heading-actions"><span className="ops-today">{displayDate(Date.now(), lang, { day: 'numeric', month: 'short', year: 'numeric' })}</span><button className="ops-icon-button" type="button" aria-label={t('Refresh workspace', 'Sasisha nafasi ya kazi')} title={t('Refresh workspace', 'Sasisha nafasi ya kazi')} disabled={refreshing} onClick={reload}><RefreshCcw size={16} aria-hidden="true" /></button><button type="button" className="ops-button ops-button-primary" onClick={newInquiry}><Plus size={19} strokeWidth={2.1} aria-hidden="true" />{t('New inquiry', 'Ulizo jipya')}</button></div>
        </div>
        {DEMO_MODE && <div className="ops-demo-notice"><FlaskConical size={17} aria-hidden="true" /><p><strong>{t('Try the workspace.', 'Jaribu nafasi hii.')}</strong> {t('Sample data and changes are saved only in this browser. Don’t enter real customer details.', 'Data ya mfano na mabadiliko yanahifadhiwa kwenye kivinjari hiki tu. Usiweke taarifa halisi za wateja.')}</p><button type="button" onClick={() => { setResetError(''); setEditor({ kind: 'reset' }); }} className="ops-demo-reset">{t('Reset', 'Rudisha')}</button></div>}
        <div className={status ? 'ops-inline-status' : 'ops-sr'} data-error={notice?.state === 'error'} role="status">{status}</div>
        {view === 'overview' && <Overview state={state} openView={navigate} newInquiry={newInquiry} editInquiry={editInquiry} {...locale} />}
        {view === 'inventory' && <Inventory state={state} edit={bike => setEditor({ kind: 'model', bike, revision: state.revision })} {...locale} />}
        {view === 'inquiries' && <InquiryRegister state={state} edit={editInquiry} {...locale} />}
        <footer className="ops-main-footer"><span>ALTRAWARE MOTORS / KIGAMBONI</span><span>{t('Operations workspace', 'Nafasi ya usimamizi')}</span></footer>
      </main>
    </div>
    {editor?.kind === 'model' && <ModelEditor bike={editor.bike} stock={state.models[editor.bike.id] ?? DEFAULT_MODEL} close={() => setEditor(null)} save={mutate} {...locale} />}
    {editor?.kind === 'inquiry' && <InquiryEditor inquiry={editor.inquiry} close={() => setEditor(null)} save={mutate} {...locale} />}
    {editor?.kind === 'reset' && <EditorDialog title={t('Reset sample data?', 'Rudisha data ya mfano?')} note={t('Your changes in this browser will be cleared. This will not change the live store.', 'Mabadiliko ya kivinjari hiki yatafutwa. Tovuti halisi haitabadilika.')} close={() => setEditor(null)} busy={resetting} t={t}>
      {resetError && <p className="ops-form-error" role="alert">{errorMessage(resetError, t)}</p>}<div className="ops-dialog-actions"><button type="button" className="ops-link" disabled={resetting} onClick={() => setEditor(null)}>{t('Cancel', 'Ghairi')}</button><button type="button" className="ops-button ops-button-primary" onClick={reset} disabled={resetting}><RotateCcw size={16} aria-hidden="true" />{t('Reset demo', 'Rudisha mfano')}</button></div>
    </EditorDialog>}
  </div>;
}

function Login({ gate, loading, retry, login, changeLanguage, lang, t }: Locale & { gate: Gate; loading: boolean; retry: () => void; login: (password: string) => Promise<void>; changeLanguage: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try { await login(password); }
    catch (e) { setError(errorCode(e)); }
    finally { setPassword(''); setBusy(false); }
  }
  const title = gate === 'loading' ? t('Opening workspace…', 'Inafungua usimamizi…') : gate === 'setup' ? t('Setup required', 'Usanidi unahitajika') : gate === 'unavailable' ? t('Workspace unavailable', 'Usimamizi haupatikani') : t('Staff sign-in', 'Ingia kama mhudumu');
  return <div className="ops-gate"><aside className="ops-gate-art"><OpsLogo /><div><span className="ops-kicker">ALTRAWARE / DSM</span><strong>{t('The shop behind the ride.', 'Duka nyuma ya safari.')}</strong><p>{t('Inventory. Inquiries. One workspace.', 'Stock. Maulizo. Sehemu moja ya usimamizi.')}</p></div></aside><main className="ops-gate-main"><div className="ops-gate-top"><LanguageButton lang={lang} t={t} change={changeLanguage} /><StoreLink t={t} /></div>
    <div className="ops-gate-card"><span className="ops-stat-icon" data-tone="lime"><LockKeyhole size={19} aria-hidden="true" /></span><h1>{title}</h1>
    {gate === 'locked' ? <><p>{t('Enter the operations password to access store records.', 'Weka nenosiri la usimamizi ili kufungua rekodi za duka.')}</p><form className="ops-login-form" onSubmit={submit}><label>{t('Admin password', 'Nenosiri la usimamizi')}<input type="password" autoComplete="current-password" maxLength={256} required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="ops-form-error" role="alert">{errorMessage(error, t)}</p>}<button type="submit" className="ops-button ops-button-primary" disabled={busy}>{busy ? t('Signing in…', 'Inaingia…') : t('Sign in', 'Ingia')} <ArrowRight size={16} aria-hidden="true" /></button></form></> : gate === 'loading' ? <p role="status">{t('Checking access…', 'Inakagua ufikiaji…')}</p> : <><p>{gate === 'setup' ? t('The storefront is available. The owner needs to configure private access and storage before staff can sign in.', 'Tovuti ya wateja inapatikana. Mmiliki anahitaji kuweka ufikiaji binafsi na hifadhi kabla ya timu kuingia.') : t('We couldn’t reach the private workspace. Please try again.', 'Hatukuweza kufikia usimamizi binafsi. Tafadhali jaribu tena.')}</p><button type="button" className="ops-button ops-button-outline" onClick={retry} disabled={loading}><RefreshCcw size={16} aria-hidden="true" />{loading ? t('Checking…', 'Inakagua…') : t('Try again', 'Jaribu tena')}</button></>}
    </div></main></div>;
}
