import { state } from "./state.js";
import {
  $,
  escapeHtml,
  getFlagCca2,
  flagImg,
  swipeToClose,
  rating,
} from "./util.js";
import { refreshMap } from "./map.js";
import { closeStats } from "./stats.js";
import { loadWiki } from "./wiki.js";
import { view, shown, ownStep } from "./travellers.js";

const cell = (label, value, cls = "") =>
  `<div class="data-cell${cls && ` ${cls}`}"><div class="data-cell-label">${label}</div><div class="data-cell-value">${value}</div></div>`;

const notes = (label, text, cls = "") =>
  `<div class="my-notes-wrap${cls && ` ${cls}`}"><div class="data-cell-label">${label}</div><div class="my-notes">${escapeHtml(text)}</div></div>`;

const stars = (r) =>
  `<span class="my-rating">${"★".repeat(r)}<span class="dim">${"★".repeat(5 - r)}</span></span>`;

// Two or more travellers: a row per traveller (hidden ones dimmed), then the shared note.
function travellerRows(t, shared) {
  if (!t.some(Boolean) && !shared) return "";
  const s = shown();
  const parts = ['<div class="panel-section-label">travels</div>'];
  state.travellers.forEach((name, i) => {
    const d = t[i] || {};
    const off = s.includes(i) ? "" : " off";
    const status = d.status
      ? `<span class="${["my-status-pill", d.status, ownStep(i, s)].join(" ").trim()}">${d.status}</span>`
      : '<span class="none">—</span>';
    parts.push(cell(escapeHtml(name), status, `traveller-row${off}`));
    const r = rating(d.rating);
    if (r) parts.push(cell("rating", stars(r), `sub${off}`));
    if (d.year)
      parts.push(cell("year", escapeHtml(String(d.year)), `sub${off}`));
    if (d.notes) parts.push(notes("notes", d.notes, `sub${off}`));
  });
  if (shared) parts.push(notes("shared notes", shared));
  return parts.join("");
}

export function renderMyData(cca3) {
  const t = state.trips[cca3] || [];
  const shared = state.notes[cca3];
  if (state.travellers.length > 1) return travellerRows(t, shared);
  const v = view(cca3);
  const who = v ? v.who : Object.keys(t).map(Number);
  if (!who.length && !shared) return "";
  const parts = ['<div class="panel-section-label">travels</div>'];
  if (v)
    parts.push(
      cell(
        "status",
        `<span class="my-status-pill ${v.status}">${v.status}</span>`,
      ),
    );
  for (const i of who) {
    const d = t[i];
    const r = rating(d.rating);
    if (r) parts.push(cell("rating", stars(r)));
    if (d.year) parts.push(cell("year visited", escapeHtml(String(d.year))));
    if (d.notes) parts.push(notes("notes", d.notes));
  }
  if (shared) parts.push(notes("shared notes", shared));
  return parts.join("");
}

export function openDetail(cca3) {
  const info = state.lookup[cca3];
  if (!info) return;
  state.selected = cca3;
  closeStats();
  const cca2 = getFlagCca2(cca3);
  const emoji = info.flag || "🌐";
  $("detail-flag").innerHTML = cca2 ? flagImg(cca2, "w80", emoji) : emoji;
  $("detail-name").textContent = info.name;
  $("detail-region").textContent = [info.subregion, info.region]
    .filter(Boolean)
    .join(" · ");
  $("detail-data").innerHTML = [
    ["capital", info.capital || "—"],
    ["population", info.population?.toLocaleString() || "—"],
    ["area", info.area ? info.area.toLocaleString() + " km²" : "—"],
    ["region", `<span class="region-value">${info.region || "—"}</span>`],
    ["languages", info.languages || "—"],
    ["currency", info.currency || "—"],
    ["timezone", info.timezone || "—"],
  ]
    .map(([label, value]) => cell(label, value))
    .join("");
  $("detail-mydata").innerHTML = renderMyData(cca3);
  refreshMap();
  loadWiki(info.name);
  $("detail").classList.add("open");
  $("sheet-overlay").classList.add("show");
}

export function refreshDetail() {
  if (state.selected && $("detail").classList.contains("open"))
    $("detail-mydata").innerHTML = renderMyData(state.selected);
}

export function closeDetail() {
  $("detail").classList.remove("open");
  $("sheet-overlay").classList.remove("show");
  state.selected = null;
  refreshMap();
}

export function initDetail() {
  $("detail-close").addEventListener("click", closeDetail);
  $("sheet-overlay").addEventListener("click", closeDetail);
  swipeToClose($("detail"), closeDetail);
}
