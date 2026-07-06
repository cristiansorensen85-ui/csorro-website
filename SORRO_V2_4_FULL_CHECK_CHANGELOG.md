# Sorro v2.4 Full Check + Fix Update

## Checked
- Ran the static build successfully with `npm run build`.
- Checked all source HTML pages for missing local CSS, JS, image and page links.
- Checked all source JavaScript files with `node --check`.
- Checked same-page and cross-page anchors used by navigation.
- Reviewed version labels that still showed the old v2.2 release name.

## Fixed
- Added missing founder social icon assets so the Founder page no longer has broken images.
- Corrected the Pricing contact link to point to the Founder contact section.
- Replaced placeholder `#` actions in Calendar, Knowledge and Templates with safe module links.
- Updated root page titles and release labels to v2.4.
- Updated `package.json` name and version to match the v2.4 core platform release.
- Rebuilt `dist/` after fixes.

## Result
This is the checked v2.4 handoff build to use before starting v2.5.
