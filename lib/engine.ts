import type { Assumptions, ClusterEval, TrafficEntry } from './types';

const VARIANCE_REPEAT: Record<TrafficEntry['variance'], number> = { low: 0.9, medium: 0.6, high: 0.25 };

/** Monthly cost of a traffic slice at current model pricing. */
export function monthlyCost(e: TrafficEntry): number {
  return e.requestsPerDay * 30 * (e.avgTokens / 1000) * e.costPer1k;
}

/**
 * Evaluate one task cluster as a distillation candidate. Deterministic estimate math from
 * explicit assumptions - every figure is labeled an estimate in the UI.
 */
export function evaluateCluster(task: string, entries: TrafficEntry[], a: Assumptions): ClusterEval {
  const reasons: string[] = [];
  const reqDay = entries.reduce((s, e) => s + e.requestsPerDay, 0);
  const monthly = entries.reduce((s, e) => s + monthlyCost(e), 0);
  const repeatability = entries.reduce((s, e) => s + VARIANCE_REPEAT[e.variance] * e.requestsPerDay, 0) / (reqDay || 1);
  // Owned small model: infra + usage at small-model price, plus a quality-risk reserve as % of monthly spend.
  const tokensMonthly = entries.reduce((s, e) => s + e.requestsPerDay * 30 * e.avgTokens, 0);
  const owned = a.infraMonthlyUsd + (tokensMonthly / 1000) * a.smallCostPer1k + monthly * (a.qualityRiskPct / 100);
  const savings = monthly - owned;
  const payback = savings > 0 ? Math.ceil(a.trainingCostUsd / (savings / 30)) : null;
  if (repeatability < 0.5) reasons.push('prompt variance too high for a small owned model today');
  if (savings < a.minSavingsMonthlyUsd) reasons.push(`projected savings below your $${a.minSavingsMonthlyUsd}/mo bar`);
  if (repeatability >= 0.5) reasons.push(`repeatable task shape (${Math.round(repeatability * 100)}% template-able)`);
  if (payback) reasons.push(`training cost pays back in ~${payback} days`);
  return {
    task, entries: entries.length, requestsPerDay: reqDay, monthlyCostUsd: Math.round(monthly * 100) / 100,
    repeatability: Math.round(repeatability * 100) / 100, ownedMonthlyUsd: Math.round(owned * 100) / 100,
    savingsMonthlyUsd: Math.round(savings * 100) / 100, paybackDays: payback,
    candidate: repeatability >= 0.5 && savings >= a.minSavingsMonthlyUsd, reasons,
  };
}

export function clusterTraffic(entries: TrafficEntry[]): Map<string, TrafficEntry[]> {
  const m = new Map<string, TrafficEntry[]>();
  for (const e of entries) {
    const k = e.task;
    m.set(k, [...(m.get(k) ?? []), e]);
  }
  return m;
}

export const ROLLOUT = [
  'Capture 2-4 weeks of production prompts and outputs for this task through the gateway',
  'Label a held-out eval slice before any training run',
  'Fine-tune the small model on the captured traffic',
  'Shadow-route 5% of live requests and compare eval scores',
  'Shift traffic to the owned model behind a rollback flag',
];
