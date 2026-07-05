# Build 052 – Live Workspace Engine

Purpose: begin replacing demo workspace data with Supabase-backed workspace creation while preserving demo fallback.

## Test paths
- `/os/app/login/`
- `/os/app/workspace/new/`
- `/os/app/`

## Supabase step
Run `database/migrations/002_workspace_engine_rpc.sql` after `001_core_platform_schema.sql`.

## What this build does
- Adds a secure workspace creation RPC.
- Updates the workspace setup wizard to save live workspaces when Supabase is configured.
- Keeps local/demo mode safe if Supabase keys are not configured.
- Loads workspaces into Mission Control and the sidebar switcher from Supabase where available.
