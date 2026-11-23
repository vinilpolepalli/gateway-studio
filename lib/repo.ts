import { desc, eq } from 'drizzle-orm';
import { getDb } from './db';
import type { Assumptions, CandidateState, TrafficEntry } from './types';

export async function loadTraffic(): Promise<TrafficEntry[]> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.traffic).orderBy(t.traffic.sortOrder)).map(({ sortOrder: _s, ...e }) => e);
}
export async function loadOwnerTraffic(owner: string): Promise<TrafficEntry[]> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.ownerTraffic).where(eq(t.ownerTraffic.ownerId, owner)).orderBy(desc(t.ownerTraffic.createdAt)))
    .map(({ ownerId: _o, createdAt: _c, ...e }) => ({ ...e, model: 'owner-added' }));
}
export async function getAssumptions(owner: string): Promise<Assumptions | null> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.ownerAssumptions).where(eq(t.ownerAssumptions.ownerId, owner)))[0]?.assumptions ?? null;
}
export async function getCandidateStates(owner: string): Promise<Record<string, CandidateState>> {
  const { orm, t } = await getDb();
  const rows = await orm.select().from(t.candidateStates).where(eq(t.candidateStates.ownerId, owner));
  const latest = new Map<string, { state: CandidateState; at: string }>();
  for (const r of rows) {
    const cur = latest.get(r.taskKey);
    if (!cur || r.updatedAt > cur.at) latest.set(r.taskKey, { state: r.state, at: r.updatedAt });
  }
  return Object.fromEntries([...latest].map(([k, v]) => [k, v.state]));
}
export async function seedNote(): Promise<string> {
  const { orm, t } = await getDb();
  return (await orm.select().from(t.kv).where(eq(t.kv.key, 'seedNote')))[0]?.value ?? '';
}
