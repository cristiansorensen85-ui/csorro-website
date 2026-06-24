# C Sorro Portfolio - Cloudflare Pages

Self-hosted Astro version of the portfolio site for `www.csorro.co.uk`.

## Local setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Cloudflare Pages settings

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20` or higher

## Important notes

- Replace `public/cv.pdf` with the final CV PDF you want visitors to download.
- The contact form currently uses a static `mailto:` fallback, so it opens the visitor's email app and sends to `contact@csorro.co.uk`.
- B12 scripts and badge have been removed/stubbed so the site can run without B12.
- Images are still loaded from B12 CDN URLs inside the Astro files. They should work, but for long-term safety download them later and place them in `public/images/`.
