# Money DOES Grow on Trees!

A modular incremental farming game.

## Changes in this version

- **Modular codebase**: split into `modules/` (sprites, sound, UI, tree, pest, config).
- **localStorage autosave**: money, keys, upgrades, unlocked trees, active pet/relic, and current contract are saved automatically.
- **Better early pacing**: starts with $300; gold-tree unlock cost lowered to $220.
- **Gene lab rework**: fusing two matching types gives a bonus; mismatched types give a penalty.
- **Contracts**: randomize type, quantity, and reward after each completion.
- **Pet/relic differentiation**: Bee now auto-harvests nearby fallen cash; Tome remains growth speed.
- **Sickle relic fixed**: now applies +25% sell value.
- **Mobile touch controls**: drag on canvas to move.
- **UI polish**: Escape/backdrop close modals, disabled buttons when broke, "can't afford" flash, mobile layout fixes.
- **Accessibility**: aria-labels on icon buttons.

## Controls

- Desktop: WASD / Arrow keys to move.
- Mobile: drag anywhere on the game area to move.
- Press Escape to close modals.
- Ctrl+S to force save.
