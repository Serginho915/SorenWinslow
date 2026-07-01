import { query } from "./db.js";

export async function addSubscriber(email: string) {
  await query("INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", [email.toLowerCase()]);
}
