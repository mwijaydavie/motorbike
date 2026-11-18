import { text } from '../content';
import type { Language } from '../content';
import type { Availability, Channel, RequestType, Stage } from './core.js';

export const availabilityLabels: Record<Availability, ReturnType<typeof text>> = {
  ask: text('Confirm availability', 'Thibitisha upatikanaji'), 'in-stock': text('In stock', 'Ipo dukani'),
  order: text('By order', 'Kwa oda'), 'sold-out': text('Out of stock', 'Imeisha'),
};
export const stageLabels: Record<Stage, ReturnType<typeof text>> = {
  new: text('New', 'Jipya'), 'follow-up': text('Follow-up', 'Fuatilia'), quoted: text('Quoted', 'Bei imetumwa'),
  won: text('Completed', 'Limekamilika'), closed: text('Closed', 'Limefungwa'),
};
export const channelLabels: Record<Channel, ReturnType<typeof text>> = {
  instagram: text('Instagram', 'Instagram'), 'walk-in': text('Walk-in', 'Dukani'), phone: text('Phone', 'Simu'), other: text('Other', 'Nyingine'),
};
export const requestLabels: Record<RequestType, ReturnType<typeof text>> = {
  motorcycle: text('Motorcycle', 'Pikipiki'), parts: text('Spare parts', 'Vipuri'), wholesale: text('Wholesale', 'Jumla'), general: text('General', 'Ulizo la jumla'),
};
export const money = (value: number) => `TSh ${new Intl.NumberFormat('en-TZ').format(value)}`;
export function displayDate(value: string | number, lang: Language, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(lang === 'sw' ? 'sw-TZ' : 'en-TZ', { timeZone: 'Africa/Dar_es_Salaam', ...options }).format(new Date(value));
}
const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Dar_es_Salaam', day: '2-digit', month: '2-digit', year: 'numeric' });
export const tzDay = (value: number | string) => dateKey.format(new Date(value));
