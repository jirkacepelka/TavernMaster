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
    startingItems: ["staff_apprentice", "potion_heal"]
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
    startingItems: ["mace", "potion_heal"]
  }
];

/* ---------------------------------------------------------------- ITEMS ---
 * type: weapon/armor/trinket/tool are "equippable" (can be equipped and then
 *   buff stats via effect). potion/misc are consumable, cannot be equipped.
 * effect: map of stat modifiers — keys str/dex/int/con only. Other keys are
 *   ignored (characters have exactly these four stats).
 * icon: path/URL to an icon image. When null, the item renders without one.
 *   (Two items ship with an inline SVG icon to show it works.)
 * perRound: optional passive income/drain applied EACH ROUND while EQUIPPED.
 *   { gold: N, drunkness: N } — either value may be negative (a drain).
 * ability: optional ACTIVE ability the player triggers from the character sheet
 *   (works from equipped or backpack). Shape:
 *   { name, description, gold?, drunkness?, buff?, cooldownRounds? }
 *   gold/drunkness may be negative; buff = { id, name, statMods, durationQuests }.
 * ------------------------------------------------------------------------- */
const ITEMS = [
  { id: "sword_basic",       name: "Iron Sword",       type: "weapon",  effect: { str: 1 },         value: 10, icon: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Cpath%20d='M7%2027l3-3%204%204-3%203H7v-4z'%20fill='%23a0785a'/%3E%3Cpath%20d='M12%2022L24%206l2%202L14%2024l-2-2z'%20fill='%23d6d6de'/%3E%3C/svg%3E" },
  { id: "shield_wood",       name: "Wooden Shield",    type: "armor",   effect: { con: 1 },         value: 8,  icon: null },
  { id: "staff_apprentice",  name: "Apprentice Staff", type: "weapon",  effect: { int: 1 },         value: 12, icon: null },
  { id: "dagger",            name: "Dagger",           type: "weapon",  effect: { dex: 1 },         value: 6,  icon: null },
  { id: "mace",              name: "Mace",             type: "weapon",  effect: { str: 1 },         value: 9,  icon: null },
  { id: "lockpicks",         name: "Lockpicks",        type: "tool",    effect: { dex: 1 },         value: 7,  icon: null },
  { id: "potion_heal",       name: "Healing Potion",   type: "potion",  effect: null,               value: 15, icon: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20x='12'%20y='3'%20width='8'%20height='4'%20fill='%23d6d6de'/%3E%3Cpath%20d='M13%207h6v5l4%2011a4%204%200%2001-4%205h-6a4%204%200%2001-4-5l4-11z'%20fill='%23c93438'/%3E%3C/svg%3E" },
  { id: "amulet_luck",       name: "Amulet of Luck",   type: "trinket", effect: { dex: 1, int: 1 }, value: 25, icon: null },

  /* per-round income / drain (while equipped) */
  { id: "amulet_prosperity", name: "Amulet of Prosperity", type: "trinket", effect: null, value: 45, icon: null,
    perRound: { gold: 5 } },
  { id: "cursed_flask",      name: "Cursed Flask",     type: "trinket", effect: null, value: 3,  icon: null,
    perRound: { gold: -1, drunkness: 4 } },

  /* active abilities */
  { id: "rune_riches",       name: "Rune of Riches",   type: "trinket", effect: null, value: 50, icon: null,
    ability: { name: "Channel Riches", description: "Channel the rune for a burst of gold.", gold: 25, cooldownRounds: 2 } },
  { id: "totem_fury",        name: "Totem of Fury",    type: "trinket", effect: null, value: 40, icon: null,
    ability: { name: "Bloodrage", description: "Down a swig of fury.", drunkness: 15,
               buff: { id: "fury", name: "Fury", statMods: { str: 4, int: -2 }, durationQuests: 1 }, cooldownRounds: 1 } }
];

/* --------------------------------------------- ALCOHOL (common goods / rewards) - */
const ALCOHOL = [
  { id: "beer_light", name: "Light Beer",   buzzDelta: 8,  price: 5,  realWorldServing: "1 beer (0.3 l)" },
  { id: "mead",       name: "Mead",         buzzDelta: 12, price: 8,  realWorldServing: "1 glass of mead (0.2 l)" },
  { id: "wine_red",   name: "Red Wine",     buzzDelta: 14, price: 10, realWorldServing: "1 glass of wine (2 dl)" },
  { id: "moonshine",  name: "Moonshine",    buzzDelta: 20, price: 12, realWorldServing: "1 shot (4 cl)" }
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
