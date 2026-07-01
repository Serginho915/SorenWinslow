import type { AdminSettings, Post } from "./domain";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

let accessToken = "";
let csrfToken = "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (csrfToken) headers.set("x-csrf-token", csrfToken);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });
  if (!response.ok) throw new Error((await response.json()).error ?? "Request failed");
  return response.json();
}

export const api = {
  getPosts: () => request<Post[]>("/posts"),
  getPost: (slug: string) => request<Post>(`/posts/${slug}`),
  subscribe: (email: string) => request<{ ok: true }>("/subscribers", { method: "POST", body: JSON.stringify({ email }) }),
  async login(email: string, password: string) {
    const data = await request<{ accessToken: string; csrfToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    accessToken = data.accessToken;
    csrfToken = data.csrfToken;
    return data;
  },
  async refresh() {
    const data = await request<{ accessToken: string; csrfToken: string }>("/auth/refresh", { method: "POST" });
    accessToken = data.accessToken;
    csrfToken = data.csrfToken;
    return data;
  },
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  adminPosts: () => request<Post[]>("/admin/posts"),
  createPost: (post: Partial<Post>) => request<Post>("/admin/posts", { method: "POST", body: JSON.stringify(post) }),
  updatePost: (id: string, post: Partial<Post>) => request<Post>(`/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(post) }),
  deletePost: (id: string) => request<{ ok: true }>(`/admin/posts/${id}`, { method: "DELETE" }),
  getSettings: () => request<AdminSettings>("/admin/settings"),
  updateSettings: (settings: AdminSettings) =>
    request<AdminSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(settings) }),
  generateNow: () => request<Post>("/ai/generate-now", { method: "POST" })
};
