import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  createdAt: text('created_at').default('datetime("now")'),
});

export const birthProfiles = sqliteTable('birth_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  label: text('label').default('Me'),
  name: text('name').notNull(),
  date: text('date').notNull(),
  time: text('time'),
  place: text('place'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  timezone: text('timezone').default('UTC'),
  createdAt: text('created_at').default('datetime("now")'),
});

export const chartCache = sqliteTable('chart_cache', {
  cacheKey: text('cache_key').primaryKey(),
  data: text('data').notNull(),
  source: text('source').default('vedastro'),
  fetchedAt: text('fetched_at').default('datetime("now")'),
});

export const chatConversations = sqliteTable('chat_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  profileId: integer('profile_id'),
  title: text('title'),
  createdAt: text('created_at').default('datetime("now")'),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id'),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').default('datetime("now")'),
});

export type User = typeof users.$inferSelect;
export type BirthProfile = typeof birthProfiles.$inferSelect;
export type ChartCacheEntry = typeof chartCache.$inferSelect;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
