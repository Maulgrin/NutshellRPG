const SKILL_FIELDS = [
  { key: "closeCombat", label: "Close Combat" },
  { key: "rangedCombat", label: "Ranged Combat" },
  { key: "perception", label: "Perception" },
  { key: "survival", label: "Survival" },
  { key: "endurance", label: "Endurance" },
  { key: "fitness", label: "Fitness" },
  { key: "persuasion", label: "Persuasion" },
  { key: "expertise", label: "Expertise" },
  { key: "power", label: "Power" },
  { key: "skulduggery", label: "Skulduggery" },
  { key: "operate", label: "Operate" }
];

const SHEET_THEMES = {
  STEAMPUNK: "steampunk",
  MATRIX: "matrix",
  SCIFI: "scifi",
  CTHULHU: "cthulhu"
};

const SHEET_THEME_LABELS = {
  [SHEET_THEMES.STEAMPUNK]: "Steampunk",
  [SHEET_THEMES.MATRIX]: "Matrix",
  [SHEET_THEMES.SCIFI]: "Sci-Fi",
  [SHEET_THEMES.CTHULHU]: "Cthulhu"
};

const REFERENCE_CHARTS = [
  {
    name: "Target Number Chart",
    content: `<h2>Target Number Chart</h2>
<table>
<tr><th>Difficulty</th><th>Target Number</th></tr>
<tr><td>Simple</td><td>4+</td></tr>
<tr><td>Easy</td><td>6+</td></tr>
<tr><td>Average</td><td>8+</td></tr>
<tr><td>Difficult</td><td>10+</td></tr>
<tr><td>Challenging</td><td>12+</td></tr>
<tr><td>Extraordinary</td><td>14+</td></tr>
</table>`
  },
  {
    name: "Degrees of Success",
    content: `<h2>Degrees of Success</h2>
<p>Difference between roll total and Target Number:</p>
<table>
<tr><th>Difference</th><th>Strikes Inflicted</th></tr>
<tr><td>0&ndash;1</td><td>1 Strike</td></tr>
<tr><td>2&ndash;4</td><td>2 Strikes</td></tr>
<tr><td>5&ndash;7</td><td>3 Strikes</td></tr>
<tr><td>8+</td><td>4 Strikes</td></tr>
</table>`
  },
  {
    name: "Skill Descriptions",
    content: `<h2>Skill Descriptions</h2>
<ul>
<li><strong>Close Combat</strong> - Melee weapon and unarmed combat ability</li>
<li><strong>Ranged Combat</strong> - Any ranged combat</li>
<li><strong>Perception</strong> - Awareness of surroundings</li>
<li><strong>Survival</strong> - Operate and thrive within an environment (resource gathering, tracking, etc.)</li>
<li><strong>Endurance</strong> - Resist toxins and exertion</li>
<li><strong>Fitness</strong> - Swimming, climbing, jumping, sprinting, lifting, etc.</li>
<li><strong>Persuasion</strong> - Social, convince, seduce, negotiate</li>
<li><strong>Expertise</strong> - Build and repair things, applied knowledge</li>
<li><strong>Power</strong> - Willpower and morale, also magic if appropriate</li>
<li><strong>Skulduggery</strong> - Stealth, lock picking, sleight of hand and similar things</li>
<li><strong>Operate</strong> - Ride a horse, drive a carriage, vehicle, airplane, space craft</li>
</ul>
<p><strong>The Power Skill and Magic:</strong> If appropriate to the type of game the table has agreed on, pick a magical or magic-like theme for your Power Skill (nature, fire, telekinesis, divine, etc.).</p>`
  }
];

async function seedReferenceChartsCompendium() {
  const pack = game.packs.get("nutshell.reference-charts");
  if (!pack) return;

  await pack.getIndex();
  const existingNames = new Set(pack.index.map((entry) => entry.name));
  const missingCharts = REFERENCE_CHARTS.filter((chart) => !existingNames.has(chart.name));
  if (!missingCharts.length) return;

  const htmlFormat = CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
  const journals = missingCharts.map((chart) => ({
    name: chart.name,
    pages: [
      {
        name: chart.name,
        type: "text",
        text: {
          content: chart.content,
          format: htmlFormat
        }
      }
    ]
  }));

  const relockAfterCreate = pack.locked;
  if (relockAfterCreate) {
    await pack.configure({ locked: false });
  }

  try {
    await JournalEntry.createDocuments(journals, { pack: pack.collection });
  } finally {
    if (relockAfterCreate) {
      await pack.configure({ locked: true });
    }
  }
}

class NutshellCharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      strikes: new fields.SchemaField({
        max: new fields.NumberField({ required: false, nullable: false, initial: 0, integer: true, min: 0 }),
        taken: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true, min: 0 }),
        remaining: new fields.NumberField({ required: false, nullable: false, initial: 0, integer: true, min: 0 })
      }),
      powerTheme: new fields.StringField({ required: false, blank: true, initial: "" }),
      gear: new fields.StringField({ required: false, blank: true, initial: "" }),
      skills: new fields.SchemaField({
        closeCombat: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        rangedCombat: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        perception: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        survival: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        endurance: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        fitness: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        persuasion: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        expertise: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        skulduggery: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true }),
        operate: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true })
      })
    };
  }
}

class NutshellActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();
    if (!["character", "npc"].includes(this.type)) return;

    const endurance = Number(this.system.skills?.endurance ?? 0);
    const taken = Math.max(0, Number(this.system.strikes?.taken ?? 0));
    const maxStrikes = 4 + endurance;

    this.system.strikes.max = maxStrikes;
    this.system.strikes.remaining = Math.max(0, maxStrikes - taken);
  }
}

class NutshellActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["nutshell", "sheet", "actor"],
      width: 760,
      height: 740,
      submitOnChange: true,
      submitOnClose: true,
      resizable: true
    });
  }

  get template() {
    return "systems/nutshell/templates/actor/character-sheet.hbs";
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    const currentTheme = game.settings?.get("nutshell", "sheetTheme") ?? SHEET_THEMES.STEAMPUNK;
    context.system = this.actor.system;
    context.sheetTheme = currentTheme;
    context.themeOptions = Object.entries(SHEET_THEME_LABELS).map(([value, label]) => ({
      value,
      label,
      selected: value === currentTheme
    }));
    context.skills = SKILL_FIELDS.map(({ key, label }) => ({
      key,
      label,
      value: Number(this.actor.system.skills?.[key] ?? 0)
    }));
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Roll buttons should work even on non-editable sheets.
    html.find('[data-action="skill-roll"]').on("click", this._onSkillRoll.bind(this));
    html.find('[data-action="ranged-attack"]').on("click", this._onRangedAttack.bind(this));
    html.find('[data-action="close-opposed"]').on("click", this._onCloseOpposed.bind(this));
    html.find('[data-action="select-theme"]').on("change", this._onThemeChange.bind(this));
  }

  async _onSkillRoll(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    const roller = game.nutshell?.rolls?.genericSkillRoll ?? globalThis.NutshellRolls?.genericSkillRoll;
    if (!roller) return ui.notifications.error("Nutshell roll helpers are unavailable.");
    await roller(this.actor, skill);
  }

  async _onRangedAttack(event) {
    event.preventDefault();
    const roller = game.nutshell?.rolls?.rangedAttack ?? globalThis.NutshellRolls?.rangedAttack;
    if (!roller) return ui.notifications.error("Nutshell roll helpers are unavailable.");
    await roller(this.actor);
  }

  async _onCloseOpposed(event) {
    event.preventDefault();
    const roller = game.nutshell?.rolls?.closeCombatOpposed ?? globalThis.NutshellRolls?.closeCombatOpposed;
    if (!roller) return ui.notifications.error("Nutshell roll helpers are unavailable.");
    await roller(this.actor);
  }

  async _onThemeChange(event) {
    const currentTheme = game.settings?.get("nutshell", "sheetTheme") ?? SHEET_THEMES.STEAMPUNK;
    const selectedTheme = String(event.currentTarget?.value ?? currentTheme);
    if (!Object.values(SHEET_THEMES).includes(selectedTheme)) return;
    if (selectedTheme === currentTheme) return;

    await game.settings.set("nutshell", "sheetTheme", selectedTheme);
    this.render(true);
  }
}

Hooks.once("init", () => {
  game.nutshell = game.nutshell || {};
  game.settings.register("nutshell", "sheetTheme", {
    name: "Nutshell Sheet Theme",
    hint: "Visual theme used by Nutshell actor sheets.",
    scope: "client",
    config: false,
    type: String,
    choices: SHEET_THEME_LABELS,
    default: SHEET_THEMES.STEAMPUNK
  });

  CONFIG.Actor.documentClass = NutshellActor;
  CONFIG.Actor.dataModels = CONFIG.Actor.dataModels || {};
  CONFIG.Actor.dataModels.character = NutshellCharacterData;
  CONFIG.Actor.dataModels.npc = NutshellCharacterData;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("nutshell", NutshellActorSheet, {
    types: ["character", "npc"],
    makeDefault: true
  });
});

Hooks.once("ready", async () => {
  game.nutshell = game.nutshell || {};
  if (!game.nutshell.rolls && globalThis.NutshellRolls) {
    game.nutshell.rolls = globalThis.NutshellRolls;
  }

  if (!game.user.isGM) return;
  if (game.users.activeGM?.id !== game.user.id) return;

  try {
    await seedReferenceChartsCompendium();
  } catch (error) {
    ui.notifications?.warn("Nutshell | Unable to seed the Reference Charts compendium automatically.");
  }
});
