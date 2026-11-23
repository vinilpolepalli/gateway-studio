import type { Assumptions } from './types';

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  trainingCostUsd: 2500, infraMonthlyUsd: 120, smallCostPer1k: 0.0002,
  qualityRiskPct: 10, minSavingsMonthlyUsd: 50,
};

const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;

export function parseAssumptions(body: unknown): Assumptions | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const a = {
    trainingCostUsd: num(b.trainingCostUsd, 0, 1_000_000),
    infraMonthlyUsd: num(b.infraMonthlyUsd, 0, 100_000),
    smallCostPer1k: num(b.smallCostPer1k, 0, 1),
    qualityRiskPct: num(b.qualityRiskPct, 0, 100),
    minSavingsMonthlyUsd: num(b.minSavingsMonthlyUsd, 0, 1_000_000),
  };
  return Object.values(a).every((v) => v !== null) ? (a as Assumptions) : null;
}

export function parseTrafficBody(body: unknown): { task: string; requestsPerDay: number; avgTokens: number; costPer1k: number; variance: 'low' | 'medium' | 'high'; example: string } | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const task = typeof b.task === 'string' ? b.task.trim().slice(0, 80) : '';
  const example = typeof b.example === 'string' ? b.example.trim().slice(0, 300) : '';
  const variance = b.variance === 'low' || b.variance === 'medium' || b.variance === 'high' ? b.variance : null;
  const rpd = num(b.requestsPerDay, 1, 10_000_000), at = num(b.avgTokens, 1, 200_000), c = num(b.costPer1k, 0, 10);
  if (!task || !variance || rpd === null || at === null || c === null) return null;
  return { task, requestsPerDay: rpd, avgTokens: at, costPer1k: c, variance, example };
}

export function parseCandidateBody(body: unknown): { taskKey: string; state: 'watching' | 'in-training' | 'deployed' | 'dismissed' } | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const states = ['watching', 'in-training', 'deployed', 'dismissed'] as const;
  if (typeof b.taskKey !== 'string' || b.taskKey.length > 100) return null;
  const state = (states as readonly string[]).includes(b.state as string) ? (b.state as (typeof states)[number]) : null;
  return state ? { taskKey: b.taskKey, state } : null;
}
