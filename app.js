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
const STAT_LABEL = { str: "Strength", dex: "Dexterity", int: "Intelligence", con: "Constitution", def: "Defense", heal: "Healing" };
const RACE_EMOJI = { human: "🧑", elf: "🧝", dwarf: "🧔", orc: "👹", tauren: "🐂", goblin: "👺", murlock: "🐟" };

/* Avatar inner content: character image → race image → emoji fallback */
function avatarHtml(c) {
  const src = c.avatar || (byId(RACES, c.raceId) || {}).avatar;
  if (src) return `<img src="${src}" alt="">`;
  return RACE_EMOJI[c.raceId] || "🧑";
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
    drinkHistory: Array.isArray(c.drinkHistory) ? c.drinkHistory : []
  };
}

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
    drinkHistory: []
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
  return null;
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

/* Effective stats = base + active buffs + equipped items */
function effectiveStats(character) {
  const out = { ...character.stats };
  for (const [k, v] of Object.entries(sumBuffMods(character))) out[k] = (out[k] || 0) + v;
  for (const [k, v] of Object.entries(sumEquipMods(character))) out[k] = (out[k] || 0) + v;
  return out;
}

function renderBuzz(character) {
  const debuff = getZoneDebuff(character.buzz);
  const zoneLabel = { low: "Sober", optimal: "Optimal", high: "Drunk" }[getBuzzZone(character.buzz)];
  return `
    <div class="buzz-wrap">
      <div class="buzz-head">Drunkness — ${zoneLabel}
        ${debuff ? `<span class="badge debuff zone-badge" title="${debuff.desc}">⚠ ${debuff.name}</span>` : ""}</div>
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
    return `<span class="badge buff">✨ ${name} (${modsStr}) — ${ab.questsRemaining} q left</span>`;
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
  if (t.effect && Object.keys(t.effect).length)
    return Object.entries(t.effect).map(([k, v]) => `${v >= 0 ? "+" : ""}${v} ${STAT_LABEL[k] || k}`).join(", ");
  return "No effect";
}

function thingBuffs(id) {
  const t = resolveThing(id);
  if (t.kind === "item") return !!(t.effect && Object.keys(t.effect).length);
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
  return `<button class="item-sq" data-tip="${tip}" ${attrs}>
    <span class="sq-inner">${inner}</span>${dot}
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
    wrap.innerHTML = `<p class="empty">No characters yet. Create the first one with the "＋ New character" button.</p>`;
    return;
  }
  wrap.innerHTML = state.characters.map(c => {
    const race = byId(RACES, c.raceId), cls = byId(CLASSES, c.classId);
    const zone = getBuzzZone(c.buzz);
    return `<div class="player-row" data-action="open-detail" data-id="${c.id}">
      <div class="avatar sm">${avatarHtml(c)}</div>
      <div class="row-main">
        <div class="row-name">${escapeHtml(c.name)}</div>
        <div class="tag-row">
          <span class="badge pill">${cls ? cls.name : "?"}</span>
          <span class="badge pill">${race ? race.name : "?"}</span>
        </div>
      </div>
      <div class="row-buzz">
        <div class="mini-bar"><div class="buzz-fill ${zone}" style="width:${c.buzz}%"></div></div>
        <span class="muted">${c.buzz}% drunkness</span>
      </div>
      <div class="row-gold gold-pill">${c.gold} 🪙</div>
      <div class="row-arrow">›</div>
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

  host.innerHTML = `
    <div class="detail-hero">
      <div class="avatar">${avatarHtml(c)}</div>
      <div class="hero-info">
        <div class="hero-top">
          <div class="char-name">${escapeHtml(c.name)}</div>
          <button class="btn" data-action="drink" data-id="${c.id}">🍷 Drink</button>
        </div>
        <div class="tag-row">
          <span class="badge pill">${cls ? cls.name : "?"}</span>
          <span class="badge pill">${race ? race.name : "?"}</span>
          <span class="badge neutral"><span class="gold-pill">${c.gold} 🪙</span></span>
        </div>
        <div class="stat-line">
          <span class="lbl">Stats:</span>
          <div class="stat-pills">${renderStatPills(eff, c.stats)}</div>
        </div>
        ${renderBuzz(c)}
        <div class="buff-row">${renderBuffBadges(c) || '<span class="muted">No active buffs.</span>'}</div>
      </div>
    </div>

    <div class="items-section-title">Equipped items</div>
    ${renderItemRow(c.equipped, "equipped", c.id, "Nothing equipped.")}

    <div class="items-section-title">In backpack</div>
    ${renderItemRow(c.inventory, "backpack", c.id, "Empty backpack.")}

    <div class="row-actions">
      <button class="btn ghost small" data-nav="players">← Back to characters</button>
    </div>`;
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
      <p class="badge neutral">🍹 Actually drink: ${escapeHtml(d.realWorldServing || "?")}</p>`;
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
      <input type="checkbox" id="drink-consumed"> Drank it IRL ✅
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
    <p class="badge neutral">🍹 Actually drink: ${escapeHtml(d.realWorldServing || "?")}</p>
    <p class="muted">Drunkness ${d.buzzDelta >= 0 ? "+" : ""}${d.buzzDelta}${d.buff ? ", buff " + d.buff.name : ""}</p>
    <label class="inline"><input type="checkbox" id="drink-consumed"> Drank it IRL ✅</label>
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

/* ============================== ADMIN DASHBOARD ======================== */

function renderDM() {
  $("#round-count").textContent = state.round;
  renderDMCharacters();
  renderDMQuests();
  $("#q-alcohol").innerHTML = `<option value="">— none —</option>` +
    ALCOHOL.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
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
        <span class="char-meta gold-pill">${c.gold} 🪙</span>
      </div>
      ${renderBuzz(c)}
      <div class="row-actions">
        <button class="btn small ghost" data-action="open-detail" data-id="${c.id}">Detail</button>
        <button class="btn small" data-action="reward" data-id="${c.id}">🎁 Reward</button>
        <button class="btn small ghost" data-action="adjust" data-id="${c.id}">🛠 Edit</button>
        <button class="btn small danger" data-action="delete-char" data-id="${c.id}">🗑</button>
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
    const alc = q.rewardAlcohol ? (byId(ALCOHOL, q.rewardAlcohol) || {}).name : null;
    const items = (q.rewardItems || []).map(id => (byId(ITEMS, id) || {}).name || id);
    return `<div class="quest-item ${done ? "completed" : ""}">
      <div class="info">
        <strong>${escapeHtml(q.name)}</strong> ${done ? "✅" : ""}<br>
        <span class="muted">${escapeHtml(q.description || "")}</span><br>
        <span class="muted">Reward: ${q.rewardGold || 0} 🪙${items.length ? ", " + items.join(", ") : ""}${alc ? ", " + alc : ""}</span>
      </div>
      ${done ? "" : `<button class="btn small" data-action="complete-quest" data-quest="${q.id}">Complete</button>`}
    </div>`;
  }).join("");
}

