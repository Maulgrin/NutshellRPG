local TRACKED_PATHS = {
  "skills.endurance",
  "skills.power",
  "strikes.taken",
  "strain.taken",
  "strain.enabled"
}

local SKILL_PATHS = {
  "skills.closecombat",
  "skills.rangedcombat",
  "skills.perception",
  "skills.survival",
  "skills.endurance",
  "skills.fitness",
  "skills.persuasion",
  "skills.expertise",
  "skills.power",
  "skills.skulduggery",
  "skills.operate"
}

local function toInteger(value, defaultValue)
  local nValue = tonumber(value)
  if not nValue then
    return defaultValue or 0
  end
  return math.floor(nValue)
end

local function getNonNegativeInteger(nodeChar, path)
  local nValue = toInteger(DB.getValue(nodeChar, path, 0), 0)
  return math.max(0, nValue)
end

local function ensureNumber(nodeChar, path, value)
  if DB.getValue(nodeChar, path, nil) == nil then
    DB.setValue(nodeChar, path, "number", value)
  end
end

local function ensureString(nodeChar, path, value)
  if DB.getValue(nodeChar, path, nil) == nil then
    DB.setValue(nodeChar, path, "string", value)
  end
end

local function ensureDefaults(nodeChar)
  ensureNumber(nodeChar, "strikes.taken", 0)
  ensureNumber(nodeChar, "strikes.max", 0)
  ensureNumber(nodeChar, "strikes.remaining", 0)

  ensureNumber(nodeChar, "strain.enabled", 0)
  ensureNumber(nodeChar, "strain.taken", 0)
  ensureNumber(nodeChar, "strain.max", 0)
  ensureNumber(nodeChar, "strain.remaining", 0)

  ensureString(nodeChar, "powertheme", "")
  ensureString(nodeChar, "gear", "")

  for _, path in ipairs(SKILL_PATHS) do
    ensureNumber(nodeChar, path, 0)
  end
end

local function setControlVisible(control, visible)
  if control then
    control.setVisible(visible)
  end
end

local function updateStrainVisibility(nodeChar)
  local bEnabled = DB.getValue(nodeChar, "strain.enabled", 0) == 1

  setControlVisible(strain_max_label, bEnabled)
  setControlVisible(strain_max, bEnabled)
  setControlVisible(strain_taken_label, bEnabled)
  setControlVisible(strain_taken, bEnabled)
  setControlVisible(strain_left_label, bEnabled)
  setControlVisible(strain_left, bEnabled)
end

function updateDerived()
  local nodeChar = getDatabaseNode()
  if not nodeChar then
    return
  end

  local nEndurance = toInteger(DB.getValue(nodeChar, "skills.endurance", 0), 0)
  local nPower = toInteger(DB.getValue(nodeChar, "skills.power", 0), 0)
  local nStrikesTaken = getNonNegativeInteger(nodeChar, "strikes.taken")
  local nStrainTaken = getNonNegativeInteger(nodeChar, "strain.taken")

  DB.setValue(nodeChar, "strikes.taken", "number", nStrikesTaken)
  DB.setValue(nodeChar, "strain.taken", "number", nStrainTaken)

  local nStrikesMax = 4 + nEndurance
  local nStrikesLeft = math.max(0, nStrikesMax - nStrikesTaken)
  DB.setValue(nodeChar, "strikes.max", "number", nStrikesMax)
  DB.setValue(nodeChar, "strikes.remaining", "number", nStrikesLeft)

  local nStrainMax = 4 + nPower
  local nStrainLeft = math.max(0, nStrainMax - nStrainTaken)
  DB.setValue(nodeChar, "strain.max", "number", nStrainMax)
  DB.setValue(nodeChar, "strain.remaining", "number", nStrainLeft)

  updateStrainVisibility(nodeChar)
end

function onInit()
  local nodeChar = getDatabaseNode()
  if not nodeChar then
    return
  end

  ensureDefaults(nodeChar)
  for _, path in ipairs(TRACKED_PATHS) do
    DB.addHandler(DB.getPath(nodeChar, path), "onUpdate", updateDerived)
  end

  updateDerived()
end

function onClose()
  local nodeChar = getDatabaseNode()
  if not nodeChar then
    return
  end

  for _, path in ipairs(TRACKED_PATHS) do
    DB.removeHandler(DB.getPath(nodeChar, path), "onUpdate", updateDerived)
  end
end
