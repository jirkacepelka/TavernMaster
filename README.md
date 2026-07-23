# 🍺 Krčma Master

Zjednodušený DnD companion, kde **hospodský = DM** a **alkohol = zdroj buffů/debuffů**
i odměna za questy. Statická webová appka — žádný build, žádné závislosti.

## Spuštění

Dvě možnosti:

1. **Nejjednodušší:** dvojklik na `index.html`. Herní data se načítají jako
   obyčejný `<script src="data/data.js">`, takže appka běží i z `file://` bez serveru.
2. **Přes lokální server** (volitelné, hodí se při vývoji):
   ```bash
   python3 -m http.server 8000
   # nebo
   npx serve
   ```
   a otevři `http://localhost:8000`.

Stav (postavy, questy, gold) se ukládá do `localStorage` prohlížeče — nic se
neposílá na server.

## Herní mechanika ve zkratce

- **Drunkness / hladinka** 0–100, start 50.
  - `0–34` → debuff **Střízlivý útlum**
  - `35–65` → optimum, žádný postih
  - `66–100` → debuff **Opilost**
  - Debuff se váže k pásmu, ne k nápoji — jakmile se postava vrátí do 35–65, zmizí.
- **Vypití** (tlačítko „🍷 Vypít“ v detailu hráče): buď **z baťohu** (spotřebuje
  nápoj z inventáře), nebo **obecně** z nabídky. Efekt (hladinka + případný
  buff/nerf) se aplikuje až po zaškrtnutí „Vypito IRL“.
- **Kola** (Hospodský → „Další kolo“): každé kolo hráči trochu vystřízliví —
  ubere se `1 %` (pásmo 0–34), `2 %` (35–65) nebo `3 %` (66–100).
- **Inventář**: nasazené itemy vs. baťoh. Nasazené vybavení (zbraně/zbroj/
  ozdoby/nástroje) **buffuje staty** přes svůj `effect`. Najetím myší na item
  se v tooltipu ukáže, co buffuje.
- **Odměny za questy**: gold, itemy, alkohol. Alkohol lze rovnou vypít, nebo
  uložit do baťohu.
- **Tavern**: nákup nápojů za gold — koupené jde do baťohu, vypiješ ho v detailu.
- **Diverzita** (volitelné, feature flag): pokud postava pije 3× po sobě stejný
  nápoj, další stejný má o 50 % nižší přírůstek hladinky.

## Obrazovky

- **Hráči** — seznam hráčů (klikací řádky) + tlačítko „＋ Nový hráč“.
- **Detail hráče** — avatar, staty (s buffy), drunkness bar, aktivní buffy,
  nasazené itemy a baťoh (nasadit / sundat / vypít), tlačítko „Vypít“.
- **Nový hráč** — jméno, rasa, povolání, živý náhled statů.
- **Hospodský** — přehled postav, počítadlo + tlačítko kol, questy (splnění +
  odměna), přímé DM úpravy statů/hladinky, přidání questu, export/import.
- **Tavern** — nákup nápojů za gold do baťohu.

## Úprava obsahu (rasy, itemy, alkohol…)

Veškerý herní obsah je v [`data/data.js`](data/data.js). Uprav pole a appka
pojede jinak — do `app.js` sahat netřeba. K dispozici:

| Konstanta          | Co obsahuje                                                    |
|--------------------|---------------------------------------------------------------|
| `BASE_STATS`       | základní staty nové postavy (`str/dex/int/con`)               |
| `RACES`            | rasy + jejich `statMods`                                       |
| `CLASSES`          | povolání + `statMods` + `startingItems`                       |
| `ITEMS`            | itemy (zbraně, zbroj, lektvary…)                              |
| `ALCOHOL`          | běžné nápoje k prodeji/odměnám (`buzzDelta`, `price`)         |
| `SPECIAL_DRINKS`   | speciální drinky s buffem/nerfem a IRL porcí                   |
| `QUESTS`           | předdefinované questy                                          |
| `DIVERSITY_BONUS_ENABLED` | `true`/`false` — zapnutí bonusu za diverzitu alkoholu  |

Příklad nové rasy:
```js
{ id: "gnome", name: "Gnóm", statMods: { str: -1, dex: 1, int: 2, con: 0 },
  description: "Vynálezci a alchymisté." }
```

Nová položka `id` musí být unikátní. `startingItems` a `rewardItems` odkazují
na `id` z `ITEMS`, `rewardAlcohol` na `id` z `ALCOHOL`.

## Export / Import kampaně

- **Exportovat kampaň** (Hospodský dashboard) stáhne `kampan.dnd` — je to
  obyčejný JSON s jinou příponou. Vhodné pro zálohu nebo pokračování příště.
- **Importovat** načte `.dnd` soubor a po potvrzení **přepíše** aktuální stav.

## Nasazení na Vercel

Čistě statický projekt, žádný build:

1. Nahraj repozitář na GitHub.
2. Ve Vercelu **New Project → Import** repozitáře.
3. Framework Preset: **Other**. Build Command: *(nechat prázdné)*.
   Output Directory: *(kořen, prázdné)*.
4. Deploy. Hotovo.

Alternativně z CLI: `npm i -g vercel && vercel`.

## Struktura projektu

```
index.html         -- markup + přepínané obrazovky
style.css          -- vzhled dle Penpot návrhu (tavern pozadí, červený akcent)
app.js             -- stav, routing, herní logika
data/data.js       -- VEŠKERÝ herní obsah (edituj tady)
assets/bg.webp     -- pozadí (rozmazaný interiér hospody) z návrhu
README.md
```

Pozn.: avatar je zatím emoji placeholder ve stejném 250×250 slotu jako v návrhu.
Návrh používal watermarkovaný stock portrét, ten není přibalen — vlastní obrázek
jde postavě dát polem `avatar` (URL/cesta).

## Co by šlo dál rozšířit

- Víc ras/povolání, souboje s hody kostkou.
- DM poznámky k postavám, deník kampaně.
- Historie hladinky (graf), více typů debuffů.
- Sdílení kampaně přes URL místo souboru.
