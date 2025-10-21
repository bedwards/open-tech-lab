import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  files: text('files').notNull(), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const collaborators = sqliteTable('collaborators', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(), // 'owner', 'editor', 'viewer'
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
});

export const plugins = sqliteTable('plugins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  author: text('author').notNull(),
  version: text('version').notNull(),
  manifest: text('manifest').notNull(), // JSON string
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  downloads: integer('downloads').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  metadata: text('metadata'), // JSON string
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const backups = sqliteTable('backups', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  size: integer('size').notNull(),
  checksum: text('checksum').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
