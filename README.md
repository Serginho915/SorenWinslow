# Soren Winslow Review

Literary and entertainment review blog: a sharp “Michelin Guide” for books and TV series.

## Local Docker Run

1. Copy env files:
   `cp .env.example .env`
   `cp backend/.env.example backend/.env`
   `cp frontend/.env.example frontend/.env`
2. Generate secrets:
   `npm --prefix backend run generate-secrets`
3. Add `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, and optionally `OPENROUTER_API_KEY` to `backend/.env`.
4. Start everything:
   `docker compose up --build -d`
5. Open frontend at `http://localhost:5173`.

## Superadmin

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in env, then run:
`docker compose run --rm admin-seed`

The hidden admin page is `/admin`. There is no public Admin link.

## OpenRouter

Set `OPENROUTER_API_KEY` in `backend/.env`. The default model is `meta-llama/llama-3.1-8b-instruct`.

## Endpoints

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/admin/posts`
- `POST /api/admin/posts`
- `PUT /api/admin/posts/:id`
- `DELETE /api/admin/posts/:id`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/ai/generate-now`
- `POST /api/subscribers`
- `GET /api/health`

## Production

Copy `.env.production.example`, `backend/.env.production.example`, and `frontend/.env.example`. Configure `CORS_ORIGIN`, secure cookies, database credentials, Redis password, and OpenRouter key. Run with:
`docker compose -f docker-compose.prod.yml up --build -d`

## Database And Backup

Runtime data is stored in PostgreSQL volume `postgres-data`. Backup example:
`docker compose exec postgres pg_dump -U soren sorenwinslow > backup.sql`
