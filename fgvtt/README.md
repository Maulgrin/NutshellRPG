# Nutshell FG Draft

This folder contains a draft Fantasy Grounds Unity extension that replicates the Nutshell character sheet structure from this repository.

## Included

- `extension.xml`
- `campaign/record_char_nutshell.xml`
- `campaign/scripts/charsheet_nutshell.lua`
- `scripts/manager_nutshell.lua`
- `strings/strings.xml`

## Implemented behavior

- `Strikes` resource:
  - `max = 4 + skills.endurance`
  - `left = max - taken` (min `0`)
- `Strain` resource:
  - toggle via checkbox beside `STRIKES`
  - hidden when unchecked
  - `max = 4 + skills.power`
  - `left = max - taken` (min `0`)
- Core fields:
  - Name
  - Skills list
  - Power Theme
  - Gear

## Notes

- This is a draft implementation intended as a starting point for FG integration and styling.
- The windowclass is defined as `charsheet` with `merge="replace"` in `campaign/record_char_nutshell.xml`, so it is intended to replace the default CoreRPG character sheet when loaded.
