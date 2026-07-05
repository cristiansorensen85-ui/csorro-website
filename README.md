# CSorro OS Base

## Latest: Build 056 – Workspace Storage Architecture

This is the current base ZIP for CSorro OS.

Includes:
- Product-led homepage and founder page
- OS shell and Mission Control
- Project Hub, tasks, chat, approvals, whiteboard and activity UI
- Login/signup foundation
- Supabase connection layer with demo-mode fallback
- Workspace Modules settings
- Professional Network feed foundation
- Studio Review mini-test
- Workspace Storage architecture
- Theme/focus mode and design-system guardrails

## New in Build 056
- Assets has moved conceptually to **Workspace Storage**.
- `/os/app/storage/` is the new storage control page.
- `/os/app/assets/` redirects to Storage for compatibility.
- Sidebar now uses Storage instead of Assets.
- Studio uploads now point toward workspace-owned storage linked to projects.
- Project Hub file wording now explains linked storage, not duplicated project files.
- Migration 006 adds storage libraries, file versions, storage permissions and workspace usage tracking.

## Supabase migration order
Run these in Supabase SQL Editor, in order:

1. `database/migrations/001_core_platform_schema.sql`
2. `database/migrations/002_workspace_engine_rpc.sql`
3. `database/migrations/003_auth_profile_foundation.sql`
4. `database/migrations/004_modules_network_foundation.sql`
5. `database/migrations/005_studio_review_foundation.sql`
6. `database/migrations/006_workspace_storage_architecture.sql`

## Backend config
Add your Supabase URL and anon key in:

`os/app/platform-config.js`

The app will continue working in demo mode if these are blank.

## Build

```bash
npm run build
```

Output goes to `/dist` for Cloudflare Pages.
