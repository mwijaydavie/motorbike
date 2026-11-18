import { createStore } from '../server/ops-store.mjs';
import { catalogueHandler } from '../server/ops-http.mjs';

export default { fetch: catalogueHandler(createStore()) };
