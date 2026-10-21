# ajay.engineer/travel

Where I've been, where I'm going next, and where I'd like to go — on a world map.

Live at **[ajay.engineer/travel](https://ajay.engineer/travel/)**.

![ajay.engineer/travel](screenshot.png)

## Updating the map

Edit `data.json` and push to `main`; GitHub Pages redeploys.

```json
{
  "travellers": ["ajay"],
  "countries": {
    "IND": {
      "ajay": {
        "status": "visited",
        "rating": 5,
        "year": "2024",
        "notes": "Delhi and Agra."
      }
    },
    "JPN": { "ajay": "planned" },
    "NZL": { "ajay": "wishlist" }
  }
}
```

- `travellers` lists everyone on the map. `countries` is keyed by ISO 3166-1 alpha-3 codes, as listed in `countries.json`.
- Each traveller's entry is a status (`visited`, `planned` or `wishlist`), or an object with any of `status`, `rating` (1–5), `year` and `notes`.
- A country-level `notes` (next to the travellers) is a shared note, e.g. for a trip taken together.
- Unknown codes, travellers, statuses or fields are ignored and listed in a browser-console warning.

## Development

```sh
git submodule update --init --recursive
make serve        # http://localhost:8000
make format       # run before pushing: CI checks formatting with `make ci`
make screenshot   # refresh screenshot.png from the local site (needs Chrome)
```

There's no build step. The site is `index.html`, `style.css`, `countries.json` and ES modules in `js/`. Deploys use the shared [ajay/site-common](https://github.com/ajay/site-common) workflow.
