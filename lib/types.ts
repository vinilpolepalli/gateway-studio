export type TrafficEntry = {
  id: string; task: string; model: string; requestsPerDay: number;
  avgTokens: number; costPer1k: number; variance: 'low' | 'medium' | 'high'; example: string;
};
export type Assumptions = {
  trainingCostUsd: number; infraMonthlyUsd: number; smallCostPer1k: number;
  qualityRiskPct: number; minSavingsMonthlyUsd: number;
};
export type ClusterEval = {
  task: string; entries: number; requestsPerDay: number; monthlyCostUsd: number;
  repeatability: number; ownedMonthlyUsd: number; savingsMonthlyUsd: number;
  paybackDays: number | null; candidate: boolean; reasons: string[];
};
export type CandidateState = 'watching' | 'in-training' | 'deployed' | 'dismissed';
