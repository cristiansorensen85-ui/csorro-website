# Build 055 — Studio Review Mini Test

Adds the first visible Studio review module for Sorro.

## Frontend
- New `/os/app/studio/` page.
- Sidebar Studio navigation added across OS pages.
- Project Hub gets a Studio Review tab linking into the module.
- Upload-review UI for clips/images.
- Timestamped comments, versions, status changes and delete actions in local demo mode.
- Storage meter and Studio/Business plan positioning.

## Backend
- Adds `database/migrations/005_studio_review_foundation.sql`.
- Extends existing `production_reviews` and `production_review_comments`.
- Adds review versions, private share links and comment attachments.
- Creates a private `studio-media` Supabase Storage bucket.

## Test paths
- `/os/app/studio/`
- `/os/app/projects/production-hub/` → Studio Review tab
