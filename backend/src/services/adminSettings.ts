import type { AdminSettings } from "../types.js";
import { query } from "./db.js";

const periods = new Set(["day", "week", "month"]);
const timePattern = /^\d{2}:\d{2}$/;

function normalizeTimes(value: unknown, count: number, fallbackTime = "09:00") {
  const source = Array.isArray(value) ? value : [fallbackTime];
  const clean = source.map((item) => String(item)).filter((item) => timePattern.test(item));
  const times = clean.length > 0 ? clean : [fallbackTime];
  while (times.length < count) times.push(times[times.length - 1] ?? fallbackTime);
  return times.slice(0, count);
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const result = await query("SELECT key, value FROM admin_settings");
  const settings = Object.fromEntries(result.rows.map((row: any) => [row.key, row.value]));
  const legacyHours = Number(settings.generationFrequencyHours);
  const generationFrequencyCount = Math.max(1, Math.floor(Number(settings.generationFrequencyCount ?? (legacyHours > 0 ? 1 : 1)) || 1));
  return {
    masterPrompt: settings.masterPrompt ?? "",
    generationEnabled: Boolean(settings.generationEnabled),
    generationFrequencyCount,
    generationFrequencyPeriod: periods.has(settings.generationFrequencyPeriod) ? settings.generationFrequencyPeriod : "day",
    generationTimes: normalizeTimes(settings.generationTimes, generationFrequencyCount, settings.generationTime ?? "09:00")
  };
}

export async function updateAdminSettings(input: AdminSettings) {
  const generationFrequencyCount = Math.max(1, Math.floor(Number(input.generationFrequencyCount) || 1));
  const normalized: AdminSettings = {
    masterPrompt: String(input.masterPrompt ?? ""),
    generationEnabled: Boolean(input.generationEnabled),
    generationFrequencyCount,
    generationFrequencyPeriod: periods.has(input.generationFrequencyPeriod) ? input.generationFrequencyPeriod : "day",
    generationTimes: normalizeTimes(input.generationTimes, generationFrequencyCount)
  };
  for (const [key, value] of Object.entries(normalized)) {
    await query("INSERT INTO admin_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2", [
      key,
      JSON.stringify(value)
    ]);
  }
  return getAdminSettings();
}
