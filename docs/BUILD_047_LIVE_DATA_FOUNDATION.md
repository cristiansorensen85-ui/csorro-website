# Build 047 — Live Data Foundation

This build starts the frontend/backend bridge.

## Added
- `/os/app/platform-config.js` for Supabase public URL + anon key.
- `/os/app/platform-client.js` as the shared Supabase client wrapper.
- `/os/app/login/` for sign in / sign up UI.
- `/os/app/settings/platform/` for backend setup status.
- Demo-mode fallback so the OS UI does not break if Supabase keys are not added yet.

## Next setup
1. In Supabase, go to Project Settings → API.
2. Copy Project URL and anon public key.
3. Paste into `/os/app/platform-config.js`.
4. Upload/commit to GitHub.
5. Test `/os/app/settings/platform/` and `/os/app/login/`.

Never put the Supabase `service_role` key in frontend files.
