import type { Post } from "../types.js";
import { query } from "./db.js";

const mapPost = (row: any): Post => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  tags: row.tags ?? [],
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  contentHtml: row.content_html,
  publishedAt: row.published_at,
  updatedAt: row.updated_at
});

export async function listPosts() {
  const result = await query("SELECT * FROM generated_posts ORDER BY published_at DESC");
  return result.rows.map(mapPost);
}

export async function getPostBySlug(slug: string) {
  const result = await query("SELECT * FROM generated_posts WHERE slug=$1", [slug]);
  return result.rows[0] ? mapPost(result.rows[0]) : null;
}

export async function createPost(input: Omit<Post, "id" | "publishedAt" | "updatedAt">) {
  const result = await query(
    `INSERT INTO generated_posts (title, slug, excerpt, tags, seo_title, seo_description, content_html)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [input.title, input.slug, input.excerpt, input.tags, input.seoTitle, input.seoDescription, input.contentHtml]
  );
  return mapPost(result.rows[0]);
}

export async function updatePost(id: string, input: Omit<Post, "id" | "publishedAt" | "updatedAt">) {
  const result = await query(
    `UPDATE generated_posts SET title=$1, slug=$2, excerpt=$3, tags=$4, seo_title=$5, seo_description=$6,
      content_html=$7, updated_at=now() WHERE id=$8 RETURNING *`,
    [input.title, input.slug, input.excerpt, input.tags, input.seoTitle, input.seoDescription, input.contentHtml, id]
  );
  return result.rows[0] ? mapPost(result.rows[0]) : null;
}

export async function deletePost(id: string) {
  await query("DELETE FROM generated_posts WHERE id=$1", [id]);
}
