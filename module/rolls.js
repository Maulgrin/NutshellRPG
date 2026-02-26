const SKILL_LABELS = {
  closeCombat: "Close Combat",
  rangedCombat: "Ranged Combat",
  perception: "Perception",
  survival: "Survival",
  endurance: "Endurance",
  fitness: "Fitness",
  persuasion: "Persuasion",
  expertise: "Expertise",
  power: "Power",
  skulduggery: "Skulduggery",
  operate: "Operate"
};

const TARGET_OPTIONS = [4, 6, 8, 10, 12, 14];

function getSkillValue(actor, skillKey) {
  return Number(foundry.utils.getProperty(actor, `system.skills.${skillKey}`) ?? 0);
}

function strikesFromDifference(difference) {
  if (difference >= 8) return 4;
  if (difference >= 5) return 3;
  if (difference >= 2) return 2;
  if (difference >= 0) return 1;
  return 0;
}

function formatDifference(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function getDiceDisplay(roll) {
  const results = roll.dice.flatMap((die) => die.results.map((result) => result.result));
  return `[${results.join(", ")}]`;
}

function buildRollCard({ title, roll, modifier, total, targetNumber, success, difference, strikes }) {
  const outcome = success ? "Success" : "Failure";
  return `
    <section class="nutshell-chat-card">
      <h3>${title}</h3>
      <table class="nutshell-chat-table">
        <tr><th>Dice</th><td>${getDiceDisplay(roll)}</td></tr>
        <tr><th>Modifier</th><td>${formatDifference(modifier)}</td></tr>
        <tr><th>Total</th><td>${total}</td></tr>
        <tr><th>TN</th><td>${targetNumber}</td></tr>
        <tr><th>Result</th><td>${outcome}</td></tr>
        <tr><th>Difference</th><td>${formatDifference(difference)}</td></tr>
        ${typeof strikes === "number" ? `<tr><th>Strikes</th><td>${strikes}</td></tr>` : ""}
      </table>
    </section>
  `;
}

async function postRollCard(actor, data) {
  const content = buildRollCard(data);
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content
  });
}

async function promptForNumber({ title, label, defaultValue }) {
  return new Promise((resolve) => {
    let settled = false;
    const finalize = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    new Dialog({
      title,
      content: `
        <form>
          <div class="form-group">
            <label>${label}</label>
            <input type="number" name="value" value="${defaultValue}" />
          </div>
        </form>
      `,
      buttons: {
        roll: {
          label: "Roll",
          callback: (html) => {
            const raw = html.find('input[name="value"]').val();
            finalize(Number(raw) || 0);
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => finalize(null)
        }
      },
      default: "roll",
      close: () => finalize(null)
    }).render(true);
  });
}

async function promptForTargetChoice({ title, defaultValue = 8 }) {
  const options = TARGET_OPTIONS.map((value) => {
    const selected = value === defaultValue ? "selected" : "";
    return `<option value="${value}" ${selected}>${value}</option>`;
  }).join("");

  return new Promise((resolve) => {
    let settled = false;
    const finalize = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    new Dialog({
      title,
      content: `
        <form>
          <div class="form-group">
            <label>GM Target Number</label>
            <select name="target">${options}</select>
          </div>
        </form>
      `,
      buttons: {
        confirm: {
          label: "Confirm",
          callback: (html) => {
            const raw = html.find('select[name="target"]').val();
            finalize(Number(raw) || defaultValue);
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => finalize(null)
        }
      },
      default: "confirm",
      close: () => finalize(null)
    }).render(true);
  });
}

async function genericSkillRoll(actor, skillKey) {
  const skillName = SKILL_LABELS[skillKey] ?? skillKey;
  const modifier = getSkillValue(actor, skillKey);
  const roll = await new Roll("2d6 + @modifier", { modifier }).evaluate();
  const total = Number(roll.total ?? 0);
  if (!game.user.isGM) {
    ui.notifications.info("GM should select the target number for this roll.");
  }
  const targetNumber = await promptForTargetChoice({
    title: `${skillName} Roll`,
    defaultValue: 8
  });
  if (targetNumber === null) return;
  const difference = total - targetNumber;
  const success = difference >= 0;

  return postRollCard(actor, {
    title: `${skillName} Roll`,
    roll,
    modifier,
    total,
    targetNumber,
    success,
    difference
  });
}

async function rangedAttack(actor) {
  const targetNumber = await promptForNumber({
    title: "Ranged Attack",
    label: "Target Number",
    defaultValue: 8
  });

  if (targetNumber === null) return;

  const modifier = getSkillValue(actor, "rangedCombat");
  const roll = await new Roll("2d6 + @modifier", { modifier }).evaluate();
  const total = Number(roll.total ?? 0);
  const difference = total - targetNumber;
  const success = difference >= 0;
  const strikes = success ? strikesFromDifference(difference) : 0;

  return postRollCard(actor, {
    title: "Ranged Attack",
    roll,
    modifier,
    total,
    targetNumber,
    success,
    difference,
    strikes
  });
}

async function closeCombatOpposed(actor) {
  const defenderTotal = await promptForNumber({
    title: "Close Combat Opposed",
    label: "Defender Total",
    defaultValue: 8
  });

  if (defenderTotal === null) return;

  const modifier = getSkillValue(actor, "closeCombat");
  const roll = await new Roll("2d6 + @modifier", { modifier }).evaluate();
  const total = Number(roll.total ?? 0);
  const difference = total - defenderTotal;
  const success = difference >= 0;
  const strikes = success ? strikesFromDifference(difference) : 0;

  return postRollCard(actor, {
    title: "Close Combat Opposed",
    roll,
    modifier,
    total,
    targetNumber: defenderTotal,
    success,
    difference,
    strikes
  });
}

const NutshellRolls = {
  skillLabels: SKILL_LABELS,
  genericSkillRoll,
  rangedAttack,
  closeCombatOpposed
};

globalThis.NutshellRolls = NutshellRolls;

Hooks.once("init", () => {
  game.nutshell = game.nutshell || {};
  game.nutshell.rolls = NutshellRolls;
});

export { SKILL_LABELS, genericSkillRoll, rangedAttack, closeCombatOpposed };