/* Next round — drops each character's drunkness by zone */
function nextRound() {
  state.round += 1;
  state.characters.forEach(c => applyBuzzDelta(c, -roundDrunknessDrop(c.buzz)));
  saveState();
  refresh();
  toast(`Round ${state.round} — characters sobered up a bit`);
}

function openCompleteQuestModal(questId) {
  const q = byId(allQuests(), questId);
  if (!q) return;
  if (!state.characters.length) { toast("Create a character first."); return; }
  const opts = state.characters.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  const alc = q.rewardAlcohol ? (byId(ALCOHOL, q.rewardAlcohol) || {}).name : null;
  const items = (q.rewardItems || []).map(id => (byId(ITEMS, id) || {}).name || id);

  openModal(`Complete: ${q.name}`, `
    <p class="muted">Reward: ${q.rewardGold || 0} 🪙${items.length ? ", " + items.join(", ") : ""}${alc ? ", alcohol: " + alc : ""}</p>
    <label>Assign reward to
      <select id="reward-char">${opts}</select>
    </label>
    ${alc ? `<label class="inline"><input type="checkbox" id="drink-alc"> Character drinks the alcohol now (otherwise to backpack)</label>` : ""}
  `, [
    { label: "Complete quest", primary: true, onClick: () => {
        const c = byId(state.characters, $("#reward-char").value);
        completeQuest(q, c, alc ? $("#drink-alc").checked : false);
        return true;
      }
    },
    { label: "Cancel", ghost: true }
  ]);
}

function completeQuest(q, character, drinkAlcohol) {
  if (!character) return;
  character.gold += q.rewardGold || 0;
  (q.rewardItems || []).forEach(id => character.inventory.push(id));
  if (q.rewardAlcohol) {
    const a = byId(ALCOHOL, q.rewardAlcohol);
    if (a && drinkAlcohol) applyDrink(character, resolveThing(a.id), false);
    else if (a) character.inventory.push(a.id);
  }
  tickBuffs(character);
  const existing = state.questLog.find(l => l.questId === q.id);
  if (existing) existing.status = "completed";
  else state.questLog.push({ questId: q.id, status: "completed" });
  saveState();
  refresh();
  toast(`Quest "${q.name}" completed`);
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
    description: $("#q-desc").value.trim(),
    rewardGold: parseInt($("#q-gold").value, 10) || 0,
    rewardItems: [],
    rewardAlcohol: $("#q-alcohol").value || null
  });
  saveState();
  $("#quest-form").reset();
  renderDM();
  toast("Quest added");
}

/* ================================= TAVERN =============================== */

function renderTavern() {
  const sel = $("#tavern-character");
  const prev = sel.value;
  sel.innerHTML = state.characters.length
    ? state.characters.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${c.gold} 🪙)</option>`).join("")
    : `<option value="">— no character —</option>`;
  if (prev && state.characters.some(c => c.id === prev)) sel.value = prev;

  $("#tavern-list").innerHTML = ALCOHOL.map(a => `
    <div class="shop-item">
      <div class="info">
        <strong>${a.name}</strong> — <span class="gold-pill">${a.price} 🪙</span><br>
        <span class="muted">Drunkness +${a.buzzDelta} · 🍹 ${a.realWorldServing}</span>
      </div>
      <button class="btn small" data-action="buy" data-alc="${a.id}">Buy</button>
    </div>`).join("");
}

function handleBuy(alcId) {
  const c = byId(state.characters, $("#tavern-character").value);
  if (!c) { toast("Select a character."); return; }
  const a = byId(ALCOHOL, alcId);
  if (!a) return;
  if (c.gold < a.price) { toast("Not enough gold."); return; }
  c.gold -= a.price;
  c.inventory.push(a.id);          // bought drink goes to the backpack, drunk in detail
  saveState();
  renderTavern();
  toast(`${c.name} bought ${a.name} (to backpack)`);
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

/* ================================ INIT ================================= */

function init() {
  loadState();
  fillCreateDropdowns();

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
    case "reward":         openRewardModal(id); break;
    case "adjust":         openAdjustModal(id); break;
    case "delete-char":    deleteCharacter(id); break;
    case "complete-quest": openCompleteQuestModal(el.dataset.quest); break;
    case "buy":            handleBuy(el.dataset.alc); break;
    case "next-round":     nextRound(); break;
    case "reset-game":     openResetModal(); break;
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
