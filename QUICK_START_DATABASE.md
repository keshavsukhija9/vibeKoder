# Quick start – local database (SQLite)

VibeCoder stores **users, playgrounds, template file contents, and star marks** in **SQLite** on disk. No hosted Postgres/Supabase is required for the app to run.

## 1. Environment (optional)

Create `.env` from [`.env.example`](./.env.example):

```env
JWT_SECRET=your-secret-at-least-32-chars-long
```

For production, always set a strong `JWT_SECRET`. Development falls back to a built-in default if unset (not safe for production).

## 2. Where data lives

| Data | Default location |
|------|------------------|
| SQLite (users, playgrounds, etc.) | `.vibecoder/vibecoder.db` |
| LanceDB (RAG, per-playground tables) | `.vibecoder/lancedb/` |

Override the DB file with:

```env
DATABASE_PATH=/absolute/or/relative/path/to/vibecoder.db
```

Override LanceDB directory with:

```env
VIBECODER_LANCEDB_PATH=.vibecoder/lancedb
```

These paths are typically **gitignored** (see `.gitignore`).

## 3. First run

Start the app:

```bash
npm install
npm run dev
```

On first API access that needs the database, the app creates `.vibecoder/` (if needed) and applies the schema from [`lib/db/schema.ts`](./lib/db/schema.ts).

## 4. Verify

- Register or sign in at `/auth/sign-in`.
- Create a project on `/dashboard` and open the playground — data should persist across restarts.

## Legacy Supabase docs

An older **Supabase** schema and guides may still exist under [`supabase/`](./supabase/README.md). The **current** product path is **SQLite + JWT** as above; use Supabase only if you are maintaining a fork that wires it back in.

## More detail

- [README.md](./README.md) – env vars and Ollama models  
- [DATABASE_SCHEMA_SUMMARY.md](./DATABASE_SCHEMA_SUMMARY.md) – table overview  
