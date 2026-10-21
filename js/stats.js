import { state } from "./state.js";
import { $, swipeToClose } from "./util.js";
import { closeDetail } from "./detail.js";

const TOTAL_WORLD = 195;
const CONTINENT_TOTALS = {
  Africa: 54,
  Asia: 48,
  Europe: 43,
  Americas: 35,
  Oceania: 14,
};
const CONTINENT_COLORS = {
  Africa: "#f59e0b",
  Asia: "#3b82f6",
  Europe: "#a78bfa",
  Americas: "#22c55e",
  Oceania: "#f87171",
};

const BADGES = [
  {
    id: "first",
    icon: "✈️",
    name: "First Steps",
    desc: "Visit your first country",
    check: (v) => v >= 1,
  },
  {
    id: "ten",
    icon: "🌟",
    name: "10 Countries",
    desc: "Visit 10 countries",
    check: (v) => v >= 10,
  },
  {
    id: "twentyfive",
    icon: "🏅",
    name: "25 Countries",
    desc: "Visit 25 countries",
    check: (v) => v >= 25,
  },
  {
    id: "fifty",
    icon: "🌍",
    name: "Half Century",
    desc: "Visit 50 countries",
    check: (v) => v >= 50,
  },
  {
    id: "hundred",
    icon: "💯",
    name: "Century Club",
    desc: "Visit 100 countries",
    check: (v) => v >= 100,
  },
  {
    id: "africa",
    icon: "🦁",
    name: "Africa Explorer",
    desc: "Visit 5+ African countries",
    check: (v, s) => (s.Africa || 0) >= 5,
  },
  {
    id: "asia",
    icon: "🏯",
    name: "Asia Explorer",
    desc: "Visit 5+ Asian countries",
    check: (v, s) => (s.Asia || 0) >= 5,
  },
  {
    id: "europe",
    icon: "🏰",
    name: "Europe Explorer",
    desc: "Visit 5+ European countries",
    check: (v, s) => (s.Europe || 0) >= 5,
  },
  {
    id: "americas",
    icon: "🗽",
    name: "Americas Explorer",
    desc: "Visit 5+ American countries",
    check: (v, s) => (s.Americas || 0) >= 5,
  },
  {
    id: "oceania",
    icon: "🦘",
    name: "Oceania Explorer",
    desc: "Visit 3+ Oceanian countries",
    check: (v, s) => (s.Oceania || 0) >= 3,
  },
  {
    id: "fivecont",
    icon: "🗺️",
    name: "5 Continents",
    desc: "Visit countries on 5 continents",
    check: (v, s) => Object.keys(s).filter((k) => s[k] > 0).length >= 5,
  },
  {
    id: "planner",
    icon: "📅",
    name: "Planner",
    desc: "Plan trips to 5+ countries",
    check: (v, s, p) => p >= 5,
  },
];

let statsOpen = false;

function calcStats() {
  const visitedCca3 = Object.keys(state.statuses).filter(
    (k) => state.statuses[k] === "visited",
  );
  const plannedCount = Object.values(state.statuses).filter(
    (v) => v === "planned",
  ).length;
  const total = visitedCca3.length;
  const byContinent = {};
  visitedCca3.forEach((cca3) => {
    const c = state.lookup[cca3];
    if (c) byContinent[c.region] = (byContinent[c.region] || 0) + 1;
  });
  return { total, byContinent, plannedCount };
}

export function renderStats() {
  const { total, byContinent, plannedCount } = calcStats();
  const pct = Math.round((total / TOTAL_WORLD) * 100);

  const circumference = 2 * Math.PI * 28;
  const filled = (pct / 100) * circumference;
  $("ring-fill").setAttribute("stroke-dasharray", `${filled} ${circumference}`);
  $("ring-pct").innerHTML = `${pct}<span>%</span>`;
  $("ring-sub").textContent = `${total} of ${TOTAL_WORLD} countries`;

  $("continent-bars").innerHTML = Object.entries(CONTINENT_TOTALS)
    .map(([name, tot]) => {
      const visited = byContinent[name] || 0;
      const pctBar = Math.round((visited / tot) * 100);
      const color = CONTINENT_COLORS[name] || "#6b7280";
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

  $("badges-grid").innerHTML = BADGES.map((b) => {
    const earned = b.check(total, byContinent, plannedCount);
    return `<div class="badge ${earned ? "earned" : ""}" title="${b.desc}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>`;
  }).join("");
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
