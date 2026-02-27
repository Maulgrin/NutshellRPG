# Nutshell RPG System

Foundry VTT system implementation for **Nutshell RPG**.

- Version: `1.0.0`
- Compatibility: minimum Foundry `12`, verified through `13`

## Features

- Actor types: `character` and `npc`
- Shared data model for both actor types:
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
- Derived values:
  - `strikes.max = 4 + endurance`
  - `strikes.remaining = max - taken` (minimum `0`)
- Unified actor sheet with:
  - Name, strikes, power theme, and gear
  - Skill grid with per-skill roll buttons
  - Action buttons for `Ranged Attack` and `Close Combat Opposed`
  - Theme selector (`Steampunk`, `Matrix`, `Sci-Fi`, `Cthulhu`)
- Roll helpers and chat cards:
  - Generic skill roll: `2d6 + skill`
  - Ranged attack: `2d6 + rangedCombat`
  - Close combat opposed: `2d6 + closeCombat`
  - Chat card output includes dice, modifier, total, TN, result, difference, and strikes when applicable
- Degrees-of-success to strikes:
  - Difference `0-1`: 1 strike
  - Difference `2-4`: 2 strikes
  - Difference `5-7`: 3 strikes
  - Difference `8+`: 4 strikes
- GM-mediated socket flow for non-GM users:
  - Players request adjudication from the active GM
  - Active GM selects/enters target number and resolves the roll
- Included compendiums:
  - `Reference Charts` (JournalEntry)
  - `NPC Templates` (Actor): `Bandit`, `Guard`, `Beast`

## Installation

1. Place this repository at `Data/systems/nutshell` in your Foundry data directory.
2. Start Foundry and create or launch a world using **Nutshell RPG**.
3. Join that world as GM at least once to seed any missing `Reference Charts` entries.

## Usage Notes

- Non-GM users can click roll buttons, but roll resolution is handled by the active GM.
- Sheet theme preference is client-scoped and can be changed from the actor sheet.
- The `packs/reference-charts.db` file may be empty in source control; missing chart entries are created automatically on startup by the active GM.

## Repository Layout

- `system.json` - system manifest
- `module/nutshell.js` - actor data model, sheet registration, theme setting, compendium seeding
- `module/rolls.js` - roll helpers, chat card rendering, GM socket handling
- `templates/actor/character-sheet.hbs` - unified actor sheet template
- `styles/nutshell.css` - sheet and chat card styling, including theme variants
- `packs/reference-charts.db` - reference chart compendium
- `packs/npc-templates/*.json` - actor templates for quick NPC creation
