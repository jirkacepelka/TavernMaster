/* ============================================================================
 * Tavern Master — app.js
 * Main state logic: init, routing, render, event handlers.
 * Vanilla JS, no framework. Data comes from data/data.js as global constants
 * (RACES, CLASSES, ITEMS, ALCOHOL, SPECIAL_DRINKS, QUESTS, ...).
 * ==========================================================================*/

"use strict";

const STORAGE_KEY = "krcma-master-state";
const APP_VERSION = "1.1";

/* Item types that can be equipped (and then buff stats via effect) */
const EQUIPPABLE_TYPES = ["weapon", "armor", "trinket", "tool"];
/* Keys that feed into a character's stats */
const STAT_KEYS = ["str", "dex", "int", "con"];
const STAT_LABEL = { str: "Strength", dex: "Dexterity", int: "Intelligence", con: "Constitution" };
/* ---- inline SVG icons (Feather/Lucide style, open-source, no deps) ---- */
const ICONS = {
  drink:'<path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-1-7H8c-.5 3-1 5-1 7a5 5 0 0 0 5 5Z"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  sliders:'<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  pause:'<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  play:'<polygon points="6 3 20 12 6 21 6 3"/>',
  skull:'<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1"/><path d="M12 6v2m0 8v2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  skip:'<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
  book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  sparkles:'<path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  chevronRight:'<path d="m9 18 6-6-6-6"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  scroll:'<path d="M8 3H5a2 2 0 0 0-2 2v3M8 3v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8M8 3h11a2 2 0 0 1 2 2v3M3 8h5"/>',
  hat:'<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2 2 6 2s6-1 6-2v-5"/>'
};
function icon(name, cls) {
  return `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}
const COIN = icon("coin", "coin");

/* Avatar inner content: character image → race image → user-icon fallback */
function avatarHtml(c) {
  const src = c.avatar || (byId(RACES, c.raceId) || {}).avatar;
  if (src) return `<img src="${src}" alt="">`;
  return icon("user", "avatar-fallback");
}

/* ------------------------------------------------------------- helpers --- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const byId = (list, id) => list.find(x => x.id === id) || null;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2200);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

/* Resolve a drink/item across all data sources */
function resolveThing(id) {
  const item = byId(ITEMS, id);
  if (item) return { ...item, kind: "item" };
  const alc = byId(ALCOHOL, id);
  if (alc) return { ...alc, kind: "alcohol" };
  const sp = byId(SPECIAL_DRINKS, id);
  if (sp) return { ...sp, kind: "special" };
  return { id, name: id, kind: "unknown" };
}
const isDrink = id => !!(byId(ALCOHOL, id) || byId(SPECIAL_DRINKS, id));
const allDrinks = () => [...ALCOHOL, ...SPECIAL_DRINKS];

/* ------------------------------------------------------- STATE / STORAGE - */
let state = { characters: [], questLog: [], customQuests: [], round: 1 };
let selectedCharId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = normalizeState(JSON.parse(raw));
  } catch (e) {
    console.warn("Failed to load state:", e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state:", e);
  }
}

/* Ensure loaded/imported state (even older) has all expected fields */
function normalizeState(s) {
  const characters = (Array.isArray(s.characters) ? s.characters : []).map(migrateCharacter);
  return {
    characters,
    questLog:     Array.isArray(s.questLog)     ? s.questLog     : [],
    customQuests: Array.isArray(s.customQuests) ? s.customQuests : [],
    round:        Number.isFinite(s.round)      ? s.round        : 1
  };
}

function migrateCharacter(c) {
  return {
    id: c.id || uuid(),
    name: c.name || "Unnamed",
    raceId: c.raceId,
    classId: c.classId,
    stats: c.stats || { ...BASE_STATS },
    gold: Number.isFinite(c.gold) ? c.gold : 0,
    inventory: Array.isArray(c.inventory) ? c.inventory : [],
    equipped: Array.isArray(c.equipped) ? c.equipped : [],
    buzz: Number.isFinite(c.buzz) ? c.buzz : 50,
    activeBuffs: Array.isArray(c.activeBuffs) ? c.activeBuffs : [],
    drinkHistory: Array.isArray(c.drinkHistory) ? c.drinkHistory : [],
    story: typeof c.story === "string" ? c.story : "",
    paused: !!c.paused,
    dead: !!c.dead,
    cooldowns: (c.cooldowns && typeof c.cooldowns === "object") ? c.cooldowns : {}
  };
}

/* Frozen = excluded from passive effects (rounds, buff ticks) */
function isFrozen(c) { return c.paused || c.dead; }

/* All quests = predefined from data.js + custom ones from the DM */
function allQuests() {
  return [...QUESTS, ...state.customQuests];
}

/* --------------------------------------------------------------- ROUTING - */
const VIEWS = ["players", "detail", "create", "dm", "tavern"];
let currentView = "players";

function navigate(view, arg) {
  if (!VIEWS.includes(view)) view = "players";
  if (view === "detail") selectedCharId = arg || selectedCharId;
  currentView = view;
  $$(".view").forEach(v => v.classList.remove("active"));
  $("#view-" + view).classList.add("active");
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.nav === view));
  window.scrollTo(0, 0);
  renderView(view);
}

function renderView(view) {
  switch (view) {
    case "players": renderPlayers(); break;
    case "detail":  renderDetail(selectedCharId); break;
    case "create":  renderCreatePreview(); break;
    case "dm":      renderDM(); break;
    case "tavern":  renderTavern(); break;
  }
}

/* Re-render the current view after a character change */
function refresh() { renderView(currentView); }

/* ============================ CHARACTER CREATION ======================== */

function computeStats(raceId, classId) {
  const race = byId(RACES, raceId);
  const cls  = byId(CLASSES, classId);
  const stats = { ...BASE_STATS };
  for (const key of Object.keys(stats)) {
    if (race && race.statMods[key]) stats[key] += race.statMods[key];
    if (cls && cls.statMods[key])  stats[key] += cls.statMods[key];
  }
  return stats;
}

function fillCreateDropdowns() {
  $("#c-race").innerHTML  = RACES.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
  $("#c-class").innerHTML = CLASSES.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

function renderCreatePreview() {
  const raceId  = $("#c-race").value;
  const classId = $("#c-class").value;
  const stats = computeStats(raceId, classId);
  $("#c-stats-preview").innerHTML = renderStatsGrid(stats);
  const cls = byId(CLASSES, classId);
  const items = (cls ? cls.startingItems : []).map(id => (byId(ITEMS, id) || {}).name || id);
  $("#c-items-preview").textContent =
    "Starting gear: " + (items.length ? items.join(", ") : "none");
}

function renderStatsGrid(stats, baseStats) {
  return Object.keys(stats).map(key => {
    let cls = "";
    if (baseStats) {
      if (stats[key] > baseStats[key]) cls = "buffed";
      else if (stats[key] < baseStats[key]) cls = "nerfed";
    }
    return `<div class="stat-box ${cls}">
      <div class="stat-label">${STAT_LABEL[key] || key}</div>
      <div class="stat-val">${stats[key]}</div>
    </div>`;
  }).join("");
}

function handleCreateSubmit(e) {
  e.preventDefault();
  const name = $("#c-name").value.trim();
  const errEl = $("#c-name-error");
  if (!name) { errEl.textContent = "Enter a character name."; return; }
  errEl.textContent = "";

  const raceId  = $("#c-race").value;
  const classId = $("#c-class").value;
  const cls = byId(CLASSES, classId);

  const character = {
    id: uuid(), name, raceId, classId,
    stats: computeStats(raceId, classId),
    gold: 0,
    inventory: cls ? [...cls.startingItems] : [],
    equipped: [],
    buzz: 50,
    activeBuffs: [],
    drinkHistory: [],
    story: "",
    paused: false,
    dead: false,
    cooldowns: {}
  };

  state.characters.push(character);
  saveState();
  $("#create-form").reset();
  fillCreateDropdowns();
  toast(`Character "${name}" created`);
  navigate("detail", character.id);
}

/* ========================= DRUNKNESS & DEBUFF LOGIC ===================== */

function applyBuzzDelta(character, delta) {
  character.buzz = clamp(Math.round(character.buzz + delta), 0, 100);
  return character.buzz;
}

function getBuzzZone(buzz) {
  if (buzz <= 34) return "low";
  if (buzz <= 65) return "optimal";
  return "high";
}

function getZoneDebuff(buzz) {
  const zone = getBuzzZone(buzz);
  if (zone === "low")  return { name: "Sober Slump", desc: "-2 to all rolls, sluggishness" };
  if (zone === "high") return { name: "Drunkenness",  desc: "-2 to dexterity and intelligence, staggering" };
  return null;
}

/* How much drunkness drops per round by current zone:
 * 0–34 → 1, 35–65 → 2, 66–100 → 3. */
function roundDrunknessDrop(buzz) {
  return { low: 1, optimal: 2, high: 3 }[getBuzzZone(buzz)];
}

function findBuffDef(buffId) {
  for (const d of SPECIAL_DRINKS) if (d.buff && d.buff.id === buffId) return d.buff;
  for (const it of ITEMS) if (it.ability && it.ability.buff && it.ability.buff.id === buffId) return it.ability.buff;
  return null;
}

/* ---- item text helpers ---- */
function effectStatText(effect) {
  if (!effect || !Object.keys(effect).length) return "None";
  return Object.entries(effect).map(([k, v]) => `${v >= 0 ? "+" : ""}${v} ${STAT_LABEL[k] || k}`).join(", ");
}
/* Full stat text for an item incl. flat + percentage modifiers */
function itemStatText(item) {
  const parts = [];
  if (item.effect) for (const [k, v] of Object.entries(item.effect)) parts.push(`${v >= 0 ? "+" : ""}${v} ${STAT_LABEL[k] || k}`);
  if (item.effectPct) for (const [k, v] of Object.entries(item.effectPct)) parts.push(`${v >= 0 ? "+" : ""}${v}% ${STAT_LABEL[k] || k}`);
  return parts.length ? parts.join(", ") : "None";
}
function perRoundText(p) {
  if (!p) return "";
  const parts = [];
  if (p.gold) parts.push(`${p.gold >= 0 ? "+" : ""}${p.gold} g`);
  if (p.drunkness) parts.push(`${p.drunkness >= 0 ? "+" : ""}${p.drunkness}% drunkness`);
  return parts.join(", ");
}
function abilityEffectText(ab) {
  if (!ab) return "";
  const parts = [];
  if (ab.gold) parts.push(`${ab.gold >= 0 ? "+" : ""}${ab.gold} g`);
  if (ab.drunkness) parts.push(`${ab.drunkness >= 0 ? "+" : ""}${ab.drunkness}% drunkness`);
  if (ab.buff) parts.push(`buff ${ab.buff.name} (${modsToText(ab.buff.statMods)})`);
  let s = parts.join(", ") || "—";
  if (ab.cooldownRounds) s += ` · cooldown ${ab.cooldownRounds}r`;
  return s;
}

/* Abilities a character can use right now (from equipped + backpack, unique) */
function characterAbilities(c) {
  const seen = new Set(), out = [];
  [...c.equipped, ...c.inventory].forEach(id => {
    if (seen.has(id)) return;
    seen.add(id);
    const it = byId(ITEMS, id);
    if (it && it.ability) {
      const readyAt = (c.cooldowns || {})[id] || 0;
      out.push({ item: it, ready: state.round >= readyAt, readyIn: Math.max(0, readyAt - state.round) });
    }
  });
  return out;
}

function sumBuffMods(character) {
  const mods = {};
  for (const ab of character.activeBuffs) {
    const def = findBuffDef(ab.id);
    if (!def) continue;
    for (const [k, v] of Object.entries(def.statMods)) mods[k] = (mods[k] || 0) + v;
  }
  return mods;
}

/* Modifiers from equipped items (stat keys only) */
function sumEquipMods(character) {
  const mods = {};
  for (const id of character.equipped) {
    const item = byId(ITEMS, id);
    if (!item || !item.effect) continue;
    for (const [k, v] of Object.entries(item.effect)) {
      if (STAT_KEYS.includes(k)) mods[k] = (mods[k] || 0) + v;
    }
  }
  return mods;
}

/* Percentage stat modifiers from equipped items (applied after flat mods) */
function sumEquipPct(character) {
  const pct = {};
  for (const id of character.equipped) {
    const item = byId(ITEMS, id);
    if (!item || !item.effectPct) continue;
    for (const [k, v] of Object.entries(item.effectPct)) {
      if (STAT_KEYS.includes(k)) pct[k] = (pct[k] || 0) + v;
    }
  }
  return pct;
}

/* Effective stats = (base + buffs + equipped flat) then equipped % modifiers */
function effectiveStats(character) {
  const out = { ...character.stats };
  for (const [k, v] of Object.entries(sumBuffMods(character))) out[k] = (out[k] || 0) + v;
  for (const [k, v] of Object.entries(sumEquipMods(character))) out[k] = (out[k] || 0) + v;
  for (const [k, v] of Object.entries(sumEquipPct(character))) out[k] = Math.round((out[k] || 0) * (1 + v / 100));
  return out;
}

function renderBuzz(character) {
  const debuff = getZoneDebuff(character.buzz);
  const zoneLabel = { low: "Sober", optimal: "Optimal", high: "Drunk" }[getBuzzZone(character.buzz)];
  return `
    <div class="buzz-wrap">
      <div class="buzz-head">Drunkness — ${zoneLabel}
        ${debuff ? `<span class="badge debuff zone-badge" title="${escapeHtml(debuff.desc)}">${icon("alert")} ${debuff.name}</span>` : ""}</div>
      <div class="buzz-bar">
        <div class="buzz-fill" style="width:${character.buzz}%"></div>
        <span class="buzz-pct">${character.buzz}%</span>
      </div>
      <div class="buzz-zones"><span>0</span><span>35–65 optimal</span><span>100</span></div>
    </div>`;
}

function renderBuffBadges(character) {
  if (!character.activeBuffs.length) return "";
  return character.activeBuffs.map(ab => {
    const def = findBuffDef(ab.id);
    const name = def ? def.name : ab.id;
    const modsStr = def ? Object.entries(def.statMods)
      .map(([k, v]) => `${STAT_LABEL[k] || k} ${v >= 0 ? "+" : ""}${v}`).join(", ") : "";
    return `<span class="badge buff">${icon("sparkles")} ${name} (${modsStr}) — ${ab.questsRemaining} q left</span>`;
  }).join("");
}

/* ============================= DRINK DIVERSITY ========================= */

function effectiveBuzzDelta(character, drinkId, baseDelta) {
  if (!DIVERSITY_BONUS_ENABLED) return baseDelta;
  const last3 = character.drinkHistory.slice(-3);
  if (last3.length === 3 && last3.every(d => d === drinkId)) {
    return baseDelta > 0 ? Math.round(baseDelta * 0.5) : baseDelta;
  }
  return baseDelta;
}

function recordDrink(character, drinkId) {
  character.drinkHistory.push(drinkId);
  if (character.drinkHistory.length > 10) character.drinkHistory = character.drinkHistory.slice(-10);
}

/* =============================== ITEM SQUARE =========================== */

/* Text description of an item/drink's effect for the tooltip */
function describeThing(id) {
  const t = resolveThing(id);
  if (t.kind === "alcohol")
    return `Drunkness ${t.buzzDelta >= 0 ? "+" : ""}${t.buzzDelta} · drink: ${t.realWorldServing}`;
  if (t.kind === "special") {
    const b = t.buff ? " · buff: " + Object.entries(t.buff.statMods)
      .map(([k, v]) => `${STAT_LABEL[k] || k} ${v >= 0 ? "+" : ""}${v}`).join(", ") : "";
    return `Drunkness ${t.buzzDelta >= 0 ? "+" : ""}${t.buzzDelta}${b} · drink: ${t.realWorldServing}`;
  }
  // items
  const parts = [];
  const st = itemStatText(t);
  if (st !== "None") parts.push(st);
  if (t.perRound) parts.push(perRoundText(t.perRound) + "/round");
  if (t.ability) parts.push(`Active: ${t.ability.name}`);
  return parts.length ? parts.join(" · ") : "No effect";
}

function thingBuffs(id) {
  const t = resolveThing(id);
  if (t.kind === "item") return !!((t.effect && Object.keys(t.effect).length) || t.effectPct || t.perRound || t.ability);
  if (t.kind === "special") return !!t.buff;
  return false;
}

/* Item = 50×50 square (per the design). The whole square is a button:
 * in the backpack a click equips/drinks, on equipped a click unequips.
 * Hover shows the tooltip. */
function renderItemSquare(id, ctx, charId) {
  const t = resolveThing(id);
  let action = "", hint = "";
  if (ctx === "equipped") { action = "unequip"; hint = "click: unequip"; }
  else if (ctx === "backpack") {
    if (isDrink(id)) { action = "drink-item"; hint = "click: drink"; }
    else if (EQUIPPABLE_TYPES.includes(t.type)) { action = "equip"; hint = "click: equip"; }
  }
  const tip = escapeHtml(t.name + " · " + describeThing(id) + (hint ? " · " + hint : ""));
  const inner = t.icon ? `<img src="${t.icon}" alt="">` : "";
  const dot = thingBuffs(id) ? `<span class="buff-dot"></span>` : "";
  const attrs = action ? `data-action="${action}" data-id="${charId}" data-item="${id}"` : "";
  const remove = `<span class="item-remove" data-action="remove-item" data-id="${charId}" data-item="${id}" title="Remove item">×</span>`;
  return `<button class="item-sq" data-tip="${tip}" ${attrs}>
    <span class="sq-inner">${inner}</span>${dot}${remove}
  </button>`;
}

function renderItemRow(ids, ctx, charId, emptyText) {
  if (!ids.length) return `<p class="empty">${emptyText}</p>`;
  return `<div class="item-row">${ids.map(id => renderItemSquare(id, ctx, charId)).join("")}</div>`;
}

/* Stats as pills (per the design's "8 Agility") */
function renderStatPills(eff, base) {
  return Object.keys(eff).map(k => {
    let cls = "";
    if (base) { if (eff[k] > base[k]) cls = "buffed"; else if (eff[k] < base[k]) cls = "nerfed"; }
    return `<span class="stat-pill ${cls}">${eff[k]} ${STAT_LABEL[k] || k}</span>`;
  }).join("");
}

/* ============================== CHARACTER LIST ========================= */

function renderPlayers() {
  const wrap = $("#players-list");
  if (!state.characters.length) {
    wrap.innerHTML = `<p class="empty">No characters yet. Create the first one with the “New character” button.</p>`;
    return;
  }
  wrap.innerHTML = state.characters.map(c => {
    const race = byId(RACES, c.raceId), cls = byId(CLASSES, c.classId);
    const zone = getBuzzZone(c.buzz);
    return `<div class="player-row ${c.dead ? "is-dead" : ""}" data-action="open-detail" data-id="${c.id}">
      <div class="avatar sm">${avatarHtml(c)}</div>
      <div class="row-main">
        <div class="row-name">${escapeHtml(c.name)}
          ${c.dead ? `<span class="badge dead">${icon("skull")} Dead</span>` : ""}
          ${c.paused ? `<span class="badge paused">${icon("pause")} Paused</span>` : ""}</div>
        <div class="tag-row">
          <span class="badge pill">${cls ? cls.name : "?"}</span>
          <span class="badge pill">${race ? race.name : "?"}</span>
        </div>
      </div>
      <div class="row-buzz">
        <div class="mini-bar"><div class="buzz-fill ${zone}" style="width:${c.buzz}%"></div></div>
        <span class="muted">${c.buzz}% drunkness</span>
      </div>
      <div class="row-gold gold-pill">${c.gold} ${COIN}</div>
      <div class="row-arrow">${icon("chevronRight")}</div>
    </div>`;
  }).join("");
}

/* ============================== CHARACTER DETAIL ======================= */

function renderDetail(charId) {
  const c = byId(state.characters, charId);
  const host = $("#detail-content");
  if (!c) { $("#detail-crumb").textContent = "—"; host.innerHTML = `<p class="empty">Character not found.</p>`; return; }
  $("#detail-crumb").textContent = c.name;

  const race = byId(RACES, c.raceId), cls = byId(CLASSES, c.classId);
  const eff = effectiveStats(c);
  const abilities = characterAbilities(c);
  const abilitiesHtml = abilities.length ? `
    <div class="items-section-title">Abilities</div>
    <div class="ability-list">
      ${abilities.map(a => `
        <div class="ability-item">
          <div class="ability-text">
            <strong>${escapeHtml(a.item.ability.name)}</strong> <span class="muted">— ${escapeHtml(a.item.name)}</span><br>
            <span class="muted">${escapeHtml((a.item.ability.description ? a.item.ability.description + " " : "") + "(" + abilityEffectText(a.item.ability) + ")")}</span>
          </div>
          <button class="btn small ${a.ready ? "" : "ghost"}" data-action="use-ability" data-id="${c.id}" data-item="${a.item.id}" ${(a.ready && !c.dead) ? "" : "disabled"}>
            ${a.ready ? "Use" : "Ready in " + a.readyIn}</button>
        </div>`).join("")}
    </div>` : "";

  host.innerHTML = `
    <div class="detail-hero ${c.dead ? "is-dead" : ""}">
      <div class="avatar-wrap">
        <div class="avatar">${avatarHtml(c)}</div>
        <button class="avatar-edit-fab" data-action="edit-avatar" data-id="${c.id}" title="Change image" aria-label="Change image">${icon("camera")}</button>
      </div>
      <div class="hero-info">
        <div class="hero-top">
          <div class="char-name">${escapeHtml(c.name)}</div>
          <button class="btn" data-action="drink" data-id="${c.id}" ${c.dead ? "disabled" : ""}>${icon("drink")} Drink</button>
        </div>
        <div class="tag-row">
          <span class="badge pill">${cls ? cls.name : "?"}</span>
          <span class="badge pill">${race ? race.name : "?"}</span>
          <span class="badge neutral"><span class="gold-pill">${c.gold} ${COIN}</span></span>
          ${c.dead ? `<span class="badge dead">${icon("skull")} Dead</span>` : ""}
          ${c.paused ? `<span class="badge paused">${icon("pause")} Paused</span>` : ""}
        </div>
        <div class="stat-line">
          <span class="lbl">Stats:</span>
          <div class="stat-pills">${renderStatPills(eff, c.stats)}</div>
        </div>
        ${renderBuzz(c)}
        <div class="buff-row">${renderBuffBadges(c) || '<span class="muted">No active buffs.</span>'}</div>
      </div>
    </div>

    <div class="items-section-title">Story
      <button class="icon-btn" data-action="edit-story" data-id="${c.id}" title="Edit story" aria-label="Edit story">${icon("pencil")}</button></div>
    <div class="story-box">${c.story
      ? escapeHtml(c.story).replace(/\n/g, "<br>")
      : '<span class="muted">No story yet. Click Edit to write one.</span>'}</div>

    <div class="items-section-title">Equipped items</div>
    ${renderItemRow(c.equipped, "equipped", c.id, "Nothing equipped.")}

    <div class="items-section-title">In backpack</div>
    ${renderItemRow(c.inventory, "backpack", c.id, "Empty backpack.")}

    ${abilitiesHtml}

    <div class="row-actions">
      <button class="btn ghost small" data-nav="players">${icon("chevronRight", "flip")} Back to characters</button>
      <button class="btn ghost small" data-action="toggle-pause" data-id="${c.id}">${c.paused ? icon("play") + " Resume" : icon("pause") + " Pause"}</button>
      <button class="btn ${c.dead ? "ghost" : "danger"} small" data-action="toggle-dead" data-id="${c.id}">${c.dead ? icon("heart") + " Revive" : icon("skull") + " Kill"}</button>
    </div>`;
}

/* Modal: edit a character's story */
function openStoryModal(charId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  openModal(`Story: ${c.name}`, `
    <label>Character story
      <textarea id="story-text" rows="8" placeholder="Where do they come from, what drives them, what are they running from...">${escapeHtml(c.story || "")}</textarea>
    </label>
  `, [
    { label: "Save", primary: true, onClick: () => {
        c.story = $("#story-text").value;
        saveState();
        refresh();
        toast("Story saved");
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

/* Modal: Drink — source from backpack or general from the menu */
function openDrinkModal(charId) {
  const c = byId(state.characters, charId);
  if (!c) return;

  const invDrinks = c.inventory.filter(isDrink);
  const defaultSource = invDrinks.length ? "inventory" : "general";

  const optionsFor = (source) => {
    const list = source === "inventory"
      ? [...new Set(invDrinks)].map(resolveThing)
      : allDrinks();
    if (!list.length) return "";
    return list.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
  };

  const detailsFor = (id) => {
    if (!id) return `<p class="empty">No drink in the backpack.</p>`;
    const d = resolveThing(id);
    const buff = d.buff
      ? Object.entries(d.buff.statMods).map(([k, v]) => `${STAT_LABEL[k] || k} ${v >= 0 ? "+" : ""}${v}`).join(", ")
        + ` (for ${d.buff.durationQuests} quest/s)`
      : "none";
    return `
      <p><strong>Drunkness:</strong> ${d.buzzDelta >= 0 ? "+" : ""}${d.buzzDelta}</p>
      <p><strong>Buff/nerf:</strong> ${d.buff ? d.buff.name + " — " + buff : "none"}</p>
      <p class="badge neutral">${icon("drink")} Actually drink: ${escapeHtml(d.realWorldServing || "?")}</p>`;
  };

  openModal("Drink", `
    <div class="seg" id="drink-source">
      <label class="inline"><input type="radio" name="src" value="inventory" ${defaultSource === "inventory" ? "checked" : ""}> From backpack</label>
      <label class="inline"><input type="radio" name="src" value="general" ${defaultSource === "general" ? "checked" : ""}> General</label>
    </div>
    <label>Drink
      <select id="drink-select">${optionsFor(defaultSource)}</select>
    </label>
    <div id="drink-details">${detailsFor(($("#drink-select") || {}).value || (defaultSource === "inventory" ? invDrinks[0] : allDrinks()[0].id))}</div>
    <label class="inline" style="margin-top:.8rem">
      <input type="checkbox" id="drink-consumed"> Drank it IRL
    </label>
  `, [
    { label: "Apply", primary: true, onClick: () => {
        const sel = $("#drink-select");
        if (!sel || !sel.value) { toast("Nothing to drink."); return false; }
        if (!$("#drink-consumed").checked) { toast("Check 'Drank it' first."); return false; }
        const source = $("#drink-source").querySelector("input:checked").value;
        applyDrink(c, resolveThing(sel.value), source === "inventory");
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);

  const rerenderOptions = () => {
    const source = $("#drink-source").querySelector("input:checked").value;
    $("#drink-select").innerHTML = optionsFor(source);
    $("#drink-details").innerHTML = detailsFor(($("#drink-select").value) || null);
  };
  $("#drink-source").addEventListener("change", rerenderOptions);
  $("#drink-select").addEventListener("change", e => { $("#drink-details").innerHTML = detailsFor(e.target.value); });
}

/* Drink an item directly from the backpack ("Drink" button on a square) */
function drinkItemFromInventory(charId, id) {
  const c = byId(state.characters, charId);
  if (!c) return;
  const d = resolveThing(id);
  openModal(`Drink: ${d.name}`, `
    <p class="badge neutral">${icon("drink")} Actually drink: ${escapeHtml(d.realWorldServing || "?")}</p>
    <p class="muted">Drunkness ${d.buzzDelta >= 0 ? "+" : ""}${d.buzzDelta}${d.buff ? ", buff " + d.buff.name : ""}</p>
    <label class="inline"><input type="checkbox" id="drink-consumed"> Drank it IRL</label>
  `, [
    { label: "Apply", primary: true, onClick: () => {
        if (!$("#drink-consumed").checked) { toast("Check 'Drank it' first."); return false; }
        applyDrink(c, d, true);
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

function applyDrink(c, drink, fromInventory) {
  applyBuzzDelta(c, effectiveBuzzDelta(c, drink.id, drink.buzzDelta));
  recordDrink(c, drink.id);
  if (drink.buff) {
    const existing = c.activeBuffs.find(b => b.id === drink.buff.id);
    if (existing) existing.questsRemaining = drink.buff.durationQuests;
    else c.activeBuffs.push({ id: drink.buff.id, questsRemaining: drink.buff.durationQuests });
  }
  if (fromInventory) {
    const i = c.inventory.indexOf(drink.id);
    if (i >= 0) c.inventory.splice(i, 1);
  }
  saveState();
  refresh();
  toast(`${c.name} drank ${drink.name} (${c.buzz}%)`);
}

/* =============================== EQUIP / UNEQUIP ======================== */

function equipItem(charId, itemId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  const item = byId(ITEMS, itemId);
  if (!item || !EQUIPPABLE_TYPES.includes(item.type)) { toast("This item can't be equipped."); return; }
  const i = c.inventory.indexOf(itemId);
  if (i < 0) return;
  c.inventory.splice(i, 1);
  c.equipped.push(itemId);
  saveState();
  refresh();
  toast(`Equipped: ${item.name}`);
}

function unequipItem(charId, itemId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  const i = c.equipped.indexOf(itemId);
  if (i < 0) return;
  c.equipped.splice(i, 1);
  c.inventory.push(itemId);
  saveState();
  refresh();
  toast(`Unequipped: ${(byId(ITEMS, itemId) || {}).name || itemId}`);
}

/* Remove one instance of an item from a character (equipped or backpack) */
function removeItem(charId, itemId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  let i = c.equipped.indexOf(itemId);
  if (i >= 0) c.equipped.splice(i, 1);
  else {
    i = c.inventory.indexOf(itemId);
    if (i < 0) return;
    c.inventory.splice(i, 1);
  }
  saveState();
  refresh();
  toast(`Removed: ${resolveThing(itemId).name}`);
}

/* Trigger an item's active ability */
function useAbility(charId, itemId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  if (c.dead) { toast("Dead characters can't act."); return; }
  const it = byId(ITEMS, itemId);
  if (!it || !it.ability) return;
  const ab = it.ability;
  c.cooldowns = c.cooldowns || {};
  if ((c.cooldowns[itemId] || 0) > state.round) {
    toast(`${ab.name}: ready in ${c.cooldowns[itemId] - state.round} round(s)`);
    return;
  }
  if (ab.gold) c.gold += ab.gold;                    // may go negative
  if (ab.drunkness) applyBuzzDelta(c, ab.drunkness);
  if (ab.buff) {
    const ex = c.activeBuffs.find(b => b.id === ab.buff.id);
    if (ex) ex.questsRemaining = ab.buff.durationQuests;
    else c.activeBuffs.push({ id: ab.buff.id, questsRemaining: ab.buff.durationQuests });
  }
  if (ab.cooldownRounds) c.cooldowns[itemId] = state.round + ab.cooldownRounds;
  saveState();
  refresh();
  toast(`${c.name} used ${ab.name}`);
}

/* ============================== ADMIN DASHBOARD ======================== */

function renderDM() {
  $("#round-count").textContent = state.round;
  renderDMCharacters();
  renderDMQuests();
}

function renderDMCharacters() {
  const wrap = $("#dm-characters");
  if (!state.characters.length) {
    wrap.innerHTML = `<p class="empty">No characters. Create them in the Characters section.</p>`;
    return;
  }
  wrap.innerHTML = state.characters.map(c => `
    <div class="card" data-id="${c.id}">
      <div class="char-top">
        <span class="char-name sm">${escapeHtml(c.name)}</span>
        <span class="char-meta gold-pill">${c.gold} ${COIN}</span>
      </div>
      ${renderBuzz(c)}
      <div class="row-actions">
        <button class="btn small ghost" data-action="open-detail" data-id="${c.id}">Detail</button>
        <button class="btn small" data-action="reward" data-id="${c.id}">${icon("gift")} Reward</button>
        <button class="btn small ghost" data-action="adjust" data-id="${c.id}">${icon("sliders")} Edit</button>
        <button class="btn small danger icon-only" data-action="delete-char" data-id="${c.id}" title="Delete" aria-label="Delete">${icon("trash")}</button>
      </div>
    </div>`).join("");
}

function renderDMQuests() {
  const wrap = $("#dm-quests");
  const quests = allQuests();
  if (!quests.length) { wrap.innerHTML = `<p class="empty">No quests.</p>`; return; }
  wrap.innerHTML = quests.map(q => {
    const log = state.questLog.find(l => l.questId === q.id);
    const done = log && log.status === "completed";
    const custom = String(q.id).startsWith("cq-");
    return `<div class="quest-item ${done ? "completed" : ""}">
      <div class="info">
        <strong>${escapeHtml(q.name)}</strong> ${done ? icon("check", "ok") : ""}<br>
        <span class="muted">${escapeHtml(q.description || "")}</span>
      </div>
      <div class="quest-actions">
        ${done
          ? `<button class="btn small ghost" data-action="reopen-quest" data-quest="${q.id}">Reopen</button>`
          : `<button class="btn small" data-action="complete-quest" data-quest="${q.id}">Complete</button>`}
        ${custom ? `<button class="btn small danger icon-only" data-action="delete-quest" data-quest="${q.id}" title="Delete" aria-label="Delete">${icon("trash")}</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

/* Next round — drops each character's drunkness by zone */
function nextRound() {
  state.round += 1;
  state.characters.forEach(c => {
    if (isFrozen(c)) return;   // paused / dead characters are unaffected
    applyBuzzDelta(c, -roundDrunknessDrop(c.buzz));
    for (const id of c.equipped) {   // per-round item income / drain
      const it = byId(ITEMS, id);
      if (!it || !it.perRound) continue;
      if (it.perRound.gold) c.gold += it.perRound.gold;               // may go negative
      if (it.perRound.drunkness) applyBuzzDelta(c, it.perRound.drunkness);
    }
  });
  saveState();
  refresh();
  toast(`Round ${state.round} — characters sobered up a bit`);
}

/* Mark a quest completed. Rewards are handed out separately via the Reward button.
 * Completing a quest ticks every character's quest-scoped buffs by one. */
function completeQuest(questId) {
  const q = byId(allQuests(), questId);
  if (!q) return;
  const existing = state.questLog.find(l => l.questId === questId);
  if (existing) { existing.status = "completed"; existing.round = state.round; }
  else state.questLog.push({ questId, status: "completed", round: state.round });
  state.characters.forEach(c => { if (!isFrozen(c)) tickBuffs(c); });
  saveState();
  refresh();
  toast(`Quest "${q.name}" completed`);
}

function reopenQuest(questId) {
  state.questLog = state.questLog.filter(l => l.questId !== questId);
  saveState();
  renderDM();
  toast("Quest reopened");
}

function deleteQuest(questId) {
  state.customQuests = state.customQuests.filter(q => q.id !== questId);
  state.questLog = state.questLog.filter(l => l.questId !== questId);
  saveState();
  renderDM();
  toast("Quest deleted");
}

function tickBuffs(character) {
  character.activeBuffs.forEach(b => b.questsRemaining -= 1);
  character.activeBuffs = character.activeBuffs.filter(b => b.questsRemaining > 0);
}

function openRewardModal(charId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  const itemOpts = ITEMS.map(i => `<option value="${i.id}">${i.name}</option>`).join("");
  const alcOpts  = `<option value="">— none —</option>` +
    ALCOHOL.map(a => `<option value="${a.id}">${a.name}</option>`).join("");

  openModal(`Reward: ${c.name}`, `
    <label>Gold <input type="number" id="rw-gold" value="0" min="0"></label>
    <label>Item <select id="rw-item"><option value="">— none —</option>${itemOpts}</select></label>
    <label>Alcohol <select id="rw-alc">${alcOpts}</select></label>
    <label class="inline"><input type="checkbox" id="rw-drink"> Drink the alcohol now (otherwise to backpack)</label>
  `, [
    { label: "Give reward", primary: true, onClick: () => {
        const gold = parseInt($("#rw-gold").value, 10) || 0;
        const itemId = $("#rw-item").value;
        const alcId = $("#rw-alc").value;
        c.gold += gold;
        if (itemId) c.inventory.push(itemId);
        if (alcId) {
          if ($("#rw-drink").checked) applyDrink(c, resolveThing(alcId), false);
          else c.inventory.push(alcId);
        }
        saveState();
        refresh();
        toast(`${c.name} rewarded`);
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

function openAdjustModal(charId) {
  const c = byId(state.characters, charId);
  if (!c) return;
  const statInputs = Object.keys(c.stats).map(k =>
    `<label>${STAT_LABEL[k] || k} <input type="number" id="adj-${k}" value="${c.stats[k]}"></label>`).join("");

  openModal(`DM edit: ${c.name}`, `
    <label>Drunkness (0–100) <input type="number" id="adj-buzz" value="${c.buzz}" min="0" max="100"></label>
    ${statInputs}
  `, [
    { label: "Save", primary: true, onClick: () => {
        c.buzz = clamp(parseInt($("#adj-buzz").value, 10) || 0, 0, 100);
        Object.keys(c.stats).forEach(k => {
          const v = parseInt($("#adj-" + k).value, 10);
          if (!Number.isNaN(v)) c.stats[k] = v;
        });
        saveState();
        refresh();
        toast(`${c.name} updated`);
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

function handleAddQuest(e) {
  e.preventDefault();
  const name = $("#q-name").value.trim();
  if (!name) { toast("Quest needs a name."); return; }
  state.customQuests.push({
    id: "cq-" + uuid(),
    name,
    description: $("#q-desc").value.trim()
  });
  saveState();
  $("#quest-form").reset();
  renderDM();
  toast("Quest added");
}

/* ================================= TAVERN =============================== */

/* Everything sellable in the Tavern: items + all drinks */
function tavernCatalog() {
  return [...ITEMS, ...ALCOHOL, ...SPECIAL_DRINKS];
}

/* Suggested (default) price shown to the DM — they set the final one */
function suggestedPrice(t) {
  return (t.price != null ? t.price : t.value) || 0;
}

function renderTavern() {
  const sel = $("#tavern-character");
  const prev = sel.value;
  sel.innerHTML = state.characters.length
    ? state.characters.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${c.gold} g)</option>`).join("")
    : `<option value="">— no character —</option>`;
  if (prev && state.characters.some(c => c.id === prev)) sel.value = prev;

  $("#tavern-list").innerHTML = tavernCatalog().map(t => {
    const icon = t.icon
      ? `<span class="shop-icon"><img src="${t.icon}" alt=""></span>`
      : `<span class="shop-icon empty"></span>`;
    return `
    <div class="shop-item">
      <div class="info">
        ${icon}
        <div class="shop-text">
          <strong>${t.name}</strong>
          <span class="muted">${describeThing(t.id)}</span>
        </div>
      </div>
      <div class="shop-buy">
        <span class="muted">~${suggestedPrice(t)} ${COIN}</span>
        <button class="btn small" data-action="buy" data-item="${t.id}">Buy</button>
      </div>
    </div>`;
  }).join("");
}

