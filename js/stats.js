import { state } from "./state.js";
import { $, escapeHtml, swipeToClose } from "./util.js";
import { closeDetail } from "./detail.js";
import { closeList } from "./list.js";
import { view, shown, ownStep } from "./travellers.js";

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

const C = 2 * Math.PI * 28;

function arc(id, len, start = 0, cls = "") {
  const el = $(id);
  el.setAttribute("class", `ring-fill ${cls}`.trim());
  el.setAttribute("stroke-dasharray", `${len} ${C}`);
  el.setAttribute("stroke-dashoffset", -start);
}

export function renderStats() {
  const s = shown();
  if (s.length > 1) return renderShared(s);
  const { total, byContinent } = calcStats();
  const world = state.countries.length;
  const pct = Math.round((total / world) * 100);

  arc("ring-fill", (pct / 100) * C);
  arc("ring-fill-1", 0);
  arc("ring-fill-2", 0);
  $("ring-pct").innerHTML = `${pct}<span>%</span>`;
  $("ring-sub").textContent = `${total} of ${world} countries`;
  $("who-stats").innerHTML = "";

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

// Two or more shown: per traveller, together and combined.
function renderShared(s) {
  const world = state.countries.length;
  const pair = s.length === 2;
  const went = (i, c) => state.trips[c]?.[i]?.status === "visited";
  const all = Object.keys(state.trips);
  const mine = s.map((i) => all.filter((c) => went(i, c)));
  const together = all.filter((c) => s.every((i) => went(i, c)));
  const combined = all.filter((c) => s.some((i) => went(i, c)));
  const pct = (n) => Math.round((n / world) * 100);

  // Pair: together, then each traveller alone, end to end.
  const parts = pair
    ? [together.length, ...mine.map((m) => m.length - together.length)]
    : [combined.length, 0, 0];
  const gap = parts.filter(Boolean).length > 1 ? 2 : 0;
  let at = 0;
  ["ring-fill", "ring-fill-1", "ring-fill-2"].forEach((id, k) => {
    const len = (parts[k] / world) * C;
    arc(id, len - Math.min(gap, len / 2), at, pair ? `visited s${k}` : "");
    at += len;
  });
  $("ring-pct").innerHTML = `${pct(combined.length)}<span>%</span>`;
  $("ring-sub").textContent =
    `${combined.length} of ${world} countries · combined`;

  const row = (sw, name, n) =>
    `<div class="who-row"><span class="who-sw ${sw}"></span><span class="who-name">${name}</span><span class="who-n">${n} · ${pct(n)}%</span></div>`;
  $("who-stats").innerHTML = [
    ...s.map((i, k) =>
      row(
        pair ? `visited ${ownStep(i, s)}` : "",
        escapeHtml(state.travellers[i]),
        mine[k].length,
      ),
    ),
    row(pair ? "visited s0" : "", "together", together.length),
    row("", "combined", combined.length),
  ].join("");

  const region = (c) => state.lookup[c]?.region;
  $("continent-bars").innerHTML = continentTotals()
    .map(([name, tot]) => {
      const n = combined.filter((c) => region(c) === name).length;
      const subs = s
        .map((i, k) => {
          const m = mine[k].filter((c) => region(c) === name).length;
          const cls = pair ? `visited ${ownStep(i, s)}` : "visited";
          return `<div class="cont-sub"><span class="cont-who">${escapeHtml(state.travellers[i])}</span><div class="cont-bar-bg"><div class="cont-bar-fill ${cls}" style="width:${Math.round((m / tot) * 100)}%"></div></div><span class="cont-count">${m}</span></div>`;
        })
        .join("");
      return `<div class="continent-row">
      <div class="cont-header">
        <span class="cont-name">${name}</span>
        <span class="cont-count">${n}/${tot}</span>
      </div>${subs}
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
  closeList();
  closeDetail();
  renderStats();
  setStatsOpen(true);
}

export function initStats() {
  $("stats-toggle-btn").addEventListener("click", toggleStats);
  $("mob-stats-btn").addEventListener("click", toggleStats);
  swipeToClose($("stats"), closeStats);
}
