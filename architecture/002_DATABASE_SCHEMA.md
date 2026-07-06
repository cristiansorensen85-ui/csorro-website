# Sorro Database Schema v1

This database mirrors the OS navigation.

## Identity
- `profiles` — public/private user profile data connected to Supabase Auth.
- `plans` — Free, Creator, Studio, Business, Enterprise.
- `subscriptions` — active plan for each user or workspace.

## Workspaces
- `workspaces` — company/client/team/private hub.
- `workspace_members` — users invited to a workspace.
- `workspace_roles` — owner/admin/manager/member/guest/custom roles.
- `workspace_permission_overrides` — per-person permission overrides.

## Projects
- `projects` — work inside a workspace.
- `project_members` — users assigned to a project.
- `project_permission_overrides` — project-specific overrides.

## Work modules
- `tasks`
- `task_comments`
- `chat_rooms`
- `chat_room_members`
- `chat_messages`
- `assets`
- `whiteboards`
- `activity_events`
- `notifications`
- `invites`

## RLS principle

Users can only read data if they are:
- the owner,
- a workspace member,
- a project member,
- or explicitly invited through a private room/member table.

Public showcase data is opt-in only.
