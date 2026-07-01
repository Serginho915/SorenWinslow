import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthRequest } from "../types.js";
import { auditLog } from "../services/auditLog.js";
import { getAdminSettings, updateAdminSettings } from "../services/adminSettings.js";
import { createPost, deletePost, listPosts, updatePost } from "../services/postStore.js";
import { sanitizeHtml } from "../services/htmlSanitizer.js";

export const adminRouter = Router();
adminRouter.use(adminAuth);

const cleanPost = (body: any) => ({
  title: body.title,
  slug: body.slug,
  excerpt: body.excerpt,
  tags: Array.isArray(body.tags) ? body.tags : String(body.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
  seoTitle: body.seoTitle,
  seoDescription: body.seoDescription,
  contentHtml: sanitizeHtml(body.contentHtml)
});

adminRouter.get(
  "/posts",
  asyncHandler(async (_req, res) => {
    res.json(await listPosts());
  })
);

adminRouter.post(
  "/posts",
  asyncHandler(async (req: AuthRequest, res) => {
    const post = await createPost(cleanPost(req.body));
    await auditLog(req.user?.id, "post.create", { id: post.id });
    res.status(201).json(post);
  })
);

adminRouter.put(
  "/posts/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const post = await updatePost(req.params.id, cleanPost(req.body));
    if (!post) return res.status(404).json({ error: "Post not found" });
    await auditLog(req.user?.id, "post.update", { id: post.id });
    res.json(post);
  })
);

adminRouter.delete(
  "/posts/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    await deletePost(req.params.id);
    await auditLog(req.user?.id, "post.delete", { id: req.params.id });
    res.json({ ok: true });
  })
);

adminRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    res.json(await getAdminSettings());
  })
);

adminRouter.put(
  "/settings",
  asyncHandler(async (req: AuthRequest, res) => {
    const settings = await updateAdminSettings(req.body);
    await auditLog(req.user?.id, "settings.update");
    res.json(settings);
  })
);
