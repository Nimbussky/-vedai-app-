import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Cloudflare Pages Functions env type
interface CloudflareEnv {
  DB?: {
    prepare: (sql: string) => {
      bind: (...params: unknown[]) => {
        all: () => Promise<{ results: unknown[] }>;
        first: () => Promise<unknown>;
        run: () => Promise<void>;
      };
    };
  };
}

// Get DB instance from Cloudflare context
// Works in both Edge runtime and Cloudflare Pages Functions
export function getDb(env?: CloudflareEnv) {
  // In Cloudflare Pages, env.DB is injected at runtime
  const d1 = env?.DB || (globalThis as Record<string, unknown>)?.DB;

  if (!d1) {
    // Graceful degradation: if no DB, return null
    // All DB operations should check for null
    console.warn('[VedAI] No D1 database binding found. Database features disabled.');
    return null;
  }

  return drizzle(d1 as Parameters<typeof drizzle>[0], { schema });
}

export type Database = ReturnType<typeof getDb>;
