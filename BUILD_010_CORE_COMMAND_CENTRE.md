# Build 010 — CORE Command Centre

## Added

- CORE side panel
- Ask CORE input
- Suggested questions
- Ctrl/Cmd + K command shortcut
- OS-first search behaviour
- Mock grouped results for Projects, People, Assets and Knowledge
- Workspace-aware response from localStorage data
- Search box opens CORE instead of being a dead input

## Important

This is still front-end only.
CORE is not connected to a backend yet.
The behaviour is mocked to demonstrate how CORE should work:
OS data first, connected apps later, web last.

## Test

1. Visit /os/app/
2. Click the search bar
3. Ask: "Find latest thumbnail"
4. Ask: "What should I do first?"
5. Ask: "Ryan"
6. Press Ctrl + K
