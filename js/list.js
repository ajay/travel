import { state } from "./state.js";
import { $, escapeHtml, getFlagCca2, flagImg } from "./util.js";
import { openDetail } from "./detail.js";

let listFilter = "visited";
let listSearch = "";
let listOpen = false;

function openList() {
  listOpen = true;
  renderList();
  $("list-overlay").classList.add("show");
  $("list-panel").classList.add("open");
  $("list-toggle-btn").classList.add("active");
  $("mob-list-btn").classList.add("active");
}

function closeList() {
  listOpen = false;
  $("list-overlay").classList.remove("show");
  $("list-panel").classList.remove("open");
  $("list-toggle-btn").classList.remove("active");
  $("mob-list-btn").classList.remove("active");
}

function renderList() {
  if (!listOpen) return;
  const body = $("list-body");
  const countries = Object.keys(state.statuses)
    .filter((cca3) => state.statuses[cca3] === listFilter)
    .map((cca3) => ({
      cca3,
      info: state.lookup[cca3],
      details: state.details[cca3] || {},
    }))
    .filter((x) => x.info)
    .filter(
      (x) => !listSearch || x.info.name.toLowerCase().includes(listSearch),
    )
    .sort((a, b) => a.info.name.localeCompare(b.info.name));

  if (!countries.length) {
    const labels = {
      visited: "visited countries",
      planned: "planned trips",
      wishlist: "wishlist countries",
    };
    body.innerHTML = `<div class="list-empty">${listSearch ? "no matches." : `no ${labels[listFilter]} in data.json yet.`}</div>`;
    return;
  }

  body.innerHTML = countries
    .map(({ cca3, info, details }) => {
      const stars = "★".repeat(
        Math.max(0, Math.min(5, parseInt(details.rating) || 0)),
      );
      const sub = escapeHtml(
        [details.year, details.notes].filter(Boolean).join(" · "),
      );
      const cca2 = getFlagCca2(cca3);
      const flagHtml = cca2
        ? flagImg(cca2, "w40", info.flag || "")
        : info.flag || "";
      return `<div class="list-item" data-cca3="${cca3}">
      <div class="list-item-flag">${flagHtml}</div>
      <div class="list-item-info">
        <div class="list-item-name">${info.name}</div>
        ${sub ? `<div class="list-item-sub">${sub}</div>` : ""}
      </div>
      ${stars ? `<div class="list-item-stars">${stars}</div>` : ""}
      <div class="list-item-badge ${listFilter}"></div>
    </div>`;
    })
    .join("");

  body.querySelectorAll(".list-item").forEach((el) => {
    el.addEventListener("click", () => {
      closeList();
      openDetail(el.dataset.cca3);
    });
  });
}

export function initList() {
  document.querySelectorAll(".list-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".list-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      listFilter = tab.dataset.filter;
      renderList();
    });
  });
  $("list-search").addEventListener("input", function () {
    listSearch = this.value.trim().toLowerCase();
    renderList();
  });
  const toggle = () => (listOpen ? closeList() : openList());
  $("list-toggle-btn").addEventListener("click", toggle);
  $("mob-list-btn").addEventListener("click", toggle);
  $("list-close-btn").addEventListener("click", closeList);
  $("list-overlay").addEventListener("click", closeList);
}
