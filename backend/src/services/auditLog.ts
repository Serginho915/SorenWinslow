import { query } from "./db.js";

export async function auditLog(userId: string | undefined, action: string, meta: Record<string, unknown> = {}) {
  await query("INSERT INTO audit_logs (user_id, action, meta) VALUES ($1,$2,$3)", [userId ?? null, action, meta]);
}
