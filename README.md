# 🍺 Tavern Master

A lightweight DnD companion where the **barkeep = DM** and **alcohol = a source of
buffs/debuffs** and a quest reward. A static web app — no build, no dependencies.

## Running it

Two options:

1. **Simplest:** double-click `index.html`. Game data loads as a plain
   `<script src="data/data.js">`, so the app runs from `file://` with no server.
2. **Via a local server** (optional, handy for development):
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```
   then open `http://localhost:8000`.

State (characters, quests, gold) is saved in the browser's `localStorage` —
nothing is sent to a server.

## Game mechanics in short

- **Drunkness** 0–100, starts at 50.
  - `0–34` → **Sober Slump** debuff
  - `35–65` → optimal, no penalty
  - `66–100` → **Drunkenness** debuff
  - The debuff is tied to the zone, not the drink — once back in 35–65 it clears.
- **Drink** ("🍷 Drink" on the character detail): either **from the backpack**
  (consumes an inventory drink) or **general** from the menu. The effect
  (drunkness + optional buff/nerf) applies only after ticking "Drank it IRL".
- **Rounds** (Admin → "Next round"): each round characters sober up a bit —
  `1%` (zone 0–34), `2%` (35–65) or `3%` (66–100).
- **Inventory**: equipped items vs. backpack. Equipped gear (weapons/armor/
  trinkets/tools) **buffs stats** via its `effect`. Hover an item to see what it
  buffs in the tooltip.
- **Quests** are text only (name + description). The DM hands out rewards
  manually with the 🎁 Reward button on a character.
- **Tavern**: a catalog of every item and drink. Hit Buy and the DM types the
  price, which is deducted from the selected character's gold; the item goes to
  their backpack.
- **Story**: each character has a free-text story, editable from their detail.
- **Wiki**: a floating 📖 button (bottom-right) opens a reference of all races,
  classes, items, alcohol, special drinks and quests — generated live from
  `data/data.js`, so anything you add there shows up automatically.
- **Diversity** (optional feature flag): if a character drinks the same drink
  3 times in a row, the next identical drink gives 50% less drunkness.

## Screens

- **Characters** — character list (clickable rows) + "＋ New character" button.
- **Character detail** — avatar, stats (with buffs), drunkness bar, active buffs,
  equipped items and backpack (equip / unequip / drink), "Drink" button.
- **New character** — name, race, class, live stat preview.
- **Admin** — character overview, round counter + button, quests (complete +
  reward), direct DM edits of stats/drunkness, add a quest, export/import.
- **Tavern** — buy drinks for gold into the backpack.

## Editing content (races, items, alcohol…)

All game content lives in [`data/data.js`](data/data.js). Edit the arrays and the
app changes — no need to touch `app.js`. Available:

| Constant                  | What it holds                                           |
|---------------------------|---------------------------------------------------------|
| `BASE_STATS`              | base stats of a new character (`str/dex/int/con`)       |
| `RACES`                   | races + their `statMods` + `avatar` image path          |
| `CLASSES`                 | classes + `statMods` + `startingItems`                  |
| `ITEMS`                   | items (weapons, armor, potions…), `effect`, `icon`      |
| `ALCOHOL`                 | common drinks for sale/rewards (`buzzDelta`, `price`)   |
| `SPECIAL_DRINKS`          | special drinks with a buff/nerf and a real-world serving|
| `QUESTS`                  | predefined quests                                       |
| `DIVERSITY_BONUS_ENABLED` | `true`/`false` — toggles the drink-diversity bonus      |

Example of a new race:
```js
{ id: "gnome", name: "Gnome", statMods: { str: -1, dex: 1, int: 2, con: 0 },
  avatar: "assets/races/gnome.webp", description: "Inventors and alchemists." }
```

Each new `id` must be unique. `startingItems` and `rewardItems` reference `id`s
from `ITEMS`; `rewardAlcohol` references an `id` from `ALCOHOL`.

## Export / Import a campaign

- **Export** (Admin dashboard) downloads `campaign.dnd` — plain JSON with a
  different extension. Good for a backup or continuing next time.
- **Import** loads a `.dnd` file and, after confirmation, **overwrites** the
  current state.

## Deploying

The project is fully static (no build step).

### GitHub Pages
1. Push the repo to GitHub.
2. **Settings → Pages**.
3. **Source:** "Deploy from a branch", **Branch:** `main`, folder `/ (root)` → Save.
4. It goes live at `https://<user>.github.io/<repo>/`.

### Vercel
New Project → Import the repo → Framework Preset **Other**, empty Build Command,
root Output Directory → Deploy. Or from the CLI: `npm i -g vercel && vercel`.

## Project structure

```
index.html         -- markup + switched views
style.css          -- look from the Penpot design (tavern background, red accent)
app.js             -- state, routing, game logic
data/data.js       -- ALL game content (edit here)
assets/bg.webp     -- background (blurred tavern interior) from the design
assets/races/*.webp-- race profile images (avatars)
Profile pictures/  -- source race images (reference; not used at runtime)
README.md
```

Note: a character's avatar comes from its race image (`RACES[].avatar`), or you
can override it per character with an `avatar` field (URL/path).

## Ideas for later

- More races/classes, dice-roll combat.
- DM notes per character, a campaign journal.
- Drunkness history (chart), more debuff types.
- Sharing a campaign via URL instead of a file.
