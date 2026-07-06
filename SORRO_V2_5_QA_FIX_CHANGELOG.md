# Sorro v2.5 QA Fix Update

Full review pass applied before moving beyond v2.5.

## Fixed
- Removed stale visible v2.1/v2.2/v2.4 release labels from the active homepage and OS shell.
- Standardised public footer wording to `Sorro OS by CSorro`.
- Tightened naming rules: CSorro is the company, Sorro OS is the product, Sorro Assistant / AI Assistant is the helper layer.
- Replaced old orange `logo.svg` wordmark with the blue/cyan Sorro OS identity mark to match the reference direction.
- Updated marketing pages to use the current v2.5 cache key.
- Checked static route references and rebuilt `dist/`.

## QA notes
- `npm run build` passes.
- Static HTML asset references were checked.
- The project remains a static prototype foundation, not a fully connected backend SaaS application.
