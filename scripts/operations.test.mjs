import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { catalogueHandler, hashPassword, operationsHandler } from '../server/ops-http.mjs';
import { createStore } from '../server/ops-store.mjs';
import { MODEL_IDS, changeWorkspace, emptyWorkspace, isOpen, isWorkspace, publicCatalogue } from '../src/ops/core.js';
import { redisFixture } from './fixtures/redis-rest.mjs';

const origin = 'https://motors.example';
const password = 'example-password-for-local-tests-only';
const passwordHash = await hashPassword(password);
const at = '2026-11-18T03:00:00.000Z';
const stock = { listed: true, units: 4, priceTzs: 2375000, availability: 'in-stock' };
const inquiry = { reference: ' Test 01 ', request: 'Brake pads', type: 'parts', channel: 'instagram', stage: 'new', contact: '@demo-only', notes: 'Check if the part fits.' };
const editModel = (revision, data = stock) => ({ action: 'save-model', revision, modelId: MODEL_IDS.xpress, data });
function fixture() {
  const redis = redisFixture();
  const store = createStore(redis.env, redis.send);
  return { redis, store, operate: operationsHandler(store, passwordHash), readCatalogue: catalogueHandler(store) };
}
function api(body, headers = {}) {
  return new Request(`${origin}/api/operations`, body === undefined ? { headers } : {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'Sec-Fetch-Site': 'same-origin', ...headers }, body: JSON.stringify(body),
  });
}
async function signIn(operate, headers) {
  const response = await operate(api({ action: 'login', password }, headers));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('Set-Cookie');
  assert.match(cookie, /^__Host-altraware_ops=[\w-]+; Path=\/; Max-Age=28800; Secure; HttpOnly; SameSite=Strict$/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  return { Cookie: cookie.split(';')[0] };
}

test('production has a noindex admin shell, not a demo bundle or private data', async () => {
  const page = await readFile('dist/admin.html', 'utf8');
  assert.match(page, /name="robots" content="noindex, nofollow"/);
  assert.match(page, /<div id="ops-root"><\/div>/);
  const assets = await readdir('dist/assets');
  assert(!assets.some(file => file.startsWith('demo-')));
  for (const file of assets.filter(file => file.endsWith('.js'))) {
    const contents = await readFile(`dist/assets/${file}`, 'utf8');
    assert.doesNotMatch(contents, /Demo lead 01|OPS_REDIS_REST_TOKEN|OPS_PASSWORD_HASH|altraware-ops-demo-workspace/);
  }
});

test('model counts and amounts are validated; only safe listing fields are public', () => {
  const old = emptyWorkspace();
  const save = data => changeWorkspace(old, editModel(0, { ...stock, ...data }), at, () => 'event');
  assert.throws(() => save({ units: 0 }), { code: 'stock_required' });
  assert.throws(() => save({ units: null }), { code: 'stock_required' });
  assert.throws(() => save({ availability: 'sold-out' }), { code: 'stock_not_empty' });
  assert.throws(() => save({ priceTzs: -1 }), { code: 'invalid_numbers' });
  assert.throws(() => save({ priceTzs: 5.25 }), { code: 'invalid_numbers' });
  assert.throws(() => save({ units: 100000 }), { code: 'invalid_numbers' });
  assert.throws(() => changeWorkspace(old, { ...editModel(0), modelId: 'unknown' }, at, () => 'event'), { code: 'invalid_model' });
  const updated = save({});
  assert.equal(updated.revision, 1);
  assert.equal(Object.keys(old.models).length, 0);
  assert(isWorkspace(updated));
  assert(!isWorkspace({ ...updated, inquiries: [null] }));
  assert.deepEqual(publicCatalogue(updated), { models: { [MODEL_IDS.xpress]: { listed: true, priceTzs: 2375000, availability: 'in-stock' } } });
  assert.deepEqual(publicCatalogue(save({ listed: false })), { models: { [MODEL_IDS.xpress]: { listed: false, priceTzs: null, availability: 'ask' } } });
  assert.deepEqual(publicCatalogue({ models: { [MODEL_IDS.xpress]: { ...stock, priceTzs: 'unknown' }, notAModel: stock } }), { models: {} });
});

test('manual inquiry stages and removal are tracked without copying personal fields into activity', () => {
  let id = 0;
  const uid = () => `fixture-${++id}`;
  const empty = emptyWorkspace();
  const change = { action: 'save-inquiry', revision: 0, data: inquiry };
  assert.throws(() => changeWorkspace(empty, { ...change, data: { ...inquiry, reference: '  ' } }, at, uid), { code: 'required_fields' });
  const first = changeWorkspace(empty, change, at, uid);
  assert.equal(first.inquiries[0].reference, 'Test 01');
  assert(isOpen(first.inquiries[0]));
  const next = changeWorkspace(first, { ...change, revision: 1, id: first.inquiries[0].id, data: { ...inquiry, stage: 'won' } }, '2026-11-19T03:00:00.000Z', uid);
  assert.equal(next.inquiries[0].createdAt, at);
  assert(!isOpen(next.inquiries[0]));
  const last = changeWorkspace(next, { action: 'remove-inquiry', revision: 2, id: next.inquiries[0].id }, at, uid);
  assert.deepEqual(last.inquiries, []);
  assert.deepEqual(last.activity.map(({ kind, target }) => [kind, target]), [['inquiry-removed', 'parts'], ['inquiry-updated', 'parts'], ['inquiry-added', 'parts']]);
  assert.doesNotMatch(JSON.stringify(last), /Check if|demo-only|Test 01/);
});

test('server gate denies unauthenticated reads and saves; missing config does not fall back to demo', async () => {
  const { operate, readCatalogue, redis } = fixture();
  for (const request of [api(), api(editModel(0))]) {
    const response = await operate(request);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'sign_in_required' });
  }
  assert.equal(redis.commands.length, 0);
  const unconfigured = await operationsHandler(null, '')(api());
  assert.equal(unconfigured.status, 503);
  assert.deepEqual(await unconfigured.json(), { error: 'not_configured' });
  const invalidEndpoint = createStore({ ...redis.env, OPS_REDIS_REST_URL: 'http://fixture.invalid' }, redis.send);
  assert.equal(invalidEndpoint, null);
  const response = await readCatalogue(new Request(`${origin}/api/catalogue`));
  assert.deepEqual(await response.json(), { models: {} });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await readCatalogue(new Request(`${origin}/api/catalogue`, { method: 'POST' }))).status, 405);
});

