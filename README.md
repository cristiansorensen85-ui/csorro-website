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


## Build 050

Theme Engine and Focus Mode added. Test Settings > Appearance and Ctrl + Shift + F inside the OS.


## Build 051 - Design System Foundation

Added the first reusable CSorro OS design system layer:

- `/os/app/design-system.css` for layout/card/button/form/empty-state guardrails.
- `/os/app/design-system/` preview page for component reference.
- `/docs/Product_Principles.md` and `/docs/Design_System.md`.

Purpose: keep future pages cleaner, calmer and more consistent before continuing deeper backend integration.


## Build 052 – Live Workspace Engine
Run `database/migrations/002_workspace_engine_rpc.sql` in Supabase, configure `/os/app/platform-config.js`, then test `/os/app/login/` and `/os/app/workspace/new/`.
