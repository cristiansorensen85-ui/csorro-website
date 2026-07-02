# CSorro OS Platform Architecture

CSorro OS is split into three parts:

1. **Frontend** — the website and OS interface hosted on Cloudflare Pages.
2. **Supabase Backend** — authentication, database, storage, realtime and permissions.
3. **Stripe Billing** — subscriptions, invoices, coupons, referral codes and plan limits.

## Core hierarchy

```text
User Account
  ↓
Workspace Membership
  ↓
Workspace
  ↓
Project
  ↓
Tasks / Chat / Files / Whiteboards / Notes / Approvals / Activity
```

## Product rule

**Privacy by default. Visibility by choice.**

Nothing is public unless the owner explicitly publishes a profile, workspace showcase or project showcase.

## Messaging layers

```text
Global Messages
- Personal inbox
- External enquiries
- Direct messages

Workspace Channels
- Company/team chat
- Announcements
- Internal workspace communication

Project Chat
- Work-specific discussion
- Linked tasks, files, whiteboards and approvals

Private Project Rooms
- Invite-only project rooms
- Hidden from users who are not members
```

## Storage layers

```text
My Assets
- Private to the user

Workspace Assets
- Visible to selected workspace members

Project Assets
- Visible to selected project members

Showcase Assets
- Public only when deliberately published
```
