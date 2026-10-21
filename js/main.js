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
state.statuses = data.statuses || {};
state.details = data.details || {};

await buildMap();
refreshMap();
renderStats();
$("loading").classList.add("hidden");
