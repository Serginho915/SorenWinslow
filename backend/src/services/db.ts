import pg, { type QueryResultRow } from "pg";
import { defaultMasterPrompt, samplePosts } from "../data/samplePosts.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}

export async function initDb() {
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'superadmin',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS generated_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      seo_title TEXT NOT NULL,
      seo_description TEXT NOT NULL,
      content_html TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      action TEXT NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const postsCount = await query<{ count: string }>("SELECT count(*) FROM generated_posts");
  if (Number(postsCount.rows[0].count) === 0) {
    for (const post of samplePosts) {
      await query(
        `INSERT INTO generated_posts (title, slug, excerpt, tags, seo_title, seo_description, content_html)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING`,
        [post.title, post.slug, post.excerpt, post.tags, post.seoTitle, post.seoDescription, post.contentHtml]
      );
    }
  }

  await query(
    `INSERT INTO admin_settings (key, value) VALUES
      ('masterPrompt', $1),
      ('generationEnabled', 'false'),
      ('generationFrequencyCount', '1'),
      ('generationFrequencyPeriod', '"day"'),
      ('generationTimes', '["09:00"]')
    ON CONFLICT (key) DO NOTHING`,
    [JSON.stringify(defaultMasterPrompt)]
  );
}
