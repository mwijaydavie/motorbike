export const MODEL_IDS: Readonly<{ xpress: 'fh-125-xpress'; adventure: 'fh-200-10'; utility: 'fh150-7'; road180: 'motorcycle-180'; wanhoo: 'wanhoo-250' }>;
export type ModelId = typeof MODEL_IDS[keyof typeof MODEL_IDS];
export const AVAILABILITY: readonly ['ask', 'in-stock', 'order', 'sold-out'];
export type Availability = typeof AVAILABILITY[number];
export const STAGES: readonly ['new', 'follow-up', 'quoted', 'won', 'closed'];
export type Stage = typeof STAGES[number];
export const CHANNELS: readonly ['instagram', 'walk-in', 'phone', 'other'];
export type Channel = typeof CHANNELS[number];
export const REQUEST_TYPES: readonly ['motorcycle', 'parts', 'wholesale', 'general'];
export type RequestType = typeof REQUEST_TYPES[number];
export interface PublicModel { listed: boolean; priceTzs: number | null; availability: Availability }
export type PublicCatalogue = { models: Record<string, PublicModel | undefined> };
export interface ModelInput extends PublicModel { units: number | null }
export interface StockRecord extends ModelInput { updatedAt: string | null }
export const DEFAULT_MODEL: Readonly<StockRecord>;
export interface InquiryInput { reference: string; request: string; contact: string; notes: string; type: RequestType; channel: Channel; stage: Stage }
export interface Inquiry extends InquiryInput { id: string; createdAt: string; updatedAt: string }
export interface Activity { id: string; at: string; kind: 'model' | 'inquiry-added' | 'inquiry-updated' | 'inquiry-removed'; target: string }
export interface Workspace { revision: number; models: Record<string, StockRecord | undefined>; inquiries: Inquiry[]; activity: Activity[] }
export type Mutation = { action: 'save-model'; modelId: string; data: ModelInput } | { action: 'save-inquiry'; id?: string; data: InquiryInput } | { action: 'remove-inquiry'; id: string };
export class OpsError extends Error { code: string; status: number; constructor(code: string, status?: number) }
export function emptyWorkspace(): Workspace;
export function isWorkspace(value: unknown): value is Workspace;
export function changeWorkspace(state: Workspace, change: Mutation & { revision: number }, at: string, uid: () => string): Workspace;
export function publicCatalogue(value: unknown): PublicCatalogue;
export function isOpen(inquiry: Inquiry): boolean;
