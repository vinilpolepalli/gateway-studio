import { pgTable, text, integer, bigint, doublePrecision, index, customType } from 'drizzle-orm/pg-core';
import type { Assumptions, CandidateState } from '../types';

const jsonText = <T>() => customType<{ data: T; driverData: string }>({
  dataType: () => 'text', toDriver: (v) => JSON.stringify(v), fromDriver: (v) => JSON.parse(v),
});

export const traffic = pgTable('traffic', {
  id: text('id').primaryKey(), task: text('task').notNull(), model: text('model').notNull(),
  requestsPerDay: integer('requests_per_day').notNull(), avgTokens: integer('avg_tokens').notNull(),
  costPer1k: doublePrecision('cost_per_1k').notNull(), variance: text('variance').$type<'low' | 'medium' | 'high'>().notNull(),
  example: text('example').notNull(), sortOrder: integer('sort_order').notNull(),
});
export const ownerTraffic = pgTable('owner_traffic', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), task: text('task').notNull(),
  requestsPerDay: integer('requests_per_day').notNull(), avgTokens: integer('avg_tokens').notNull(),
  costPer1k: doublePrecision('cost_per_1k').notNull(), variance: text('variance').$type<'low' | 'medium' | 'high'>().notNull(),
  example: text('example').notNull(), createdAt: text('created_at').notNull(),
}, (t) => [index('owner_traffic_idx').on(t.ownerId)]);
export const candidateStates = pgTable('candidate_states', {
  ownerId: text('owner_id').notNull(), taskKey: text('task_key').notNull(),
  state: text('state').$type<CandidateState>().notNull(), updatedAt: text('updated_at').notNull(),
}, (t) => [index('cand_owner_idx').on(t.ownerId)]);
export const ownerAssumptions = pgTable('owner_assumptions', {
  ownerId: text('owner_id').primaryKey(),
  assumptions: jsonText<Assumptions>()('assumptions').notNull(), updatedAt: text('updated_at').notNull(),
});
export const kv = pgTable('kv', { key: text('key').primaryKey(), value: text('value').notNull() });
export const rateEvents = pgTable('rate_events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), ownerId: text('owner_id').notNull(), kind: text('kind').notNull(), at: bigint('at', { mode: 'number' }).notNull(),
}, (t) => [index('rate_idx').on(t.ownerId, t.kind, t.at)]);
