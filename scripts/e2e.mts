const base = process.env.BASE_URL ?? 'http://localhost:3000';
const jar: string[] = [];
async function call(path: string, init?: RequestInit) {
  const res = await fetch(base + path, { ...init, headers: { ...(init?.headers ?? {}), cookie: jar.join('; '), 'content-type': 'application/json' } });
  for (const c of res.headers.getSetCookie?.() ?? []) jar.push(c.split(';')[0]);
  return res;
}
const home = await call('/');
if (home.status !== 200) throw new Error(`home ${home.status}`);
if (!(await home.text()).includes('Gateway')) throw new Error('home missing heading');
const put = await call('/api/assumptions', { method: 'PUT', body: JSON.stringify({ trainingCostUsd: 1000, infraMonthlyUsd: 100, smallCostPer1k: 0.0002, qualityRiskPct: 10, minSavingsMonthlyUsd: 10 }) });
if (put.status !== 200) throw new Error(`assumptions ${put.status}: ${await put.text()}`);
const add = await call('/api/traffic', { method: 'POST', body: JSON.stringify({ task: 'lead enrichment', requestsPerDay: 900, avgTokens: 500, costPer1k: 0.005, variance: 'low', example: 'Enrich this lead with role and company size.' }) });
if (add.status !== 201) throw new Error(`traffic ${add.status}: ${await add.text()}`);
const home2 = await call('/');
if (!(await home2.text()).includes('lead enrichment')) throw new Error('owner row not persisted');
const st = await call('/api/candidates', { method: 'POST', body: JSON.stringify({ taskKey: 'sentiment tagging', state: 'in-training' }) });
if (st.status !== 200) throw new Error(`candidate ${st.status}`);
const bad = await call('/api/traffic', { method: 'POST', body: JSON.stringify({ task: '' }) });
if (bad.status !== 400) throw new Error('validation failed');
console.log('e2e pass');
