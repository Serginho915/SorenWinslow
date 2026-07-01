import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getPostBySlug, listPosts } from "../services/postStore.js";

export const postsRouter = Router();

postsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listPosts());
  })
);

postsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const post = await getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  })
);