/* Buy modal — the DM types the price, it's deducted from the character's gold */
function openBuyModal(id) {
  const c = byId(state.characters, $("#tavern-character").value);
  if (!c) { toast("Select a character."); return; }
  const t = resolveThing(id);
  openModal(`Buy: ${t.name}`, `
    <p class="muted">Buyer: ${escapeHtml(c.name)} — ${c.gold} ${COIN}</p>
    <label>Price — set by the DM
      <input type="number" id="buy-price" value="${suggestedPrice(t)}" min="0">
    </label>
  `, [
    { label: "Buy", primary: true, onClick: () => {
        const price = parseInt($("#buy-price").value, 10) || 0;
        if (c.gold < price) { toast("Not enough gold."); return false; }
        c.gold -= price;
        c.inventory.push(t.id);       // purchase goes to the backpack
        saveState();
        renderTavern();
        toast(`${c.name} bought ${t.name} for ${price} gold`);
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

/* ============================ EXPORT / IMPORT .dnd ====================== */

function exportCampaign() {
  const payload = {
    meta: { exportedAt: new Date().toISOString().slice(0, 10), appVersion: APP_VERSION },
    characters: state.characters,
    questLog: state.questLog,
    customQuests: state.customQuests,
    round: state.round
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "campaign.dnd";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast("Campaign exported (campaign.dnd)");
}

function importCampaign(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); }
    catch { toast("File is not a valid .dnd (JSON)."); return; }
    openModal("Import campaign?", `
      <p>This will <strong>overwrite</strong> current data (${state.characters.length} characters). Continue?</p>
      <p class="muted">The file contains ${(data.characters || []).length} characters,
      exported ${data.meta ? data.meta.exportedAt : "?"}.</p>
    `, [
      { label: "Overwrite", primary: true, onClick: () => {
          state = normalizeState(data);
          saveState();
          navigate("dm");
          toast("Campaign imported");
          return true;
        }
      },
      { label: "Cancel", ghost: true }
    ]);
  };
  reader.readAsText(file);
}

/* ================================ MODAL ================================= */

function openModal(title, bodyHtml, actions) {
  $("#modal-title").textContent = title;
  $("#modal-body").innerHTML = bodyHtml;
  const actWrap = $("#modal-actions");
  actWrap.innerHTML = "";
  (actions || []).forEach(a => {
    const btn = document.createElement("button");
    btn.className = "btn" + (a.ghost ? " ghost" : "") + (a.small ? " small" : "");
    btn.textContent = a.label;
    btn.addEventListener("click", () => {
      const keepOpen = a.onClick ? a.onClick() === false : false;
      if (!keepOpen) closeModal();
    });
    actWrap.appendChild(btn);
  });
  $("#modal-backdrop").hidden = false;
}

function closeModal() {
  $("#modal-backdrop").hidden = true;
  $("#modal-body").innerHTML = "";
}

/* ================================ WIKI =================================
 * Fullscreen documentation. The contents index (right) and every detail page
 * are generated live from the data files, so anything the user adds to
 * data/data.js shows up automatically. */

const GITHUB_URL = "https://github.com/jirkacepelka/TavernMaster";

/* Categories — each reads a live global array of { id, name, ... } */
const WIKI_CATS = [
  { key: "races",   title: "Races",          desc: "Playable ancestries and their stat modifiers.", list: () => RACES },
  { key: "classes", title: "Classes",        desc: "Roles, stat modifiers and starting gear.",      list: () => CLASSES },
  { key: "items",   title: "Items",          desc: "Weapons, armor, tools and consumables.",         list: () => ITEMS },
  { key: "alcohol", title: "Alcohol",        desc: "Common drinks sold and rewarded.",               list: () => ALCOHOL },
  { key: "special", title: "Special drinks", desc: "Special brews with buffs and nerfs.",            list: () => SPECIAL_DRINKS },
  { key: "quests",  title: "Quests",         desc: "Adventures the barkeep can hand out.",           list: () => wikiQuestsSorted() }
];
const wikiCat = key => WIKI_CATS.find(c => c.key === key);

/* Quest completion info from the log; round may be null for older saves */
function questCompletion(questId) {
  const log = state.questLog.find(l => l.questId === questId && l.status === "completed");
  if (!log) return { done: false, round: null };
  return { done: true, round: Number.isFinite(log.round) ? log.round : null };
}

/* Quests sorted for the wiki: completed first, most recent round on top */
function wikiQuestsSorted() {
  return allQuests().slice().sort((a, b) => {
    const ia = questCompletion(a.id), ib = questCompletion(b.id);
    if (ia.done !== ib.done) return ia.done ? -1 : 1;
    if (ia.done && ib.done) return (ib.round ?? -1) - (ia.round ?? -1);
    return 0;
  });
}

let wikiState = { view: "home", category: null, entryId: null };
let wikiOpen = new Set();   /* expanded categories in the index (collapsed by default) */
let wikiQuery = "";         /* Tavernpedia search query */

function modsToText(mods) {
  const s = Object.entries(mods || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${STAT_LABEL[k] || k} ${v >= 0 ? "+" : ""}${v}`)
    .join(", ");
  return s || "—";
}

function wikiThumb(key, e) {
  if (key === "races")
    return `<span class="wiki-thumb">${e.avatar ? `<img src="${e.avatar}" alt="">` : icon("user")}</span>`;
  if (e.icon)
    return `<span class="wiki-thumb"><img src="${e.icon}" alt=""></span>`;
  const catIcon = { items: "box", classes: "hat", alcohol: "drink", special: "sparkles", quests: "scroll" }[key] || "box";
  return `<span class="wiki-thumb">${icon(catIcon)}</span>`;
}

/* One-line summary used in lists */
function wikiShort(key, e) {
  if (key === "races" || key === "classes") return modsToText(e.statMods);
  if (key === "items") return describeThing(e.id);
  if (key === "alcohol") return `${e.price} g · Drunkness +${e.buzzDelta}`;
  if (key === "special") return `${e.price} g · Drunkness ${e.buzzDelta >= 0 ? "+" : ""}${e.buzzDelta}`;
  if (key === "quests") {
    const s = questCompletion(e.id);
    if (s.done) return s.round != null ? `✓ Completed · round ${s.round}` : "✓ Completed";
    return e.description || "Open";
  }
  return "";
}

/* ---- navigation ---- */
function wikiGo(view, category, entryId) {
  wikiState = { view, category: category || null, entryId: entryId || null };
  if (category) wikiOpen.add(category);   /* auto-expand the active category */
  renderWikiMain();
  renderWikiAside();
  const main = $("#wiki-main");
  if (main) main.scrollTop = 0;
}

function wikiToggle(key) {
  if (wikiOpen.has(key)) wikiOpen.delete(key);
  else wikiOpen.add(key);
  renderWikiAside();
}

function openWiki() {
  if (wikiState.view !== "home" && wikiState.view !== "category" && wikiState.view !== "entry")
    wikiState = { view: "home", category: null, entryId: null };
  renderWikiMain();
  renderWikiAside();
  $("#wiki-overlay").hidden = false;
}
function closeWiki() { $("#wiki-overlay").hidden = true; }

/* ---- left-hand contents index (with search) ---- */
function renderWikiAside() {
  $("#wiki-aside").innerHTML = `
    <div class="wiki-search"><input type="search" id="wiki-search" placeholder="Search Tavernpedia…" value="${escapeHtml(wikiQuery)}" autocomplete="off"></div>
    <div class="wiki-aside-title">Contents</div>
    <button class="wiki-link home ${wikiState.view === "home" ? "active" : ""}" data-action="wiki-home">Overview</button>
    <div id="wiki-index"></div>`;
  renderWikiIndex();
}

function renderWikiIndex() {
  const q = wikiQuery.trim().toLowerCase();
  const groups = WIKI_CATS.map(cat => {
    let entries = cat.list();
    if (q) entries = entries.filter(e =>
      (e.name || "").toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q));
    if (q && !entries.length) return "";
    const active = wikiState.category === cat.key;
    const open = q ? true : wikiOpen.has(cat.key);   // searching force-expands matches
    const subs = entries.map(e => {
      const on = wikiState.view === "entry" && wikiState.category === cat.key && wikiState.entryId === e.id;
      return `<button class="wiki-link sub ${on ? "active" : ""}" data-action="wiki-entry" data-cat="${cat.key}" data-entry="${escapeHtml(e.id)}">${escapeHtml(e.name)}</button>`;
    }).join("");
    return `<div class="wiki-group ${open ? "open" : ""}">
      <div class="wiki-cat-row ${active ? "active" : ""}">
        <button class="wiki-caret" data-action="wiki-toggle" data-cat="${cat.key}" aria-label="Toggle">▸</button>
        <button class="wiki-link cat" data-action="wiki-cat" data-cat="${cat.key}">${cat.title}<span class="wiki-count">${entries.length}</span></button>
      </div>
      <div class="wiki-subs">${subs}</div>
    </div>`;
  }).join("");

  $("#wiki-index").innerHTML = groups || `<p class="empty" style="padding:.5rem">No matches.</p>`;
}

/* ---- breadcrumbs ---- */
function wikiCrumbs(parts) {
  return `<div class="wiki-crumbs">${parts.map((p, i) => {
    const sep = i > 0 ? `<span class="sep">/</span>` : "";
    if (p.action) return `${sep}<span class="crumb link" data-action="${p.action}"${p.cat ? ` data-cat="${p.cat}"` : ""}>${escapeHtml(p.label)}</span>`;
    return `${sep}<span class="crumb">${escapeHtml(p.label)}</span>`;
  }).join("")}</div>`;
}

/* ---- main pane ---- */
function renderWikiMain() {
  const host = $("#wiki-main");
  if (wikiState.view === "category") host.innerHTML = wikiCategoryHtml(wikiState.category);
  else if (wikiState.view === "entry") host.innerHTML = wikiEntryHtml(wikiState.category, wikiState.entryId);
  else host.innerHTML = wikiHomeHtml();
}

function wikiHomeHtml() {
  const cards = WIKI_CATS.map(cat => `
    <button class="wiki-topic" data-action="wiki-cat" data-cat="${cat.key}">
      <div class="wiki-topic-top"><strong>${cat.title}</strong><span class="wiki-count">${cat.list().length}</span></div>
      <span class="muted">${cat.desc}</span>
    </button>`).join("");

  return `
    <div class="wiki-eyebrow">Documentation</div>
    <h1 class="wiki-title">Tavernpedia</h1>
    <div class="wiki-intro">
      <p>Tavern Master is a lightweight, browser-based DnD companion built around a tavern where the barkeep doubles as the Dungeon Master. Characters take on quests, drink to earn buffs (and debuffs), manage their gear, and sober up over rounds — all with no backend, saved right in your browser.</p>
      <p>This wiki is generated live from the game's data files. Every race, class, item, drink and quest here comes straight from <code>data/data.js</code> — add something there and it appears automatically.</p>
    </div>

    <div class="wiki-callout">
      <div class="wiki-callout-label">Heads up</div>
      <h2>A lot of this is vibecoded — and contributions are welcome</h2>
      <p>A large part of this project was “vibecoded”: built by prompting an AI assistant rather than hand-writing every line. Expect rough edges and the occasional surprise.</p>
      <p>Pull requests and commits are very welcome — new <strong>weapons &amp; items</strong>, <strong>characters</strong>, races, drinks, or whole <strong>features</strong>. The game content lives in <code>data/data.js</code> and is designed to be easy to extend.</p>
      <a class="btn accent" href="${GITHUB_URL}" target="_blank" rel="noopener">Open the GitHub repo →</a>
    </div>

    <h2 class="wiki-browse-title">Browse</h2>
    <div class="wiki-topics">${cards}</div>`;
}

function wikiCategoryHtml(key) {
  const cat = wikiCat(key);
  if (!cat) return wikiHomeHtml();
  const entries = cat.list();
  const cards = entries.map(e => `
    <button class="wiki-entry-card" data-action="wiki-entry" data-cat="${key}" data-entry="${escapeHtml(e.id)}">
      ${wikiThumb(key, e)}
      <div class="wiki-entry-text"><strong>${escapeHtml(e.name)}</strong><span class="muted">${escapeHtml(wikiShort(key, e))}</span></div>
    </button>`).join("");
  return `
    ${wikiCrumbs([{ label: "Overview", action: "wiki-home" }, { label: cat.title }])}
    <h1 class="wiki-title">${cat.title} <span class="muted">(${entries.length})</span></h1>
    <p class="muted wiki-cat-desc">${cat.desc}</p>
    <div class="wiki-entry-grid">${cards || '<p class="empty">Nothing here yet.</p>'}</div>`;
}

function wikiEntryHtml(key, id) {
  const cat = wikiCat(key);
  if (!cat) return wikiHomeHtml();
  const e = cat.list().find(x => x.id === id);
  if (!e) return wikiCategoryHtml(key);

  const crumbs = wikiCrumbs([
    { label: "Overview", action: "wiki-home" },
    { label: cat.title, action: "wiki-cat", cat: key },
    { label: e.name }
  ]);
  const statTable = mods => {
    const rows = STAT_KEYS.map(k => `<tr><td>${STAT_LABEL[k]}</td><td>${(mods && mods[k]) ? (mods[k] >= 0 ? "+" : "") + mods[k] : "0"}</td></tr>`).join("");
    return `<table class="wiki-table"><thead><tr><th>Stat</th><th>Modifier</th></tr></thead><tbody>${rows}</tbody></table>`;
  };

  let body = "";
  if (key === "races") {
    body = `
      <div class="wiki-entry-hero">
        <div class="wiki-portrait">${e.avatar ? `<img src="${e.avatar}" alt="">` : icon("user")}</div>
        <p>${escapeHtml(e.description || "")}</p>
      </div>
      <h2>Stat modifiers</h2>${statTable(e.statMods)}`;
  } else if (key === "classes") {
    const start = (e.startingItems || []).map(iid => {
      const it = byId(ITEMS, iid);
      return it ? `<button class="wiki-inline-link" data-action="wiki-entry" data-cat="items" data-entry="${it.id}">${escapeHtml(it.name)}</button>` : escapeHtml(iid);
    }).join(", ") || "—";
    body = `<h2>Stat modifiers</h2>${statTable(e.statMods)}<h2>Starting gear</h2><p>${start}</p>`;
  } else if (key === "items") {
    body = `
      ${e.description ? `<p>${escapeHtml(e.description)}</p>` : ""}
      <div class="wiki-entry-hero">
        <div class="wiki-portrait item">${e.icon ? `<img src="${e.icon}" alt="">` : icon("box")}</div>
        <div>
          <p><strong>Type:</strong> ${e.type}${EQUIPPABLE_TYPES.includes(e.type) ? " (equippable)" : " (consumable)"}</p>
          <p><strong>Effect:</strong> ${itemStatText(e)}</p>
          ${e.perRound ? `<p><strong>Per round (equipped):</strong> ${perRoundText(e.perRound)}</p>` : ""}
          ${e.ability ? `<p><strong>Active ability:</strong> ${escapeHtml(e.ability.name)}${e.ability.description ? " — " + escapeHtml(e.ability.description) : ""} <span class="muted">(${escapeHtml(abilityEffectText(e.ability))})</span></p>` : ""}
          <p><strong>Base value:</strong> ${e.value} ${COIN}</p>
        </div>
      </div>`;
  } else if (key === "alcohol") {
    body = `<div class="wiki-entry-hero">
      <div class="wiki-portrait item">${e.icon ? `<img src="${e.icon}" alt="">` : icon("drink")}</div>
      <ul class="wiki-facts">
      <li><strong>Price:</strong> ${e.price} ${COIN}</li>
      <li><strong>Drunkness:</strong> +${e.buzzDelta}</li>
      <li><strong>Real-world serving:</strong> ${icon("drink")} ${escapeHtml(e.realWorldServing)}</li></ul></div>`;
  } else if (key === "special") {
    body = `<div class="wiki-entry-hero">
      <div class="wiki-portrait item">${e.icon ? `<img src="${e.icon}" alt="">` : icon("sparkles")}</div>
      <ul class="wiki-facts">
      <li><strong>Price:</strong> ${e.price} ${COIN}</li>
      <li><strong>Drunkness:</strong> ${e.buzzDelta >= 0 ? "+" : ""}${e.buzzDelta}</li>
      <li><strong>Buff:</strong> ${e.buff ? escapeHtml(e.buff.name) + " — " + modsToText(e.buff.statMods) + " (for " + e.buff.durationQuests + " quest/s)" : "—"}</li>
      <li><strong>Real-world serving:</strong> ${icon("drink")} ${escapeHtml(e.realWorldServing)}</li></ul></div>`;
  } else if (key === "quests") {
    const s = questCompletion(e.id);
    const status = s.done
      ? `<span class="badge buff">✓ Completed${s.round != null ? " — round " + s.round : ""}</span>`
      : `<span class="badge neutral">Open</span>`;
    body = `<p>${status}</p>
      <p>${escapeHtml(e.description || "")}</p>
      <p class="muted">Rewards are handed out manually by the barkeep via the Reward button.</p>`;
  }

  return `${crumbs}<h1 class="wiki-title">${escapeHtml(e.name)}</h1><div class="wiki-article">${body}</div>`;
}

/* ================================ INIT ================================= */

function init() {
  loadState();
  fillCreateDropdowns();

  // inject SVG icons into static markup (buttons/headings with data-icon)
  $$("[data-icon]").forEach(el => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon) + " "));

  document.body.addEventListener("click", (e) => {
    const navEl = e.target.closest("[data-nav]");
    if (navEl) { navigate(navEl.dataset.nav); return; }
    const actEl = e.target.closest("[data-action]");
    if (actEl) handleAction(actEl.dataset.action, actEl);
  });

  $("#c-race").addEventListener("change", renderCreatePreview);
  $("#c-class").addEventListener("change", renderCreatePreview);
  $("#create-form").addEventListener("submit", handleCreateSubmit);

  $("#quest-form").addEventListener("submit", handleAddQuest);
  $("#btn-export").addEventListener("click", exportCampaign);
  $("#btn-import").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importCampaign(e.target.files[0]);
    e.target.value = "";
  });

  $("#tavern-character").addEventListener("change", renderTavern);

  $("#modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });

  $("#nav-wiki").addEventListener("click", openWiki);
  $("#wiki-close").addEventListener("click", closeWiki);
  $("#wiki-aside").addEventListener("input", (e) => {
    if (e.target.id === "wiki-search") { wikiQuery = e.target.value; renderWikiIndex(); }
  });
  $("#wiki-overlay").addEventListener("click", (e) => {
    if (e.target.id === "wiki-overlay") closeWiki();
  });

  navigate("players");
}

function handleAction(action, el) {
  const id = el.dataset.id;
  switch (action) {
    case "open-detail":    navigate("detail", id); break;
    case "drink":          openDrinkModal(id); break;
    case "drink-item":     drinkItemFromInventory(id, el.dataset.item); break;
    case "equip":          equipItem(id, el.dataset.item); break;
    case "unequip":        unequipItem(id, el.dataset.item); break;
    case "remove-item":    removeItem(id, el.dataset.item); break;
    case "use-ability":    useAbility(id, el.dataset.item); break;
    case "reward":         openRewardModal(id); break;
    case "adjust":         openAdjustModal(id); break;
    case "edit-story":     openStoryModal(id); break;
    case "edit-avatar":    openAvatarModal(id); break;
    case "toggle-pause":   togglePause(id); break;
    case "toggle-dead":    toggleDead(id); break;
    case "delete-char":    deleteCharacter(id); break;
    case "complete-quest": completeQuest(el.dataset.quest); break;
    case "reopen-quest":   reopenQuest(el.dataset.quest); break;
    case "delete-quest":   deleteQuest(el.dataset.quest); break;
    case "buy":            openBuyModal(el.dataset.item); break;
    case "next-round":     nextRound(); break;
    case "reset-game":     openResetModal(); break;
    case "wiki-home":      wikiGo("home"); break;
    case "wiki-cat":       wikiGo("category", el.dataset.cat); break;
    case "wiki-entry":     wikiGo("entry", el.dataset.cat, el.dataset.entry); break;
    case "wiki-toggle":    wikiToggle(el.dataset.cat); break;
  }
}

/* Reset game — deletes all characters, quests and rounds */
function openResetModal() {
  openModal("Reset game?", `
    <p>This will <strong>permanently delete</strong> all characters
    (${state.characters.length}), completed quests, and the round counter.</p>
    <p class="muted">Game data (races, items…) stays. I recommend exporting the
    campaign first.</p>
  `, [
    { label: "Reset", primary: true, onClick: () => {
        state = { characters: [], questLog: [], customQuests: [], round: 1 };
        selectedCharId = null;
        saveState();
        navigate("players");
        toast("Game reset");
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

function togglePause(id) {
  const c = byId(state.characters, id);
  if (!c) return;
  c.paused = !c.paused;
  saveState();
  refresh();
  toast(c.paused ? `${c.name} paused` : `${c.name} resumed`);
}

function toggleDead(id) {
  const c = byId(state.characters, id);
  if (!c) return;
  if (c.dead) {   // revive immediately
    c.dead = false;
    saveState();
    refresh();
    toast(`${c.name} revived`);
    return;
  }
  openModal("Kill character?", `<p>Mark <strong>${escapeHtml(c.name)}</strong> as dead? They stay in the roster but are frozen (no drunkness changes, no round effects). You can revive them later.</p>`, [
    { label: "Kill", primary: true, onClick: () => {
        c.dead = true;
        saveState();
        refresh();
        toast(`${c.name} was killed`);
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

/* Edit a character's profile image from the GUI (stored locally as a data URL) */
function openAvatarModal(id) {
  const c = byId(state.characters, id);
  if (!c) return;
  openModal(`Image: ${c.name}`, `
    <div class="avatar-modal-preview"><div class="avatar">${avatarHtml(c)}</div></div>
    <label>Upload image <input type="file" id="avatar-file" accept="image/*"></label>
    <p class="muted">The image is cropped to a square, resized to 256px and stored locally in your browser (it never leaves your device).</p>
  `, [
    { label: "Reset to race default", ghost: true, onClick: () => {
        c.avatar = null;
        saveState();
        refresh();
        toast("Avatar reset to default");
        return true;
      }
    },
    { label: "Close", ghost: true }
  ]);
  $("#avatar-file").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) loadAvatarImage(c, file);
  });
}

function loadAvatarImage(c, file) {
  if (!/^image\//.test(file.type)) { toast("That's not an image."); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      const scale = Math.max(size / img.width, size / img.height);   // cover
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      try { c.avatar = canvas.toDataURL("image/webp", 0.85); }
      catch { c.avatar = canvas.toDataURL("image/jpeg", 0.85); }
      saveState();
      closeModal();
      refresh();
      toast("Avatar updated");
    };
    img.onerror = () => toast("Could not read that image.");
    img.src = reader.result;
  };
  reader.onerror = () => toast("Could not read that file.");
  reader.readAsDataURL(file);
}

function deleteCharacter(id) {
  const c = byId(state.characters, id);
  if (!c) return;
  openModal("Delete character?", `<p>Really delete "${escapeHtml(c.name)}"?</p>`, [
    { label: "Delete", primary: true, onClick: () => {
        state.characters = state.characters.filter(x => x.id !== id);
        saveState();
        navigate("dm");
        toast("Character deleted");
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

document.addEventListener("DOMContentLoaded", init);
