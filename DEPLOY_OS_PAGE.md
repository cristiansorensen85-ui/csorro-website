# Deploy CSorro OS Page

This package adds a real `/os/` page to your existing CSorro website.

## What changed

- Added `/os/index.html`
- Added `/os/styles.css`
- Updated homepage navigation with `CSorro OS`
- Updated hero button to `Launch CSorro OS`
- Updated `build.js` so `/os/` is copied into `/dist`

## To test locally

```bash
npm install
npm run build
```

Then open:

```text
dist/index.html
dist/os/index.html
```

## To deploy

Upload the full contents of the updated site to your hosting provider.

The live page should become:

```text
https://www.csorro.co.uk/os/
```

## Important

Your main website remains intact. This only adds the OS entry point and a new `/os/` landing page.
