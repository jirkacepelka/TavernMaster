/* ============================================================================
 * Tavern Master — game data
 * ----------------------------------------------------------------------------
 * This file holds ALL game content. Edit it and the app changes — no need to
 * touch app.js. Everything is plain JS constants (no JSON fetch) so the app
 * works even after double-clicking index.html (file://).
 *
 * Stat keys the app knows: str (strength), dex (dexterity),
 * int (intelligence), con (constitution).
 * ==========================================================================*/

/* Base stats of every new character, before race/class modifiers are added */
const BASE_STATS = { str: 3, dex: 3, int: 3, con: 3 };

/* Toggle the drink-diversity bonus.
 * When true: if the last 3 drinks are identical, the next identical drink
 * gives 50% less drunkness. */
const DIVERSITY_BONUS_ENABLED = true;

/* ---------------------------------------------------------------- RACES ---
 * avatar: path to the race's profile image (default character avatar).
 * ------------------------------------------------------------------------- */
const RACES = [
  {
    id: "human",
    name: "Human",
    statMods: { str: 1, dex: 1, int: 1, con: 1 },
    avatar: "assets/races/human.webp",
    description: "Balanced, adaptable warriors — good at everything, masters of nothing."
  },
  {
    id: "elf",
    name: "Elf",
    statMods: { str: 0, dex: 2, int: 1, con: 0 },
    avatar: "assets/races/elf.webp",
    description: "Graceful forest archers with a knack for magic and the bow."
  },
  {
    id: "dwarf",
    name: "Dwarf",
    statMods: { str: 1, dex: 0, int: 0, con: 2 },
    avatar: "assets/races/dwarf.webp",
    description: "Stubborn smiths, famous for shrugging off both drinks and blows."
  },
  {
    id: "orc",
    name: "Orc",
    statMods: { str: 3, dex: 0, int: -1, con: 1 },
    avatar: "assets/races/orc.webp",
    description: "Broad-shouldered brawlers no one wants to bump into at the bar."
  },
  {
    id: "tauren",
    name: "Tauren",
    statMods: { str: 2, dex: -1, int: 1, con: 2 },
    avatar: "assets/races/tauren.webp",
    description: "Massive bull-like shamans — slow, but unshakable and wise."
  },
  {
    id: "goblin",
    name: "Goblin",
    statMods: { str: -1, dex: 2, int: 2, con: -1 },
    avatar: "assets/races/goblin.webp",
    description: "Cunning inventors and tinkerers. Fragile, but nimble and clever."
  },
  {
    id: "murlock",
    name: "Murlock",
    statMods: { str: 0, dex: 1, int: 2, con: 0 },
    avatar: "assets/races/murlock.webp",
    description: "Swamp amphibians wielding ancient runic magic."
  }
];

/* ------------------------------------------------------------- CLASSES --- */
const CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    statMods: { str: 2, dex: 0, int: 0, con: 1 },
    startingItems: ["sword_basic", "shield_wood"]
  },
  {
    id: "mage",
    name: "Mage",
    statMods: { str: -1, dex: 0, int: 3, con: 0 },
    startingItems: ["staff_apprentice"]
  },
  {
    id: "thief",
    name: "Thief",
    statMods: { str: 0, dex: 3, int: 1, con: -1 },
    startingItems: ["dagger", "lockpicks"]
  },
  {
    id: "cleric",
    name: "Cleric",
    statMods: { str: 1, dex: 0, int: 1, con: 1 },
    startingItems: ["mace"]
  }
];

/* ---------------------------------------------------------------- ITEMS ---
 * type: weapon/armor/trinket/tool are "equippable" (can be equipped and then
 *   buff stats via effect). potion/misc are consumable, cannot be equipped.
 * effect: flat stat modifiers — keys str/dex/int/con only. Other keys ignored.
 * effectPct: optional PERCENTAGE stat modifiers { str: 30 } applied while
 *   EQUIPPED, after all flat modifiers (e.g. +30% Strength).
 * description: optional lore text (shown in Tavernpedia).
 * icon: path/URL to an icon image. When null, the item renders without one.
 * perRound: optional passive income/drain applied EACH ROUND while EQUIPPED.
 *   { gold: N, drunkness: N } — either value may be negative (a drain).
 * ability: optional ACTIVE ability triggered from the character sheet
 *   (works from equipped or backpack). Shape:
 *   { name, description, gold?, drunkness?, buff?, cooldownRounds? }
 *   gold/drunkness may be negative; buff = { id, name, statMods, durationQuests }.
 * ------------------------------------------------------------------------- */
