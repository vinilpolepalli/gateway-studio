'use client';
import { useState } from 'react';
import { btn, btn2, input, Panel } from './ui';
import { money, num, pct } from '@/lib/format';
import type { Assumptions, CandidateState, ClusterEval, TrafficEntry } from '@/lib/types';

const STATES: { id: CandidateState; label: string }[] = [
  { id: 'watching', label: 'Watch' },
  { id: 'in-training', label: 'In training' },
  { id: 'deployed', label: 'Deployed' },
  { id: 'dismissed', label: 'Dismiss' },
];

export default function Studio({ seeded, mine, clusters: initialClusters, initialAssumptions, states: initialStates, rollout }: {
  seeded: TrafficEntry[]; mine: TrafficEntry[]; clusters: ClusterEval[];
  initialAssumptions: Assumptions; states: Record<string, CandidateState>; rollout: string[];
}) {
  const [clusters, setClusters] = useState(initialClusters);
  const [states, setStates] = useState(initialStates);
  const [a, setA] = useState(initialAssumptions);
  const [rows, setRows] = useState(mine);
  const [form, setForm] = useState({ task: '', requestsPerDay: '', avgTokens: '', costPer1k: '0.005', variance: 'low', example: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [openRollout, setOpenRollout] = useState<string | null>(null);

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: { 'content-type': 'application/json' } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
    return body;
  }

  async function saveAssumptions() {
    setSaving(true); setError('');
    try {
      await call('/api/assumptions', { method: 'PUT', body: JSON.stringify(a) });
      const { evaluateCluster, clusterTraffic } = await import('@/lib/engine');
      setClusters([...clusterTraffic([...seeded, ...rows])].map(([t, es]) => evaluateCluster(t, es, a)).sort((x, y) => y.savingsMonthlyUsd - x.savingsMonthlyUsd));
    } catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }

  async function setState(taskKey: string, state: CandidateState) {
    try {
      await call('/api/candidates', { method: 'POST', body: JSON.stringify({ taskKey, state }) });
      setStates((s) => ({ ...s, [taskKey]: state }));
    } catch (e) { setError((e as Error).message); }
  }

  async function addRow() {
    setError('');
    try {
      const payload = { task: form.task, requestsPerDay: Number(form.requestsPerDay), avgTokens: Number(form.avgTokens), costPer1k: Number(form.costPer1k), variance: form.variance, example: form.example };
      const r = await call('/api/traffic', { method: 'POST', body: JSON.stringify(payload) });
      const row: TrafficEntry = { id: r.id, model: 'owner-added', ...payload, variance: payload.variance as TrafficEntry['variance'] };
      const next = [row, ...rows];
      setRows(next);
      setForm({ task: '', requestsPerDay: '', avgTokens: '', costPer1k: '0.005', variance: 'low', example: '' });
      const { evaluateCluster, clusterTraffic } = await import('@/lib/engine');
      setClusters([...clusterTraffic([...seeded, ...next])].map(([t, es]) => evaluateCluster(t, es, a)).sort((x, y) => y.savingsMonthlyUsd - x.savingsMonthlyUsd));
    } catch (e) { setError((e as Error).message); }
  }

  const field = (k: keyof typeof a, label: string, step = 1) => (
    <label className="block text-[11px] text-mute">{label}
      <input className={input} type="number" step={step} value={a[k]} onChange={(e) => setA({ ...a, [k]: Number(e.target.value) })} />
    </label>
  );

  return (
    <div className="mt-6 space-y-6">
      <Panel title="Distillation candidates" right={<span className="text-[11px] text-mute">ranked by estimated monthly savings</span>}>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="label border-b border-line">
            <th className="py-2 pr-3 font-semibold">Task cluster</th><th className="py-2 pr-3 text-right font-semibold">Req/day</th>
            <th className="py-2 pr-3 text-right font-semibold">Current /mo</th><th className="py-2 pr-3 text-right font-semibold">Owned /mo</th>
            <th className="py-2 pr-3 text-right font-semibold">Savings /mo</th><th className="py-2 pr-3 text-right font-semibold">Payback</th>
            <th className="py-2 pr-3 font-semibold">Verdict</th><th className="py-2 font-semibold">State</th>
          </tr></thead>
          <tbody>{clusters.map((c) => (
            <tr key={c.task} className="border-b border-line align-top">
              <td className="py-2 pr-3">
                <button className="text-left text-accent underline underline-offset-2" onClick={() => setOpenRollout(openRollout === c.task ? null : c.task)}>{c.task}</button>
                <div className="text-[11px] text-mute">{c.reasons.join('; ')}</div>
                {openRollout === c.task && (
                  <ol className="mt-2 list-decimal space-y-1 rounded-ctl border border-line bg-[#fafafa] p-3 pl-6 text-[11px] text-ink">
                    {rollout.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                )}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{num(c.requestsPerDay)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{money(c.monthlyCostUsd)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{money(c.ownedMonthlyUsd)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{money(c.savingsMonthlyUsd)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{c.paybackDays ? `~${c.paybackDays}d` : '-'}</td>
              <td className="py-2 pr-3">{c.candidate ? <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase text-white">candidate</span> : <span className="text-[11px] text-mute">not yet</span>}</td>
              <td className="py-2"><div className="flex flex-wrap gap-1">{STATES.map((s) => (
                <button key={s.id} className={`px-2 py-1 text-[11px] ${states[c.task] === s.id ? btn : btn2}`} onClick={() => setState(c.task, s.id)}>{s.label}</button>
              ))}</div></td>
            </tr>
          ))}</tbody>
        </table></div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Savings assumptions" right={<button className={btn2} disabled={saving} onClick={saveAssumptions}>{saving ? 'Saving…' : 'Save + recompute'}</button>}>
          <div className="grid grid-cols-2 gap-3">
            {field('trainingCostUsd', 'One-time training cost ($)')}
            {field('infraMonthlyUsd', 'Owned-model infra ($/mo)')}
            {field('smallCostPer1k', 'Small-model price ($/1k tok)', 0.0001)}
            {field('qualityRiskPct', 'Quality-risk reserve (% of spend)')}
            {field('minSavingsMonthlyUsd', 'Candidate bar ($/mo savings)')}
          </div>
        </Panel>
        <Panel title="Add your own traffic row">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[11px] text-mute">Task<input className={input} value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} placeholder="e.g. lead enrichment" /></label>
            <label className="block text-[11px] text-mute">Variance<select className={input} value={form.variance} onChange={(e) => setForm({ ...form, variance: e.target.value })}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></label>
            <label className="block text-[11px] text-mute">Requests/day<input className={input} type="number" value={form.requestsPerDay} onChange={(e) => setForm({ ...form, requestsPerDay: e.target.value })} /></label>
            <label className="block text-[11px] text-mute">Avg tokens<input className={input} type="number" value={form.avgTokens} onChange={(e) => setForm({ ...form, avgTokens: e.target.value })} /></label>
            <label className="block text-[11px] text-mute">Price ($/1k)<input className={input} type="number" step="0.0001" value={form.costPer1k} onChange={(e) => setForm({ ...form, costPer1k: e.target.value })} /></label>
            <label className="block text-[11px] text-mute">Example prompt<input className={input} value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} /></label>
          </div>
          <div className="mt-3 flex justify-end"><button className={btn} disabled={!form.task.trim() || !form.requestsPerDay || !form.avgTokens} onClick={addRow}>Add row</button></div>
          {rows.length > 0 && <p className="mt-2 text-[11px] text-mute">{rows.length} row(s) you added are folded into the clusters above (stored for this browser only).</p>}
        </Panel>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
