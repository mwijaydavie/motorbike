import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { OpsError, changeWorkspace } from '../src/ops/core.js';

const derive = promisify(scrypt);
const COOKIE = '__Host-altraware_ops';
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_BODY = 8192;
const digest = value => createHash('sha256').update(value).digest('hex');
const json = (body, status = 200, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
});

function sessionId(request) {
  const cookie = (request.headers.get('cookie') ?? '').split(';').map(item => item.trim()).find(item => item.startsWith(`${COOKIE}=`));
  const token = cookie?.slice(COOKIE.length + 1);
  return token && /^[\w-]{43}$/.test(token) ? digest(token) : null;
}
function sessionCookie(value, seconds) {
  return `${COOKIE}=${value}; Path=/; Max-Age=${seconds}; Secure; HttpOnly; SameSite=Strict`;
}
function sameOrigin(request) {
  const site = request.headers.get('sec-fetch-site');
  return (!site || site === 'same-origin') && request.headers.get('origin') === new URL(request.url).origin;
}
async function bodyOf(request) {
  if (!sameOrigin(request)) throw new OpsError('invalid_origin', 403);
  if (request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') throw new OpsError('invalid_body', 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new OpsError('request_too_large', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new OpsError('invalid_body');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let body = '';
  let size = 0;
  let data;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) throw new OpsError('request_too_large', 413);
      body += decoder.decode(value, { stream: true });
    }
    data = JSON.parse(body + decoder.decode());
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error instanceof OpsError ? error : new OpsError('invalid_body');
  } finally { reader.releaseLock(); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new OpsError('invalid_body');
  return data;
}

export async function hashPassword(password, salt = randomBytes(16)) {
  const key = await derive(password, salt, 32);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function operationsHandler(store, passwordHash) {
  const credential = /^scrypt\$([\da-f]{32})\$([\da-f]{64})$/.exec(passwordHash ?? '');
  const version = credential ? digest(passwordHash) : null;
  return async request => {
    try {
      if (request.method !== 'GET' && request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      if (!store || !credential) return json({ error: 'not_configured' }, 503);
      const id = sessionId(request);
      const data = request.method === 'POST' ? await bodyOf(request) : null;
      if (data?.action === 'login') {
        // Vercel supplies the forwarding address; hash it and retain only the short-lived counter.
        const forwarded = request.headers.get('x-vercel-forwarded-for') || 'unavailable';
        const rate = digest(forwarded.split(',')[0].trim().slice(0, 80));
        if (await store.loginAttempts(rate) > 8) return json({ error: 'rate_limited' }, 429, { 'Retry-After': '600' });
        const password = data.password;
        if (typeof password !== 'string' || !password || Buffer.byteLength(password) > 256) return json({ error: 'bad_password' }, 401);
        const entered = await derive(password, Buffer.from(credential[1], 'hex'), 32);
        if (!timingSafeEqual(entered, Buffer.from(credential[2], 'hex'))) return json({ error: 'bad_password' }, 401);
        const { state } = await store.load();
        const token = randomBytes(32).toString('base64url');
        if (id) await store.deleteSession(id);
        await store.addSession(digest(token), version, SESSION_SECONDS);
        await store.clearAttempts(rate);
        return json({ state }, 200, { 'Set-Cookie': sessionCookie(token, SESSION_SECONDS) });
      }
      if (data?.action === 'logout') {
        if (id) await store.deleteSession(id);
        return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
      }
      if (!id || await store.getSession(id) !== version) return json({ error: 'sign_in_required' }, 401);
      const { raw, state } = await store.load();
      if (!data) return json({ state });
      const updated = changeWorkspace(state, data, new Date().toISOString(), randomUUID);
      if (!await store.save(raw, updated)) return json({ error: 'conflict' }, 409);
      return json({ state: updated });
    } catch (error) {
      if (error instanceof OpsError) return json({ error: error.code }, error.status);
      return json({ error: 'service_unavailable' }, 503);
    }
  };
}

export function catalogueHandler(store) {
  return async request => {
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' });
    if (!store) return json({ models: {} });
    try {
      return json(await store.loadCatalogue());
    } catch { return json({ error: 'service_unavailable' }, 503); }
  };
}
