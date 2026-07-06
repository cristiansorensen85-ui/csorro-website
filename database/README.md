# Sorro Database

## Stage 1
Run this first inside Supabase SQL Editor:

```text
database/migrations/001_core_platform_schema.sql
```

This creates the first platform backend:
- profiles
- plans
- subscriptions
- workspaces
- workspace members
- roles/permissions
- projects
- project members
- tasks
- chat rooms/messages
- assets
- whiteboards
- notifications
- invites
- storage buckets
- basic RLS policies

## Important
This is the development project schema for `csorro-os-dev`.
Do not run on a production project until tested.


## Stage 3
Run this after Stage 2:

```text
database/migrations/003_auth_profile_foundation.sql
```

This improves real account testing:
- creates/repairs user profiles after Supabase Auth signup
- creates a Free subscription record for new users
- adds safe subscription read policies
- adds `ensure_user_profile()` for the frontend login flow

## Migration 006 — Workspace Storage Architecture
Run `database/migrations/006_workspace_storage_architecture.sql` after `005_studio_review_foundation.sql`.

This adds the future-proof storage model:
- workspace-owned storage libraries
- file/project linking instead of file duplication
- file versions
- timestampable asset comments
- storage permissions
- workspace usage tracking
- private `workspace-storage` bucket

Storage principle: workspaces own storage; projects link to files; users see files through workspace/project membership and permissions.
