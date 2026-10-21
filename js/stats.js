import { state } from "./state.js";
import { $, swipeToClose } from "./util.js";
import { closeDetail } from "./detail.js";
import { view } from "./travellers.js";

const CONTINENT_COLORS = {
  Africa: "var(--orange)",
  Asia: "var(--purple)",
  Europe: "var(--yellow)",
  Americas: "var(--red)",
  Oceania: "var(--aqua)",
};

let statsOpen = false;

function calcStats() {
  const visitedCca3 = Object.keys(state.trips).filter(
    (k) => view(k)?.status === "visited",
  );
  const total = visitedCca3.length;
  const byContinent = {};
  visitedCca3.forEach((cca3) => {
    const c = state.lookup[cca3];
    if (c) byContinent[c.region] = (byContinent[c.region] || 0) + 1;
  });
  return { total, byContinent };
}

function continentTotals() {
  const t = Object.fromEntries(
    Object.keys(CONTINENT_COLORS).map((k) => [k, 0]),
  );
  for (const c of state.countries)
    if (c.region) t[c.region] = (t[c.region] || 0) + 1;
  return Object.entries(t).filter(([, n]) => n);
}

export function renderStats() {
  const { total, byContinent } = calcStats();
  const world = state.countries.length;
  const pct = Math.round((total / world) * 100);

  const circumference = 2 * Math.PI * 28;
  const filled = (pct / 100) * circumference;
  $("ring-fill").setAttribute("stroke-dasharray", `${filled} ${circumference}`);
  $("ring-pct").innerHTML = `${pct}<span>%</span>`;
  $("ring-sub").textContent = `${total} of ${world} countries`;

  $("continent-bars").innerHTML = continentTotals()
    .map(([name, tot]) => {
      const visited = byContinent[name] || 0;
      const pctBar = Math.round((visited / tot) * 100);
      const color = CONTINENT_COLORS[name] || "var(--text-muted)";
      return `<div class="continent-row">
      <div class="cont-header">
        <span class="cont-name">${name}</span>
        <span class="cont-count">${visited}/${tot}</span>
      </div>
      <div class="cont-bar-bg">
        <div class="cont-bar-fill" style="width:${pctBar}%;background:${color}"></div>
      </div>
    </div>`;
    })
    .join("");
}

function setStatsOpen(open) {
  statsOpen = open;
  $("stats").classList.toggle("open", open);
  $("stats-toggle-btn").classList.toggle("active", open);
  $("mob-stats-btn").classList.toggle("active", open);
}

export function closeStats() {
  setStatsOpen(false);
}

function toggleStats() {
  if (statsOpen) return closeStats();
  closeDetail();
  renderStats();
  setStatsOpen(true);
}

export function initStats() {
  $("stats-toggle-btn").addEventListener("click", toggleStats);
  $("mob-stats-btn").addEventListener("click", toggleStats);
  swipeToClose($("stats"), closeStats);
}
