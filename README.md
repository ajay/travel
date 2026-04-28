# 🌍 Atlas — World Travel Tracker

A static, single-file world travel map. Mark countries as visited, planned, or wishlisted by editing `data.json` and pushing to GitHub Pages.

![Atlas Screenshot](screenshot.png)

---

## Features

- **Interactive world map** — D3 + TopoJSON, click any country to see details
- **Stats dashboard** — progress by continent, % of world visited, achievement badges
- **Personal details** — display ratings, year visited, and notes per country
- **Country info** — capital, population, area, languages, currency, timezone
- **Wikipedia summaries** — on-demand "Learn more" via the public Wikipedia REST API
- **PNG export** — download a snapshot of your map
- **Search** — find any country and zoom to it
- **Mobile-friendly** — responsive layout with bottom sheets and a mobile nav bar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (ES Modules) |
| Map rendering | [D3.js v7](https://d3js.org/) + [TopoJSON](https://github.com/topojson/topojson) |
| Hosting | Any static host (GitHub Pages, Netlify, Vercel, …) |

No build tools, no frameworks, no backend. The whole app is one HTML file plus one JSON file.

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/atlas-travel-tracker.git
cd atlas-travel-tracker
```

### 2. Edit `data.json`

`data.json` holds your travels. The shape:

```json
{
  "statuses": {
    "USA": "visited",
    "JPN": "visited",
    "FRA": "planned",
    "NZL": "wishlist"
  },
  "details": {
    "USA": { "rating": 5, "year": "2019", "notes": "Road trip across the southwest." },
    "JPN": { "rating": 4, "year": "2023", "notes": "Cherry blossom season." }
  }
}
```

- Keys in `statuses` and `details` are ISO 3166-1 alpha-3 country codes (`USA`, `JPN`, `FRA`, `GBR`, …).
- `statuses` values are `"visited"`, `"planned"`, or `"wishlist"`.
- `details` is optional. Each entry can include any of `rating` (0–5), `year` (string), `notes` (string).
- A list of valid country codes is in the `COUNTRIES` array at the top of `index.html`.

### 3. Run locally

No build step — just serve the directory:

```bash
python3 -m http.server 8000
# or: npx serve .
```

Open `http://localhost:8000`.

### 4. Deploy to GitHub Pages

In your repo settings → **Pages** → set the source to your default branch (root). Push, and your map is live at `https://<username>.github.io/<repo>/`.

To update your map, edit `data.json` and push.

---

## Project Structure

```
index.html        # Entire app — HTML, CSS, and JS in one file
data.json         # Your travel data
screenshot.png    # README hero image
README.md
CLAUDE.md         # Notes for Claude Code when editing this repo
```

---

## License

MIT — feel free to fork and build your own version.
