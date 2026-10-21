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
import { resetWiki } from "./wiki.js";
import { view } from "./travellers.js";

const cell = (label, value) =>
  `<div class="data-cell"><div class="data-cell-label">${label}</div><div class="data-cell-value">${value}</div></div>`;

const notes = (label, text) =>
  `<div class="my-notes-wrap"><div class="data-cell-label">${label}</div><div class="my-notes">${escapeHtml(text)}</div></div>`;

export function renderMyData(cca3) {
  const v = view(cca3);
  const t = state.trips[cca3] || [];
  const who = v ? v.who : Object.keys(t).map(Number);
  const shared = state.notes[cca3];
  if (!who.length && !shared) return "";
  const by = (i) =>
    state.travellers.length > 1 ? ` · ${escapeHtml(state.travellers[i])}` : "";
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
    if (r)
      parts.push(
        cell(
          `rating${by(i)}`,
          `<span class="my-rating">${"★".repeat(r)}<span class="dim">${"★".repeat(5 - r)}</span></span>`,
        ),
      );
    if (d.year)
      parts.push(cell(`year visited${by(i)}`, escapeHtml(String(d.year))));
    if (d.notes) parts.push(notes(`notes${by(i)}`, d.notes));
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
  resetWiki();
  $("detail").classList.add("open");
  $("sheet-overlay").classList.add("show");
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
