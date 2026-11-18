import { MODEL_IDS, OpsError, changeWorkspace, isWorkspace } from './core.js';
import type { Activity, Channel, Inquiry, Mutation, RequestType, Stage, Workspace } from './core.js';

export const DEMO_STORAGE_KEY = 'altraware-ops-demo-workspace-v1';
const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ago = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

function demoWorkspace(): Workspace {
  const examples: [string, string, RequestType, Channel, Stage, number][] = [
    ['Demo lead 01', 'FH 125 Xpress · city riding', 'motorcycle', 'instagram', 'new', 0],
    ['Demo lead 02', 'Chain and sprocket kit', 'parts', 'walk-in', 'follow-up', .25],
    ['Demo lead 03', 'Six bikes for a delivery team', 'wholesale', 'instagram', 'quoted', 1.1],
    ['Demo lead 04', 'FH-200-10 · availability', 'motorcycle', 'phone', 'quoted', 1.3],
    ['Demo lead 05', 'Headlight for an Xpress', 'parts', 'instagram', 'new', 2],
    ['Demo lead 06', 'Brake pads · fitment check', 'parts', 'walk-in', 'won', 3.1],
    ['Demo lead 07', 'Compare the 180 cc and 250 cc', 'motorcycle', 'instagram', 'closed', 4],
    ['Demo lead 08', 'Workshop stock inquiry', 'wholesale', 'phone', 'won', 6],
    ['Demo lead 09', 'Request a Wanhoo listing', 'motorcycle', 'other', 'closed', 8],
  ];
  const inquiries: Inquiry[] = examples.map(([reference, request, type, channel, stage, days], i) => ({
    id: `demo-inquiry-${i + 1}`, reference, request, type, channel, stage, contact: '', notes: '', createdAt: ago(days), updatedAt: ago(days),
  }));
  const activity: Activity[] = [
    { id: 'demo-activity-1', kind: 'inquiry-added', target: 'motorcycle', at: ago(0) },
    { id: 'demo-activity-2', kind: 'model', target: MODEL_IDS.xpress, at: ago(.12) },
    { id: 'demo-activity-3', kind: 'inquiry-updated', target: 'parts', at: ago(.25) },
  ];
  return { revision: 0, models: {
    [MODEL_IDS.xpress]: { units: 6, listed: true, priceTzs: 2350000, availability: 'in-stock', updatedAt: ago(.12) },
    [MODEL_IDS.adventure]: { units: 3, listed: true, priceTzs: null, availability: 'in-stock', updatedAt: ago(1) },
    [MODEL_IDS.utility]: { units: null, listed: true, priceTzs: null, availability: 'order', updatedAt: ago(2) },
    [MODEL_IDS.road180]: { units: 0, listed: true, priceTzs: null, availability: 'sold-out', updatedAt: ago(2) },
  }, inquiries, activity };
}

export function loadDemo(): Workspace {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const state: unknown = JSON.parse(raw);
      if (isWorkspace(state)) return state;
    }
  } catch { /* first view is still useful if browser storage is blocked */ }
  return demoWorkspace();
}
export function updateDemo(change: Mutation & { revision: number }): Workspace {
  const next = changeWorkspace(loadDemo(), change, new Date().toISOString(), uid);
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
  } catch { throw new OpsError('storage_blocked'); }
  return next;
}
export function resetDemo() {
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch { throw new OpsError('storage_blocked'); }
  return loadDemo();
}
