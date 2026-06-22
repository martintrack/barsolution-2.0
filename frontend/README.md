# Kobra Frontend

Next.js app for the Kobra MVP.

## Routes

- `/`: commercial landing.
- `/dashboard`: producer-focused revenue dashboard.

## Current state

This app uses computed mock data from `lib/mock-data.ts`, but the Supabase client and repository layer are already scaffolded.

## Supabase

1. Create `frontend/.env.local` from `.env.example`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Add `SUPABASE_SECRET_KEY` only for server-side development (sb_secret_...).
4. Run the SQL migration in `../backend/supabase/migrations/001_initial_schema.sql`.
