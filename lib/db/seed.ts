import { sql } from 'drizzle-orm';
import trafficJson from '../../data/traffic.json';
import type { Db } from './index';

export async function seedIfEmpty(db: Db) {
  await db.tx(async (c) => {
    if (c.kind === 'postgres') await (c.orm as unknown as { execute(q: unknown): Promise<unknown> }).execute(sql`SELECT pg_advisory_xact_lock(7316401)`);
    const existing = await c.orm.select({ id: c.t.traffic.id }).from(c.t.traffic).limit(1);
    if (existing.length) return;
    const rows = trafficJson as { note: string; entries: { id: string; task: string; model: string; requestsPerDay: number; avgTokens: number; costPer1k: number; variance: 'low' | 'medium' | 'high'; example: string }[] };
    for (const [i, e] of rows.entries.entries()) {
      await c.orm.insert(c.t.traffic).values({ ...e, sortOrder: i });
    }
    await c.orm.insert(c.t.kv).values({ key: 'seedNote', value: rows.note });
  });
}
