# CSorro OS Design System 1.0

## Theme tokens
Colours are driven by `theme-engine.css` and component guardrails are in `design-system.css`.

Core tokens:
- `--cs-bg`
- `--cs-surface`
- `--cs-card`
- `--cs-border`
- `--cs-text`
- `--cs-muted`
- `--cs-accent`
- `--cs-accent-2`
- `--cs-radius`

## Layout rules
- Sidebar must remain consistent across OS pages.
- Tabs should stay on one row and scroll horizontally if needed.
- Important project screens should avoid overlap at 1366px width and above.
- Whiteboard must be treated as a work area, not a small widget.

## Components
Reusable CSS classes added in Build 051:
- `.cs-card`
- `.cs-btn`
- `.cs-tabs`
- `.cs-field`
- `.cs-empty`
- `.cs-skeleton`
- `.cs-kpi-row`
- `.cs-calm-list`

## Build rule
Do not create one-off button/card/form styles unless the design system is missing a required pattern.
