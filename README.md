# Statik.Flick private-admin backend starter

This isolated starter kit adds a private owner/admin area while keeping the existing GitHub Pages `index.html` and music player untouched. It is a scaffold, not a deployed or independently audited production system.

## Architecture
- Frontend remains at `https://statikflick.github.io`.
- Supabase Auth handles the owner account and sessions.
- Postgres tables are protected by grants and Row Level Security (RLS).
- Supabase Edge Function `admin-api` verifies the signed-in user and the exact owner UUID before privileged actions.
- Browser config contains only the project URL and publishable/anon key. Never put a service-role/secret key in a browser file or repository.

## Setup
1. Create a Supabase project.
2. In Supabase Auth settings, disable public sign-ups; create the owner account manually. Enable MFA if available.
3. Run `supabase/migrations/202610090001_private_admin.sql` in SQL Editor.
4. In Authentication > Users, copy the owner account UUID. Run this SQL after replacing the placeholder:
   ```sql
   insert into private.owner_users(user_id) values ('REPLACE_WITH_OWNER_AUTH_UUID') on conflict do nothing;
   ```
5. Fill `admin-config.js` with your Supabase project URL and publishable/legacy anon key. Those values are public; RLS is what protects data.
6. Upload `admin.html`, `admin.js`, and `admin-config.js` to the root of `StatikFlick/statikflick.github.io`. Do not replace `index.html`. Open `https://statikflick.github.io/admin.html`.
7. Install Supabase CLI, then run from this folder:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set OWNER_USER_ID=YOUR_OWNER_AUTH_UUID ALLOWED_ORIGINS=https://statikflick.github.io
   supabase functions deploy admin-api
   ```

The hosted Supabase Edge Function normally has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` available as legacy runtime variables. If your project/runtime does not expose the latter, set a server-side secret named `BACKEND_SERVICE_KEY` to the service-role/secret key and change the one indicated line in `index.ts` to read it. Never put it in GitHub Pages files.

For local testing, add the exact localhost origin to `ALLOWED_ORIGINS`, separated by commas. Do not use `*` in production. Keep JWT verification enabled in `supabase/config.toml`.

## Included behavior
- Private owner sign-in; no public signup form.
- Owner-only Edge Function actions: `whoami`, `list_settings`, `upsert_setting`, `list_audit`.
- Settings editor and audit table scaffold.
- Exact-origin CORS allow-list and database-backed request limiting.
- RLS and grants restricting browser access.

## Smoke tests
- Signed-out requests fail.
- A different authenticated account fails the owner check.
- Owner can sign in, list settings and save a JSON setting.
- `anon` and non-owner users cannot access private admin tables.
- Repeated requests eventually receive HTTP 429.
- No service-role key exists in any browser asset or Git history.
- Existing homepage, music file, visualizer, Chess.com and Lanyard widgets still work.

GitHub Pages is static hosting and cannot run server-side code itself. It also cannot set every HTTP response security header directly; if strict CSP/HSTS headers are required, assess a compatible proxy/hosting layer. Before production, test in a separate Supabase project, review RLS and the function, enable MFA, and rotate any credential that was ever published.
