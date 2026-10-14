# Security checklist

- [ ] No service-role/secret key in browser files, source maps, artifacts, or Git history. Rotate anything previously exposed.
- [ ] Public sign-ups disabled; owner created manually; MFA enabled where available.
- [ ] Auth Site URL and redirect URLs are exact.
- [ ] Run migration in staging; verify grants and RLS separately.
- [ ] `private` schema is not exposed through Supabase Data API settings.
- [ ] Owner row seeded manually; clients cannot self-promote.
- [ ] JWT verification remains enabled; function validates token and exact owner UUID.
- [ ] CORS uses exact allowed origins, never `*` in production.
- [ ] Rate limiter tested; logs contain no passwords or tokens.
- [ ] Existing home page, audio file, visualizer and external widgets still work.
- [ ] Test owner, signed-out visitor and a separate non-owner account.
- [ ] GitHub Pages cannot set all HTTP response security headers directly; evaluate a compatible proxy if strict CSP/HSTS headers are required.
