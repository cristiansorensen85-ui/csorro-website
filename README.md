# CSorro Website + OS Base

Clean base build for CSorro.

## What is included

- `index.html` — public product-first homepage.
- `public/` — source media, images, CSS and CV PDF.
- `os/` — CSorro OS preview/app pages.
- `dist/` — prebuilt static site output for hosts that deploy from `dist`.
- `build.js` — static build script that rebuilds `dist` from `index.html`, `public/` and `os/`.
- `docs/PROJECT_NOTES.md` — consolidated project notes.

## Deploying

If your host deploys from the repository root, upload everything in this ZIP.

If your host deploys from `dist`, upload or point the host to the `dist/` folder.

## Rebuilding dist

```bash
npm install
npm run build
```

This will recreate `dist/` from the source files.

## Clean-up notes

Scattered `BUILD_*.md`, upload instruction files and old loose deployment notes have been removed. Important notes are consolidated in `docs/PROJECT_NOTES.md`.
