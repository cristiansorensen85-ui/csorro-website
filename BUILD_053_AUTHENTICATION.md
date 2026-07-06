# Build 053 — Authentication Foundation

## Test goal
A real user should be able to start using Sorro authentication through Supabase.

## Supabase step
Run this new migration in a **new SQL query**:

```text
database/migrations/003_auth_profile_foundation.sql
```

## Configure frontend
Edit:

```text
/os/app/platform-config.js
```

Add your Supabase Project URL and anon/public key from Supabase → Project Settings → API.

## Test pages
```text
/os/app/login/
/os/app/settings/platform/
/os/app/
```

## What to test
- Create account
- Check email if confirmation is enabled
- Sign in
- Sign out
- Refresh after login
- Forgot password flow
- Password reset link opens `/os/app/login/?mode=recovery`

## Supabase Auth URL settings
In Supabase → Authentication → URL Configuration, add your site URL and redirect URLs, for example:

```text
https://www.csorro.co.uk
https://www.csorro.co.uk/os/app/login/
https://www.csorro.co.uk/os/app/login/?mode=recovery
```
