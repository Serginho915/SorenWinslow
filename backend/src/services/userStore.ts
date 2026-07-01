import type { User } from "../types.js";
import { query } from "./db.js";

const mapUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role
});

export async function findUserByEmail(email: string) {
  const result = await query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserById(id: string) {
  const result = await query("SELECT * FROM users WHERE id=$1", [id]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}
