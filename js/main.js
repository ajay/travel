import { state } from "./state.js";
import { buildMap, refreshMap, initMap } from "./map.js";
import { initDetail } from "./detail.js";
import { initWiki } from "./wiki.js";
import { initStats, renderStats } from "./stats.js";
import { initList } from "./list.js";
import { initSearch } from "./search.js";
import { initExport } from "./export.js";
import { load, sync } from "./travellers.js";

initMap();
initDetail();
initWiki();
initStats();
initList();
initSearch();
initExport();

const [countries, [data, problem]] = await Promise.all([
  fetch("./countries.json").then((r) => r.json()),
  fetch("./data.json")
    .then(async (r) => (r.ok ? [await r.json()] : [null, `HTTP ${r.status}`]))
    .catch((e) => [null, `unreadable (${e})`]),
]);
state.countries = countries;
state.sortedCountries = [...countries].sort((a, b) =>
  a.name.localeCompare(b.name),
);
for (const c of countries) {
  state.lookup[c.cca3] = c;
  if (c.cca2) state.cca3ToCca2[c.cca3] = c.cca2.toLowerCase();
}
const warning = problem || load(data);
if (warning) console.warn(`data.json: ${warning}`);
sync();

await buildMap();
refreshMap();
renderStats();
