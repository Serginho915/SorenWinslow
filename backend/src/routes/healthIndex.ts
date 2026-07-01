import { Router } from "express";
import { query } from "../services/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const healthIndexRouter = Router();

healthIndexRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    await query("SELECT 1");
    res.json({ ok: true, service: "soren-winslow-api" });
  })
);
