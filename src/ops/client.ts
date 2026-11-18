import { OpsError, isWorkspace } from './core.js';
import type { Mutation, Workspace } from './core.js';

export async function readWorkspace(): Promise<Workspace> {
  if (import.meta.env.MODE === 'ops-demo') return (await import('./demo')).loadDemo();
  return workspaceRequest();
}
export async function writeWorkspace(change: Mutation, revision: number): Promise<Workspace> {
  if (import.meta.env.MODE === 'ops-demo') return (await import('./demo')).updateDemo({ ...change, revision });
  return workspaceRequest({ ...change, revision });
}
export async function signIn(password: string) { return workspaceRequest({ action: 'login', password }); }
export async function signOut() { await request({ action: 'logout' }); }
export async function restoreDemo() {
  if (import.meta.env.MODE === 'ops-demo') return (await import('./demo')).resetDemo();
  throw new OpsError('not_configured');
}

async function request(body?: object) {
  let response: Response;
  try {
    response = await fetch('/api/operations', {
      method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
      ...(body && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch { throw new OpsError('network'); }
  if (response.status === 404 && !body) throw new OpsError('not_configured', 503);
  let data;
  try { data = await response.json(); } catch { throw new OpsError('service_unavailable', 503); }
  if (!response.ok) throw new OpsError(typeof data?.error === 'string' ? data.error : 'service_unavailable', response.status);
  return data;
}
async function workspaceRequest(body?: object): Promise<Workspace> {
  const data = await request(body);
  if (!isWorkspace(data?.state)) throw new OpsError('service_unavailable', 503);
  return data.state;
}
