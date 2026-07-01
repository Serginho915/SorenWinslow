import { getAdminSettings } from "./adminSettings.js";
import { query } from "./db.js";
import { generateArticle } from "./openrouter.js";
import { createPost } from "./postStore.js";

function periodStart(date: Date, period: "day" | "week" | "month") {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  if (period === "week") {
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
  }
  if (period === "month") start.setDate(1);
  return start;
}

async function getRunLog() {
  const result = await query<{ value: string[] }>("SELECT value FROM admin_settings WHERE key='scheduledGenerationRuns'");
  return Array.isArray(result.rows[0]?.value) ? result.rows[0].value : [];
}

async function saveRunLog(log: string[]) {
  await query(
    "INSERT INTO admin_settings (key, value) VALUES ('scheduledGenerationRuns',$1) ON CONFLICT (key) DO UPDATE SET value=$1",
    [JSON.stringify(log.slice(-200))]
  );
}

function runDate(item: string) {
  return new Date(item.split("#")[0]);
}

export function startGenerationScheduler() {
  setInterval(async () => {
    try {
      const settings = await getAdminSettings();
      if (!settings.generationEnabled) return;
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const matchingSlots = settings.generationTimes
        .map((time, index) => ({ time, index }))
        .filter((slot) => slot.time === currentTime);
      if (matchingSlots.length === 0) return;

      const log = await getRunLog();

      const start = periodStart(now, settings.generationFrequencyPeriod);
      let runsInPeriod = log.filter((item) => runDate(item) >= start).length;

      const nextLog = [...log];
      for (const slot of matchingSlots) {
        if (runsInPeriod >= settings.generationFrequencyCount) break;
        const runKey = `${now.toISOString().slice(0, 10)}T${currentTime}#${slot.index}`;
        if (log.includes(runKey)) continue;
        const article = await generateArticle();
        await createPost(article);
        nextLog.push(runKey);
        runsInPeriod += 1;
      }
      await saveRunLog(nextLog);
    } catch (error) {
      console.error("Scheduled generation failed", error instanceof Error ? error.message : error);
    }
  }, 60 * 1000);
}
