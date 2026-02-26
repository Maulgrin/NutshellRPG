# Nutshell RPG System

A Foundry VTT system for Nutshell RPG, compatible with Foundry v12+.

## Included Features

- Character actor type with system data model fields for strikes, power theme, gear, and skills.
- Derived strikes values:
  - `max = 4 + endurance`
  - `remaining = max - taken`
- Character sheet template with:
  - Name header
  - Strikes section (max, taken, remaining)
  - Power Theme field
  - Gear notes area
  - Skills table with per-skill roll buttons
  - Quick action buttons for ranged and opposed close combat
- Roll helpers with formatted chat output:
  - Generic skill roll (`2d6 + skill` with prompted TN)
  - Ranged attack (`2d6 + rangedCombat`, default TN 8, overridable)
  - Close combat opposed (`2d6 + closeCombat` vs prompted defender total; ties favor attacker)

## File Layout

- `system.json`
- `module/nutshell.js`
- `module/rolls.js`
- `templates/actor/character-sheet.hbs`
- `styles/nutshell.css`

## Notes

Install this folder as `systems/nutshell` in your Foundry data directory, then enable the system for a world.