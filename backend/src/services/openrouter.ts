import { z } from "zod";
import { getAdminSettings } from "./adminSettings.js";
import { sanitizeHtml } from "./htmlSanitizer.js";

const articleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string()),
  seoTitle: z.string(),
  seoDescription: z.string(),
  contentHtml: z.string()
});

export async function generateArticle() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
  const settings = await getAdminSettings();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: settings.masterPrompt },
        { role: "user", content: "Create one fresh review article. Return valid JSON only. Do not generate images." }
      ],
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  const article = articleSchema.parse(JSON.parse(raw));
  return { ...article, contentHtml: sanitizeHtml(article.contentHtml) };
}
