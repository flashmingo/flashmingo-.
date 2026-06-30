# Supabase Setup for FlashMingo

## Local Development

1. Install Supabase CLI: `brew install supabase/tap/supabase`
2. Start local stack: `supabase start`
3. Apply migrations: `supabase db reset`
4. Generate TypeScript types:
   ```
   npx supabase gen types typescript --local > src/lib/types/database.ts
   ```

## Google OAuth Configuration (Supabase Dashboard)

1. Go to **Authentication → Providers → Google**
2. Enable Google provider
3. Set **Client ID** and **Client Secret** from Google Cloud Console
4. Add **Authorized redirect URI**: `https://<your-domain>/auth/callback`
5. For local dev: `http://localhost:3000/auth/callback`

## Google Cloud Console Setup

1. Create an OAuth 2.0 Client ID (Web Application)
2. Add authorized origins: `https://<your-domain>` and `http://localhost:3000`
3. Add redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`

## Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=https://<your-domain>   # Used for OAuth redirects
```

## Key Schema Notes

- `profiles` rows are created automatically by `handle_new_user()` trigger
- `decks.card_count` is maintained by `update_deck_card_count()` trigger
- `districts.domain` is used to auto-assign and auto-approve users
- All tables have RLS enabled — the anon key cannot bypass policies
- `audit_logs` is append-only (no UPDATE/DELETE RLS policies)
