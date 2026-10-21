# CLAUDE.md

Guidance for Claude Code in this repository.

## Project

A static world travel map, published at https://ajay.engineer/travel/ by GitHub Pages.

- There's no build step: plain HTML, CSS and native ES modules.
- `data.json` is the only user state, and it's the owner's real data. Edit it only when asked.
- Pushing to `main` deploys.

The site is served under the `/travel/` subpath, so every URL must be relative (`./data.json`, never
`/data.json`). Runtime dependencies come from CDNs:

- D3 v7 (a classic script, available as the global `d3`), topojson-client (ESM) and world-atlas 50m;
- flagcdn flags and the Google Fonts IBM Plex Mono;
- html2canvas, loaded lazily for the PNG export, and the Wikipedia REST API.

## Layout

- `index.html`: markup only.
- `style.css`: all styles. The palette lives in `:root` variables.
- `countries.json`: 196 countries (cca3, ccn3, cca2, name, flag, region, …). World and continent totals are
  computed from it.
- `data.json`: `{ "statuses": { "IND": "visited" }, "details": { "IND": { "rating": 5, "year": "2024", "notes": "…" } } }`.
  - Keys are cca3 codes; statuses are `visited`, `planned` or `wishlist`; `details` is optional.
  - `js/main.js` validates it at load: unknown codes or statuses are ignored and listed in one `console.warn`.
- `js/`, one module per concern:
  - `main`: bootstrap and data validation;
  - `state`: the single shared mutable object (mutate its properties, never reassign imports);
  - `map`: TopoJSON map, dots for tiny countries, territories, zoom;
  - `detail`, `stats`, `list`, `search`, `wiki`, `export`, `util`, `favicon`.

## Commands

```bash
make serve        # http://localhost:8000
make format       # prettier --write; run before pushing
make lint         # htmlhint + prettier --check (what CI checks)
make screenshot   # regenerate screenshot.png (the README image) with headless Chrome
```

- `make ci` also checks that every submodule (`site-common`, with `build-tools` nested inside) is pinned to its
  remote's latest `main`. CI goes red when they lag, and the fix is a `site-common: update to <sha>` commit.
- `make git-submodule-update` initializes the submodules.

## Watch out for

- **One UI for both form factors.** `#detail` and `#stats` are single elements that the `max-width: 640px`
  media query turns into bottom sheets. Check every UI change at desktop width and at ≤640px.
- **Three country ID systems.**
  - `cca3`: `data.json` keys and state;
  - `cca2`: flagcdn URLs;
  - `ccn3`: TopoJSON feature ids, mapped through `countries.json`. Features with no match are territories:
    unclickable, with a name tooltip.
- **Map colors come from CSS.** Paths and dot circles carry `country <status> [selected]` classes, and
  `style.css` maps them to the palette. Don't hard-code colors in JS.
  - Countries smaller than `DOT_AREA` px² at the default zoom get a dot (constants at the top of `js/map.js`).
  - The wishlist hatch keeps a constant on-screen size, through the zoom handler.
- **Lowercase interface.** All interface text is lowercase, with no letter-spaced caps.
  - Country names used as headings or labels are lowercased with CSS `text-transform`, so the data keeps its case.
  - Data values (capital, languages, currency…), notes and Wikipedia text keep their natural case.
- **Export.** html2canvas ignores CSS filters and `::placeholder`, so the export leaves out the search box and
  zoom controls.
- **Verification.** There are no tests. Verify UI changes with headless-Chrome screenshots at desktop and
  mobile widths, and run `make lint`.
