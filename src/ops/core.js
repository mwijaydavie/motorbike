// Shared, dependency-free rules for the admin API and the isolated demo.
export const MODEL_IDS = Object.freeze({
  xpress: 'fh-125-xpress', adventure: 'fh-200-10', utility: 'fh150-7', road180: 'motorcycle-180', wanhoo: 'wanhoo-250',
});
export const AVAILABILITY = Object.freeze(['ask', 'in-stock', 'order', 'sold-out']);
export const STAGES = Object.freeze(['new', 'follow-up', 'quoted', 'won', 'closed']);
export const CHANNELS = Object.freeze(['instagram', 'walk-in', 'phone', 'other']);
export const REQUEST_TYPES = Object.freeze(['motorcycle', 'parts', 'wholesale', 'general']);
export const DEFAULT_MODEL = Object.freeze({ listed: true, units: null, priceTzs: null, availability: 'ask', updatedAt: null });

export class OpsError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}

export function emptyWorkspace() { return { revision: 0, models: {}, inquiries: [], activity: [] }; }

const ids = Object.values(MODEL_IDS);
const activityKinds = ['model', 'inquiry-added', 'inquiry-updated', 'inquiry-removed'];
const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const priceOK = value => value === null || bounded(value, 1, 999999999);
const dateOK = value => typeof value === 'string' && value.length <= 32 && Number.isFinite(Date.parse(value));
const textOK = (value, max, required = false) => typeof value === 'string' && value.length <= max && (!required || !!value.trim());
const modelOK = value => record(value) && typeof value.listed === 'boolean' && AVAILABILITY.includes(value.availability) && priceOK(value.priceTzs);
const stockOK = stock => modelOK(stock) && (stock.units === null || bounded(stock.units, 0, 99999)) &&
  (stock.updatedAt === null || dateOK(stock.updatedAt)) && (stock.availability !== 'in-stock' || stock.units > 0) &&
  (stock.availability !== 'sold-out' || !(stock.units > 0));
const inquiryOK = inquiry => record(inquiry) && textOK(inquiry.id, 80, true) && REQUEST_TYPES.includes(inquiry.type) &&
  CHANNELS.includes(inquiry.channel) && STAGES.includes(inquiry.stage) && textOK(inquiry.reference, 80, true) &&
  textOK(inquiry.request, 160, true) && textOK(inquiry.contact, 100) && textOK(inquiry.notes, 600) &&
  dateOK(inquiry.createdAt) && dateOK(inquiry.updatedAt);
const activityOK = event => record(event) && textOK(event.id, 80, true) && dateOK(event.at) && activityKinds.includes(event.kind) &&
  (event.kind === 'model' ? ids.includes(event.target) : REQUEST_TYPES.includes(event.target));

export function isWorkspace(value) {
  return record(value) && bounded(value.revision, 0, Number.MAX_SAFE_INTEGER) && record(value.models) &&
    Object.entries(value.models).every(([id, stock]) => ids.includes(id) && stockOK(stock)) &&
    Array.isArray(value.inquiries) && value.inquiries.length <= 300 && value.inquiries.every(inquiryOK) &&
    Array.isArray(value.activity) && value.activity.length <= 50 && value.activity.every(activityOK);
}

function field(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max) throw new OpsError('invalid_fields');
  const text = value.trim();
  if (required && !text) throw new OpsError('required_fields');
  return text;
}
function count(value, min, max) {
  if (value === null) return null;
  if (!bounded(value, min, max)) throw new OpsError('invalid_numbers');
  return value;
}

export function changeWorkspace(state, change, at, uid) {
  if (!change || typeof change !== 'object' || !Number.isSafeInteger(change.revision)) throw new OpsError('invalid_change');
  if (change.revision !== state.revision) throw new OpsError('conflict', 409);
  const { action, data } = change;
  const next = { ...state, revision: state.revision + 1 };
  let event;
  if (action === 'save-model') {
    const { modelId } = change;
    if (!ids.includes(modelId)) throw new OpsError('invalid_model');
    if (!data || !AVAILABILITY.includes(data.availability) || typeof data.listed !== 'boolean') throw new OpsError('invalid_fields');
    const units = count(data.units, 0, 99999);
    const priceTzs = count(data.priceTzs, 1, 999999999);
    if (data.availability === 'in-stock' && !(units > 0)) throw new OpsError('stock_required');
    if (data.availability === 'sold-out' && units > 0) throw new OpsError('stock_not_empty');
    next.models = { ...state.models, [modelId]: { listed: data.listed, availability: data.availability, units, priceTzs, updatedAt: at } };
    event = { kind: 'model', target: modelId };
  } else if (action === 'save-inquiry') {
    const previous = change.id === undefined ? undefined : state.inquiries.find(item => item.id === change.id);
    if (change.id !== undefined && !previous) throw new OpsError('missing_inquiry', 404);
    if (!previous && state.inquiries.length >= 300) throw new OpsError('inquiry_limit', 409);
    if (!data || !REQUEST_TYPES.includes(data.type) || !CHANNELS.includes(data.channel) || !STAGES.includes(data.stage)) throw new OpsError('invalid_fields');
    const inquiry = {
      id: previous?.id ?? uid(), reference: field(data.reference, 80, true),
      request: field(data.request, 160, true), contact: field(data.contact, 100), notes: field(data.notes, 600),
      type: data.type, channel: data.channel, stage: data.stage,
      createdAt: previous?.createdAt ?? at, updatedAt: at,
    };
    next.inquiries = previous ? state.inquiries.map(item => item.id === previous.id ? inquiry : item) : [inquiry, ...state.inquiries];
    event = { kind: previous ? 'inquiry-updated' : 'inquiry-added', target: inquiry.type };
  } else if (action === 'remove-inquiry') {
    const previous = state.inquiries.find(item => item.id === change.id);
    if (!previous) throw new OpsError('missing_inquiry', 404);
    next.inquiries = state.inquiries.filter(item => item.id !== previous.id);
    // Keep only the inquiry type in activity, never copy contact data or notes.
    event = { kind: 'inquiry-removed', target: previous.type };
  } else {
    throw new OpsError('invalid_change');
  }
  next.activity = [{ ...event, id: uid(), at }, ...state.activity].slice(0, 50);
  return next;
}

export function publicCatalogue(value) {
  const models = {};
  if (!record(value) || !record(value.models)) return { models };
  for (const id of ids) {
    const stock = value.models[id];
    if (!modelOK(stock)) continue;
    // Never spread private records into a public response.
    models[id] = { listed: stock.listed, availability: stock.listed ? stock.availability : 'ask', priceTzs: stock.listed ? stock.priceTzs : null };
  }
  return { models };
}

export function isOpen(inquiry) { return inquiry.stage !== 'won' && inquiry.stage !== 'closed'; }
