# CSorro OS Database

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
