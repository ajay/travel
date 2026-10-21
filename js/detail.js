import { state } from "./state.js";
import { $, escapeHtml, getFlagCca2, flagImg, swipeToClose } from "./util.js";
import { refreshMap } from "./map.js";
import { closeStats } from "./stats.js";
import { resetWiki } from "./wiki.js";

const STATUS_LABEL = {
  visited: "Visited",
  planned: "Planned",
  wishlist: "Wishlist",
};

export function renderMyData(cca3) {
  const status = state.statuses[cca3];
  const d = state.details[cca3];
  if (!status && !d) return "";
  const parts = [];
  parts.push('<div class="panel-divider"></div>');
  parts.push('<div class="panel-section-label">Your travels</div>');
  if (status) {
    parts.push(
      `<div style="margin-bottom:10px"><span class="my-status-pill ${status}">${STATUS_LABEL[status] || status}</span></div>`,
    );
  }
  const r = Math.max(0, Math.min(5, parseInt(d?.rating) || 0));
  if (r) {
    const stars =
      "★".repeat(r) + `<span class="dim">${"★".repeat(5 - r)}</span>`;
    parts.push(
      `<div style="margin-bottom:10px"><div class="panel-section-label">Rating</div><div class="my-rating">${stars}</div></div>`,
    );
  }
  if (d?.year) {
    parts.push(
      `<div style="margin-bottom:10px"><div class="panel-section-label">Year visited</div><div class="data-cell-value">${escapeHtml(String(d.year))}</div></div>`,
    );
  }
  if (d?.notes) {
    parts.push(
      `<div><div class="panel-section-label">Notes</div><div class="my-notes">${escapeHtml(d.notes)}</div></div>`,
    );
  }
  return parts.join("");
}

export function openDetail(cca3) {
  const info = state.lookup[cca3];
  if (!info) return;
  state.selected = cca3;
  closeStats();
  const cca2 = getFlagCca2(cca3);
  const emoji = info.flag || "🌐";
  $("detail-flag").innerHTML = cca2
    ? flagImg(
        cca2,
        "w80",
        "width:56px;height:auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.3)",
        emoji,
      )
    : emoji;
  $("detail-name").textContent = info.name;
  $("detail-region").textContent = [info.subregion, info.region]
    .filter(Boolean)
    .join(" · ");
  $("detail-data").innerHTML = `
    <div class="data-cell"><div class="data-cell-label">Capital</div><div class="data-cell-value">${info.capital || "—"}</div></div>
    <div class="data-cell"><div class="data-cell-label">Population</div><div class="data-cell-value">${info.population?.toLocaleString() || "—"}</div></div>
    <div class="data-cell"><div class="data-cell-label">Area</div><div class="data-cell-value">${info.area ? info.area.toLocaleString() + " km²" : "—"}</div></div>
    <div class="data-cell"><div class="data-cell-label">Region</div><div class="data-cell-value">${info.region || "—"}</div></div>
    <div class="data-cell full"><div class="data-cell-label">Languages</div><div class="data-cell-value">${info.languages || "—"}</div></div>
    <div class="data-cell full"><div class="data-cell-label">Currency</div><div class="data-cell-value">${info.currency || "—"}</div></div>
    <div class="data-cell full"><div class="data-cell-label">Timezone</div><div class="data-cell-value">${info.timezone || "—"}</div></div>`;
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