const ITEMS = [
  { id: "sword_basic",       name: "Iron Sword",          type: "weapon",  effect: { str: 1 },         value: 10, icon: "assets/items/sword_basic.webp" },
  { id: "shield_wood",       name: "Wooden Shield",       type: "armor",   effect: { con: 1 },         value: 8,  icon: "assets/items/shield_wood.webp" },
  { id: "staff_apprentice",  name: "Needlessly short rot", type: "weapon", effect: { int: 1 },         value: 12, icon: "assets/items/staff_apprentice.webp" },
  { id: "dagger",            name: "Dagger",              type: "weapon",  effect: { dex: 1 },         value: 6,  icon: "assets/items/dagger.webp" },
  { id: "mace",              name: "Mace",                type: "weapon",  effect: { str: 1 },         value: 9,  icon: "assets/items/mace.webp" },
  { id: "lockpicks",         name: "Lockpicks",           type: "tool",    effect: { dex: 1 },         value: 7,  icon: "assets/items/lockpicks.webp" },
  { id: "amulet_luck",       name: "Amulet of Luck",      type: "trinket", effect: { dex: 1, int: 1 }, value: 25, icon: "assets/items/amulet_luck.webp" },

  /* per-round income / drain (while equipped) */
  { id: "amulet_prosperity", name: "Amulet of Prosperity", type: "trinket", effect: null, value: 45, icon: "assets/items/amulet_prosperity.webp",
    perRound: { gold: 5 } },

  /* active abilities */
  { id: "bottle_branik",     name: "Bottle of Braník",    type: "trinket", effect: null, value: 10, icon: "assets/items/bottle_branik.webp",
    description: "The owner of this item has the right to sell the contents of their bladder once every two rounds, in exchange for money from the underclass in the shady districts of the world of Tavern Master.",
    ability: { name: "Sell the Goods", description: "Sell to the underclass in the shady districts.", drunkness: -5, gold: 5, cooldownRounds: 2 } },

  { id: "cursed_flask",      name: "Cursed Flask",        type: "trinket", effect: null, value: 3, icon: "assets/items/cursed_flask.webp",
    description: "The best friend of the forever thirsty adventurer.",
    ability: { name: "Try Your Luck", description: "Once every 4 rounds, try your luck: the bartender may hand you a basic alcohol on a 50% dice roll. No automatic effect — it only triggers the cooldown.", cooldownRounds: 4 } },

  { id: "flameblade_alcohol", name: "Alcohol Flame Blade", type: "weapon", value: 80, icon: "assets/items/flameblade_alcohol.webp",
    effect: { str: 5 }, effectPct: { str: 30 }, perRound: { drunkness: -5 },
    description: "The Alcohol Flame Blade is a powerful item that draws its power from the alcohol coursing through its wielder's veins. Be warned: whoever wields the power of the Flame Blade is doomed to spend eternity drinking in a bar." }
];

/* --------------------------------------------- ALCOHOL (common goods / rewards) - */
const ALCOHOL = [
  { id: "beer_light", name: "Light Beer",   buzzDelta: 8,  price: 5,  realWorldServing: "1 beer (0.3 l)", icon: "assets/items/beer_light.webp" },
  { id: "mead",       name: "Mead",         buzzDelta: 12, price: 8,  realWorldServing: "1 glass of mead (0.2 l)", icon: "assets/items/mead.webp" },
  { id: "wine_red",   name: "Red Wine",     buzzDelta: 14, price: 10, realWorldServing: "1 glass of wine (2 dl)", icon: "assets/items/wine_red.webp" },
  { id: "moonshine",  name: "Moonshine",    buzzDelta: 20, price: 12, realWorldServing: "1 shot (4 cl)", icon: "assets/items/moonshine.webp" }
];

/* -------------------------------------------------------- SPECIAL DRINKS - */
const SPECIAL_DRINKS = [
  {
    id: "berserker_shot",
    name: "Berserker's Shot",
    buzzDelta: 15,
    buff: { id: "rage", name: "Rage", statMods: { str: 3, con: -2 }, durationQuests: 1 },
    realWorldServing: "2 cl of something strong",
    price: 20
  },
  {
    id: "mage_elixir",
    name: "Mage's Elixir of Clarity",
    buzzDelta: -10,
    buff: { id: "focus", name: "Focus", statMods: { int: 3, str: -1 }, durationQuests: 2 },
    realWorldServing: "A glass of bitter herbal liqueur (2 cl)",
    price: 22
  },
  {
    id: "thief_tonic",
    name: "Thief's Tonic",
    buzzDelta: 6,
    buff: { id: "nimble", name: "Nimbleness", statMods: { dex: 3, con: -1 }, durationQuests: 1 },
    realWorldServing: "A green shot (2 cl)",
    price: 18
  },
  {
    id: "liquid_courage",
    name: "Liquid Courage",
    buzzDelta: 25,
    buff: { id: "reckless", name: "Recklessness", statMods: { str: 2, dex: 2, int: -3 }, durationQuests: 1 },
    realWorldServing: "A double shot (4 cl)",
    price: 15
  }
];

/* --------------------------------------------------------------- QUESTS ---
 * Text only (name + description). Rewards are handed out manually by the DM
 * via the "Reward" button on a character. No defaults — the DM adds their own
 * in the Admin dashboard. Add predefined ones here if you want:
 *   { id: "q1", name: "Rats in the Cellar", description: "Clear the cellar." }
 * ------------------------------------------------------------------------- */
const QUESTS = [];
