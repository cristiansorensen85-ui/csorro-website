# Build 056 — Workspace Storage Architecture

This build reorganises the platform around workspace-owned storage.

## Product changes
- Assets is now treated as Workspace Storage.
- Sidebar now points to Storage.
- `/os/app/storage/` adds the new storage control page.
- `/os/app/assets/` redirects to Storage for backwards compatibility.
- Studio reviews now describe uploads as workspace storage items linked to projects.
- Project Hub files copy now explains linked storage instead of project-owned duplicates.

## Backend migration
Run:

```sql
 database/migrations/006_workspace_storage_architecture.sql
```

## Architecture principle
Workspaces own files and storage limits. Projects link to files. A file can be used by multiple projects without duplicate uploads.

## Feature direction
- Workspace libraries: Project Media, Brand Kit, Client / Guest Review, Knowledge & Docs, Templates, Archive, Trash.
- Storage permissions can be set by role or per user.
- Studio comments attach to files/versions.
- Workspace storage usage supports pricing tiers.
