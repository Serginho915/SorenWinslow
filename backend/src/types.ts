import type { Request } from "express";

export type UserRole = "superadmin";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  contentHtml: string;
  publishedAt: string;
  updatedAt: string;
};

export type AdminSettings = {
  masterPrompt: string;
  generationEnabled: boolean;
  generationFrequencyCount: number;
  generationFrequencyPeriod: "day" | "week" | "month";
  generationTimes: string[];
};

export type AuthRequest = Request & {
  user?: { id: string; email: string; role: UserRole };
};
