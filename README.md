# CSorro Website + OS Base

## Latest: Build 046 Platform Foundation

This base includes the frontend prototype plus a new Supabase backend architecture pack.

New backend files:
- `architecture/` — platform/database roadmap and system design
- `database/migrations/001_core_platform_schema.sql` — first Supabase SQL migration
- `.env.example` — environment variable template

Run the SQL only in the `csorro-os-dev` Supabase project first.

---

# CSorro Build 045 – Clickable Intelligence

Adds linked blocker / intelligence interactions. Current Blocker opens the related approval or priority task. CORE suggestions, overview priority cards and activity items jump to their source panel and highlight the target.
