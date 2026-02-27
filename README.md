# Nutshell RPG System

A Foundry VTT system for Nutshell RPG.

- Version: `1.0.0`
- Compatibility: minimum Foundry `12`, verified through `13`

## Current Features

- Actor types: `character` and `npc`
- Shared actor data model for both types:
  - `strikes` (`taken`, derived `max`, derived `remaining`)
  - `powerTheme`
  - `gear`
  - `skills`:
    - `closeCombat`
    - `rangedCombat`
    - `perception`
    - `survival`
    - `endurance`
    - `fitness`
    - `persuasion`
    - `expertise`
    - `power`
    - `skulduggery`
    - `operate`
- Derived strikes values:
  - `max = 4 + endurance`
  - `remaining = max - taken` (minimum `0`)
- Unified actor sheet for both `character` and `npc`:
  - Name
  - Strikes (max, taken, remaining)
  - Power Theme
  - Gear
  - Skills table with per-skill roll button
  - Action buttons for `Ranged Attack` and `Close Combat Opposed`
- Roll helpers with formatted chat cards:
  - Generic skill roll: `2d6 + skill`
  - Ranged attack: `2d6 + rangedCombat`
  - Close combat opposed: `2d6 + closeCombat`
  - Chat output includes dice, modifier, total, target number, result, difference, and strikes (when applicable)
- Degree-of-success to strikes mapping:
  - Difference `0-1`: 1 strike
  - Difference `2-4`: 2 strikes
  - Difference `5-7`: 3 strikes
  - Difference `8+`: 4 strikes
- GM-mediated roll flow for non-GM users via system socket:
  - Players request GM target selection/entry for all roll types
  - Active GM resolves and posts the roll result
- Included compendiums:
  - `Reference Charts` (JournalEntry): target numbers and degrees of success
  - `NPC Templates` (Actor): Bandit, Guard, Beast

## File Layout

- `system.json`
- `module/nutshell.js`
- `module/rolls.js`
- `templates/actor/character-sheet.hbs`
- `styles/nutshell.css`
- `packs/reference-charts.db`
- `packs/npc-templates/*.json`

## Installation

1. Place this repository as `Data/systems/nutshell` in your Foundry data directory.
2. Create or launch a world using the **Nutshell RPG** system.
3. Join as GM at least once to allow automatic seeding of missing Reference Charts entries.

## Notes

- The `reference-charts.db` file may be empty in source control; missing chart entries are created automatically by the active GM on world startup.
