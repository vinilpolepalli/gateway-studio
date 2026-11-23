import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { clusterTraffic, evaluateCluster, monthlyCost, ROLLOUT } from '../lib/engine.ts';
import { DEFAULT_ASSUMPTIONS } from '../lib/validate.ts';
import type { TrafficEntry } from '../lib/types.ts';

const { entries } = JSON.parse(readFileSync(new URL('../data/traffic.json', import.meta.url), 'utf8')) as { entries: TrafficEntry[] };
const clusters = [...clusterTraffic(entries)].map(([t, es]) => evaluateCluster(t, es, DEFAULT_ASSUMPTIONS));
const byTask = Object.fromEntries(clusters.map((c) => [c.task, c]));
assert.ok(monthlyCost(entries[0]) > 0);
assert.ok(byTask['sentiment tagging'].candidate, 'sentiment tagging is a candidate');
assert.ok(!byTask['sql assist'].candidate, 'high-variance sql assist is not a candidate');
assert.ok(byTask['sentiment tagging'].savingsMonthlyUsd > 0);
assert.ok(byTask['sentiment tagging'].paybackDays! > 0);
const cheap = evaluateCluster('sentiment tagging', entries.filter((e) => e.task === 'sentiment tagging'), { ...DEFAULT_ASSUMPTIONS, minSavingsMonthlyUsd: 999999 });
assert.ok(!cheap.candidate, 'candidate bar respected');
assert.ok(ROLLOUT.length === 5);
console.log('engine tests pass');
