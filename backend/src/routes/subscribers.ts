import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { addSubscriber } from "../services/subscriberStore.js";

export const subscribersRouter = Router();

subscribersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    await addSubscriber(req.body.email);
    res.status(201).json({ ok: true });
  })
);
