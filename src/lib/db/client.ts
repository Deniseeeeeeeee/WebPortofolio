import { createClient, type Client } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from 'astro:env/server';
import { SCHEMA } from './schema';
import { seedIfEmpty } from './seed';

let ready: Promise<Client> | null = null;

async function open(): Promise<Client> {
  let url = TURSO_DATABASE_URL;
  if (!url) {
    if (process.env.VERCEL) {
      throw new Error('TURSO_DATABASE_URL is not set. Add your Turso database URL and token in Vercel → Settings → Environment Variables.');
    }
    // Local development: a SQLite file in ./data (git-ignored)
    const { mkdirSync } = await import('node:fs');
    mkdirSync('data', { recursive: true });
    url = 'file:data/local.db';
  }
  const db = createClient({ url, authToken: TURSO_AUTH_TOKEN });
  await db.execute('PRAGMA foreign_keys = ON');
  await db.batch(SCHEMA, 'write');
  await seedIfEmpty(db);
  return db;
}

/** Shared database client. Creates the tables and seeds the CV content on first use. */
export function getDb(): Promise<Client> {
  if (!ready) {
    ready = open().catch((err) => {
      ready = null; // allow a retry on the next request
      throw err;
    });
  }
  return ready;
}
