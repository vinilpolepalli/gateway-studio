import { getDb } from '@/lib/db';
import { ownerId, rateHit, readJson, tooMany, json } from '@/lib/http';
import { parseTrafficBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

/** Add one of the owner's own traffic rows (persisted only for this owner). */
export async function POST(req: Request) {
  const owner = await ownerId();
  const body = await readJson(req);
  if (!body.ok) return body.res;
  const input = parseTrafficBody(body.body);
  if (!input) return json({ error: 'Provide task, requestsPerDay, avgTokens, costPer1k, variance (low|medium|high), example' }, 400);
  const lim = await rateHit(owner, 'traffic', 60);
  if (!lim.ok) return tooMany(lim.retryAfter);
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.orm.insert(db.t.ownerTraffic).values({ id, ownerId: owner, ...input, createdAt: new Date().toISOString() });
  return json({ id }, 201);
}
