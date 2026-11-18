// In-process model of the small Redis REST command set used by operations.
// No cloud calls or credentials are needed for tests.
import assert from 'node:assert/strict';

export function redisFixture() {
  const entries = new Map();
  const commands = [];
  let time = 0;
  function read(key) {
    const entry = entries.get(key);
    if (!entry || entry.expiresAt <= time) { entries.delete(key); return null; }
    return entry.value;
  }
  function write(key, value, ttl = Infinity) { entries.set(key, { value, expiresAt: time + ttl }); }
  return {
    commands,
    env: { OPS_REDIS_REST_URL: 'https://fixture.invalid', OPS_REDIS_REST_TOKEN: 'unused-test-token', VERCEL_ENV: 'preview' },
    advance(seconds) { time += seconds; },
    async send(url, init) {
      assert.equal(url, 'https://fixture.invalid/');
      assert.equal(init.headers.Authorization, 'Bearer unused-test-token');
      const [command, ...args] = JSON.parse(init.body);
      commands.push([command, ...args]);
      let result;
      if (command === 'GET') result = read(args[0]);
      else if (command === 'SET') { write(args[0], args[1], args[3]); result = 'OK'; }
      else if (command === 'DEL') result = Number(entries.delete(args[0]));
      else if (command === 'EVAL') {
        const [script, keyCount, key, ...rest] = args;
        if (keyCount === 2 && script.includes("redis.call('MSET'")) {
          const [publicKey, previous, state, catalogue] = rest;
          result = Number((read(key) ?? '') === previous);
          if (result) { write(key, state); write(publicKey, catalogue); }
        } else if (keyCount === 1 && script.includes("redis.call('INCR'")) {
          const before = read(key);
          result = (before ?? 0) + 1;
          write(key, result, before === null ? 600 : entries.get(key).expiresAt - time);
        } else throw new Error('Unexpected script in fixture');
      } else throw new Error(`Unexpected command: ${command}`);
      return Response.json({ result });
    },
  };
}
