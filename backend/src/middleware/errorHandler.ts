import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message.includes("not configured") || message.includes("OpenRouter") ? 503 : 500;
  res.status(status).json({ error: message });
};
