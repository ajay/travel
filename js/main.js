import { state } from "./state.js";
import { $ } from "./util.js";
import { buildMap, refreshMap, initMap } from "./map.js";
import { initDetail } from "./detail.js";
import { initWiki } from "./wiki.js";
import { initStats, renderStats } from "./stats.js";
import { initList } from "./list.js";
import { initSearch } from "./search.js";
import { initExport } from "./export.js";

initMap();
initDetail();
initWiki();
initStats();
initList();
initSearch();
initExport();

const [countries, data] = await Promise.all([
  fetch("./countries.json").then((r) => r.json()),
  fetch("./data.json")
    .then((r) => (r.ok ? r.json() : { statuses: {}, details: {} }))
    .catch(() => ({ statuses: {}, details: {} })),
]);
state.countries = countries;
state.sortedCountries = [...countries].sort((a, b) =>
  a.name.localeCompare(b.name),
);
for (const c of countries) {
  state.lookup[c.cca3] = c;
  if (c.cca2) state.cca3ToCca2[c.cca3] = c.cca2.toLowerCase();
}
const ignored = [];
for (const [cca3, s] of Object.entries(data.statuses || {})) {
  if (!Object.hasOwn(state.lookup, cca3))
    ignored.push(`statuses.${cca3} (unknown code)`);
  else if (!["visited", "planned", "wishlist"].includes(s))
    ignored.push(`statuses.${cca3}: ${JSON.stringify(s)} (unknown status)`);
  else state.statuses[cca3] = s;
}
state.details = data.details || {};
for (const cca3 of Object.keys(state.details))
  if (!Object.hasOwn(state.lookup, cca3))
    ignored.push(`details.${cca3} (unknown code)`);
if (ignored.length) console.warn(`data.json: ignoring ${ignored.join(", ")}`);

await buildMap();
refreshMap();
renderStats();
$("loading").classList.add("hidden");
