# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Atlas is a single-file static world travel map. `index.html` is the entire app (HTML + CSS + ES-module JS inlined). `data.json` is the only state. To publish a change, edit `data.json` and push — there is no build, lint, or test step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Designed for GitHub Pages: `data.json` is fetched relatively (`./data.json`), so it works under a subpath like `username.github.io/repo/`. The map geometry, D3, and fonts are loaded from CDNs at runtime — first load needs internet.

## data.json shape

Keys are ISO 3166-1 alpha-3 country codes.

```json
{
  "statuses": { "USA": "visited", "FRA": "planned", "NZL": "wishlist" },
  "details":  { "USA": { "rating": 5, "year": "2020", "notes": "..." } }
}
```

`statuses` values are `"visited" | "planned" | "wishlist"`. `details` is optional per country and any of `rating` / `year` / `notes` may be omitted.

## Watch out for

- **Two parallel UIs for the country detail view** — desktop side panel (`panel-*` IDs) and mobile bottom sheet (`bs-*` IDs), gated by `isMobile()` (≤640px). Same for stats (`-m` suffix on mobile IDs). Behavior changes need to be applied to both or the other form factor silently regresses.
- **Three country ID systems** coexist: `cca3` (state/data.json keys), `cca2` (flag URLs), `ccn3` (TopoJSON feature IDs, converted via `getCca3`).
- **Lint runs prettier `--check`** via `make lint` / `make ci`. Run `make format` after editing or CI fails on push.
