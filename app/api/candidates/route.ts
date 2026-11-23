import { getDb } from '@/lib/db';
import { ownerId, rateHit, readJson, tooMany, json } from '@/lib/http';
import { parseCandidateBody } from '@/lib/validate';

export const dynamic = 'force-dynamic';

/** Append the owner's latest state for a candidate (history kept; newest wins). */
export async function POST(req: Request) {
  const owner = await ownerId();
  const body = await readJson(req);
  if (!body.ok) return body.res;
  const input = parseCandidateBody(body.body);
  if (!input) return json({ error: 'Provide taskKey and state (watching|in-training|deployed|dismissed)' }, 400);
  const lim = await rateHit(owner, 'candidate', 120);
  if (!lim.ok) return tooMany(lim.retryAfter);
  const db = await getDb();
  await db.orm.insert(db.t.candidateStates).values({ ownerId: owner, ...input, updatedAt: new Date().toISOString() });
  return json({ ok: true });
}
