import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function secret() {
  return crypto.randomBytes(64).toString("base64url");
}

function parseEnv(text) {
  const values = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    values.set(line.slice(0, index), line.slice(index + 1));
  }
  return values;
}

function render(values, order) {
  const keys = [...new Set([...order, ...values.keys()])];
  return `${keys.map((key) => `${key}=${values.get(key) ?? ""}`).join("\n")}\n`;
}

function ensureEnv({ file, example, defaults = {}, generated = {} }) {
  const target = path.join(root, file);
  const source = path.join(root, example);
  const initial = fs.existsSync(target)
    ? fs.readFileSync(target, "utf8")
    : fs.existsSync(source)
      ? fs.readFileSync(source, "utf8")
      : "";
  const values = parseEnv(initial);
  const order = [...values.keys()];

  for (const [key, value] of Object.entries(defaults)) {
    if (!values.get(key) || values.get(key)?.includes("replace-with")) {
      values.set(key, value);
      order.push(key);
    }
  }

  for (const [key, makeValue] of Object.entries(generated)) {
    const current = values.get(key);
    if (!current || current.includes("replace-with") || current.includes("ChangeMe")) {
      values.set(key, makeValue());
      order.push(key);
    }
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, render(values, order));
  console.log(`Ready: ${file}`);
}

ensureEnv({
  file: ".env",
  example: ".env.example",
  defaults: {
    POSTGRES_DB: "sorenwinslow",
    POSTGRES_USER: "soren",
    POSTGRES_PASSWORD: "localpassword",
    REDIS_PASSWORD: "localredis",
    LOCAL_SUPERADMIN_EMAIL: "admin@sorenwinslow.local",
    LOCAL_SUPERADMIN_PASSWORD: "MySecretPassword123!"
  }
});

ensureEnv({
  file: "frontend/.env",
  example: "frontend/.env.example",
  defaults: {
    VITE_API_URL: "http://localhost:4000/api"
  }
});

ensureEnv({
  file: "backend/.env",
  example: "backend/.env.example",
  defaults: {
    PORT: "4000",
    DATABASE_URL: "postgres://soren:localpassword@postgres:5432/sorenwinslow",
    REDIS_URL: "redis://:localredis@redis:6379",
    CORS_ORIGIN: "http://localhost:5173",
    ACCESS_TOKEN_TTL: "15m",
    REFRESH_TOKEN_DAYS: "30",
    COOKIE_SECURE: "false",
    COOKIE_SAME_SITE: "lax",
    ADMIN_EMAIL: "admin@sorenwinslow.local",
    ADMIN_PASSWORD: "MySecretPassword123!",
    OPENROUTER_MODEL: "meta-llama/llama-3.1-8b-instruct"
  },
  generated: {
    JWT_SECRET: secret,
    REFRESH_TOKEN_SECRET: secret
  }
});

console.log("");
console.log("Dev env is ready. Add backend/.env OPENROUTER_API_KEY for real AI generation.");
