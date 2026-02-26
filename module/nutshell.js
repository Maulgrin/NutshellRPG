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
    if (this.type !== "character") return;

    const endurance = Number(this.system.skills?.endurance ?? 0);
    const taken = Math.max(0, Number(this.system.strikes?.taken ?? 0));
    const maxStrikes = 4 + endurance;

    this.system.strikes.max = maxStrikes;
    this.system.strikes.remaining = Math.max(0, maxStrikes - taken);
  }
}

class NutshellCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["nutshell", "sheet", "actor", "character"],
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
    context.system = this.actor.system;
    context.skills = SKILL_FIELDS.map(({ key, label }) => ({
      key,
      label,
      value: Number(this.actor.system.skills?.[key] ?? 0)
    }));
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.find('[data-action="skill-roll"]').on("click", this._onSkillRoll.bind(this));
    html.find('[data-action="ranged-attack"]').on("click", this._onRangedAttack.bind(this));
    html.find('[data-action="close-opposed"]').on("click", this._onCloseOpposed.bind(this));
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
}

Hooks.once("init", () => {
  game.nutshell = game.nutshell || {};
  CONFIG.Actor.documentClass = NutshellActor;
  CONFIG.Actor.dataModels = CONFIG.Actor.dataModels || {};
  CONFIG.Actor.dataModels.character = NutshellCharacterData;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("nutshell", NutshellCharacterSheet, {
    types: ["character"],
    makeDefault: true
  });
});

Hooks.once("ready", () => {
  game.nutshell = game.nutshell || {};
  if (!game.nutshell.rolls && globalThis.NutshellRolls) {
    game.nutshell.rolls = globalThis.NutshellRolls;
  }
});