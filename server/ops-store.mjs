import { emptyWorkspace, isWorkspace, publicCatalogue } from '../src/ops/core.js';

const replace = `
local current = redis.call('GET', KEYS[1]) or ''
if current ~= ARGV[1] then return 0 end
redis.call('MSET', KEYS[1], ARGV[2], KEYS[2], ARGV[3])
return 1`;
const increment = `
local attempt = redis.call('INCR', KEYS[1])
if attempt == 1 then redis.call('EXPIRE', KEYS[1], 600) end
return attempt`;

export function createStore(env = process.env, send = fetch) {
  const secret = env.OPS_REDIS_REST_TOKEN;
  if (!secret || !env.OPS_REDIS_REST_URL) return null;
  let endpoint;
  try { endpoint = new URL(env.OPS_REDIS_REST_URL); } catch { return null; }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return null;
  const environment = (env.VERCEL_TARGET_ENV || env.VERCEL_ENV || 'local').replace(/[^a-z0-9_-]/gi, '_');
  const prefix = `altraware:ops:{v1:${environment}}`;
  const workspaceKey = `${prefix}:workspace`;
  const catalogueKey = `${prefix}:catalogue`;
  const sessionKey = id => `${prefix}:session:${id}`;
  const rateKey = id => `${prefix}:rate:${id}`;

  async function run(...command) {
    const response = await send(endpoint.href, {
      method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command), cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('store_unavailable');
    const result = await response.json();
    if (!result || result.error || !Object.hasOwn(result, 'result')) throw new Error('store_unavailable');
    return result.result;
  }

  return {
    async load() {
      const raw = await run('GET', workspaceKey);
      const state = raw === null ? emptyWorkspace() : JSON.parse(raw);
      if (!isWorkspace(state)) throw new Error('invalid_workspace');
      return { raw: raw ?? '', state };
    },
    async loadCatalogue() {
      const raw = await run('GET', catalogueKey);
      return raw === null ? { models: {} } : publicCatalogue(JSON.parse(raw));
    },
    async save(previous, state) {
      return (await run('EVAL', replace, 2, workspaceKey, catalogueKey, previous, JSON.stringify(state), JSON.stringify(publicCatalogue(state)))) === 1;
    },
    async addSession(id, version, seconds) { await run('SET', sessionKey(id), version, 'EX', seconds); },
    async getSession(id) { return run('GET', sessionKey(id)); },
    async deleteSession(id) { await run('DEL', sessionKey(id)); },
    async loginAttempts(id) { return run('EVAL', increment, 1, rateKey(id)); },
    async clearAttempts(id) { await run('DEL', rateKey(id)); },
  };
}
