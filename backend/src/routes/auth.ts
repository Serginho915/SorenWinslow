import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authLimiter } from "../services/rateLimit.js";
import { clearRefreshCookie, createRefreshSession, login, refreshSession, revokeRefreshToken } from "../services/auth.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const user = await login(req.body.email ?? req.body.username, req.body.password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(await createRefreshSession(res, user));
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const session = await refreshSession(req.cookies.refreshToken, req.header("x-csrf-token"));
    if (!session) return res.status(401).json({ error: "Invalid session" });
    res.json({ accessToken: session.accessToken, csrfToken: session.csrfToken });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await revokeRefreshToken(req.cookies.refreshToken);
    clearRefreshCookie(res);
    res.json({ ok: true });
  })
);
