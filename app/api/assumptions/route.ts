import { getDb } from '@/lib/db';
import { ownerId, readJson, json } from '@/lib/http';
import { parseAssumptions } from '@/lib/validate';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  const owner = await ownerId();
  const body = await readJson(req);
  if (!body.ok) return body.res;
  const assumptions = parseAssumptions(body.body);
  if (!assumptions) return json({ error: 'Invalid assumptions: numeric fields within range required' }, 400);
  const db = await getDb();
  await db.tx(async (c) => {
    await c.orm.delete(c.t.ownerAssumptions).where(eq(c.t.ownerAssumptions.ownerId, owner));
    await c.orm.insert(c.t.ownerAssumptions).values({ ownerId: owner, assumptions, updatedAt: new Date().toISOString() });
  });
  return json({ ok: true, assumptions });
}
