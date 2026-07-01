import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthRequest } from "../types.js";
import { auditLog } from "../services/auditLog.js";
import { generateArticle } from "../services/openrouter.js";
import { createPost } from "../services/postStore.js";

export const aiRouter = Router();

aiRouter.post(
  "/generate-now",
  adminAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const article = await generateArticle();
    const post = await createPost(article);
    await auditLog(req.user?.id, "ai.generate", { id: post.id });
    res.status(201).json(post);
  })
);
