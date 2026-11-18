import { createStore } from '../server/ops-store.mjs';
import { operationsHandler } from '../server/ops-http.mjs';

export default { fetch: operationsHandler(createStore(), process.env.OPS_PASSWORD_HASH) };
