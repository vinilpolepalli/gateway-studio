import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import type { Assumptions, CandidateState } from '../types';

export const traffic = sqliteTable('traffic', {
  id: text('id').primaryKey(), task: text('task').notNull(), model: text('model').notNull(),
  requestsPerDay: integer('requests_per_day').notNull(), avgTokens: integer('avg_tokens').notNull(),
  costPer1k: real('cost_per_1k').notNull(), variance: text('variance').$type<'low' | 'medium' | 'high'>().notNull(),
  example: text('example').notNull(), sortOrder: integer('sort_order').notNull(),
});
export const ownerTraffic = sqliteTable('owner_traffic', {
  id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), task: text('task').notNull(),
  requestsPerDay: integer('requests_per_day').notNull(), avgTokens: integer('avg_tokens').notNull(),
  costPer1k: real('cost_per_1k').notNull(), variance: text('variance').$type<'low' | 'medium' | 'high'>().notNull(),
  example: text('example').notNull(), createdAt: text('created_at').notNull(),
}, (t) => [index('owner_traffic_idx').on(t.ownerId)]);
export const candidateStates = sqliteTable('candidate_states', {
  ownerId: text('owner_id').notNull(), taskKey: text('task_key').notNull(),
  state: text('state').$type<CandidateState>().notNull(), updatedAt: text('updated_at').notNull(),
}, (t) => [index('cand_owner_idx').on(t.ownerId)]);
export const ownerAssumptions = sqliteTable('owner_assumptions', {
  ownerId: text('owner_id').primaryKey(),
  assumptions: text('assumptions', { mode: 'json' }).$type<Assumptions>().notNull(), updatedAt: text('updated_at').notNull(),
});
export const kv = sqliteTable('kv', { key: text('key').primaryKey(), value: text('value').notNull() });
export const rateEvents = sqliteTable('rate_events', {
  id: integer('id').primaryKey({ autoIncrement: true }), ownerId: text('owner_id').notNull(), kind: text('kind').notNull(), at: integer('at').notNull(),
}, (t) => [index('rate_idx').on(t.ownerId, t.kind, t.at)]);