test('operations checks same origin, bounded JSON reads and rate limits sign-in attempts', async () => {
  const { redis, operate } = fixture();
  const change = { action: 'login', password };
  assert.equal((await operate(api(change, { Origin: 'https://other.example', 'Sec-Fetch-Site': 'cross-site' }))).status, 403);
  assert.equal((await operate(api(change, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await operate(api({ ...change, password: 'x'.repeat(9000) }))).status, 413);
  assert.equal(redis.commands.length, 0);
  const ip = { 'x-vercel-forwarded-for': '192.0.2.1' };
  for (let i = 0; i < 8; i++) {
    const response = await operate(api({ ...change, password: '' }, ip));
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'bad_password' });
  }
  const limited = await operate(api(change, ip));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('Retry-After'), '600');
  redis.advance(601);
  await signIn(operate, ip);
});

test('writes survive new handler instances, stale or concurrent saves do not overwrite, and catalogue never reads the private record', async () => {
  const { redis, operate, readCatalogue } = fixture();
  const headers = await signIn(operate);
  const response = await operate(api(editModel(0), headers));
  assert.equal(response.status, 200);
  const pair = await Promise.all([
    operate(api({ action: 'save-inquiry', revision: 1, data: inquiry }, headers)),
    operate(api({ action: 'save-inquiry', revision: 1, data: { ...inquiry, reference: 'Test 02' } }, headers)),
  ]);
  assert.deepEqual(pair.map(item => item.status).sort(), [200, 409]);
  const stale = await operate(api(editModel(0, { ...stock, units: 2 }), headers));
  assert.deepEqual(await stale.json(), { error: 'conflict' });
  const later = operationsHandler(createStore(redis.env, redis.send), passwordHash);
  const stored = (await (await later(api(undefined, headers))).json()).state;
  assert.equal(stored.revision, 2);
  assert.equal(stored.inquiries.length, 1);
  assert.equal(stored.models[MODEL_IDS.xpress].units, 4);
  redis.commands.length = 0;
  const published = await (await readCatalogue(new Request(`${origin}/api/catalogue`, { headers }))).json();
  assert.deepEqual(published, { models: { [MODEL_IDS.xpress]: { listed: true, availability: 'in-stock', priceTzs: 2375000 } } });
  assert.equal(redis.commands.length, 1);
  assert.match(redis.commands[0][1], /:catalogue$/);
  const hidden = await later(api(editModel(2, { ...stock, listed: false }), headers));
  assert.equal(hidden.status, 200);
  assert.deepEqual(await (await readCatalogue(new Request(`${origin}/api/catalogue`))).json(), { models: { [MODEL_IDS.xpress]: { listed: false, availability: 'ask', priceTzs: null } } });
  const otherStore = createStore({ ...redis.env, VERCEL_ENV: 'production' }, redis.send);
  assert.deepEqual((await otherStore.load()).state, emptyWorkspace());
  assert.deepEqual(await otherStore.loadCatalogue(), { models: {} });
});

test('logout, expiry, and changing the password hash revoke existing access', async () => {
  const { redis, store, operate } = fixture();
  const headers = await signIn(operate);
  const rotated = operationsHandler(store, await hashPassword('different-fixture-password'));
  assert.equal((await rotated(api(undefined, headers))).status, 401);
  const logout = await operate(api({ action: 'logout' }, headers));
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal((await operate(api(undefined, headers))).status, 401);
  const second = await signIn(operate);
  redis.advance(28801);
  assert.equal((await operate(api(undefined, second))).status, 401);
});
