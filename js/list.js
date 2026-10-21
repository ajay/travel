import { state } from "./state.js";
import { $, escapeHtml, getFlagCca2, flagImg, rating } from "./util.js";
import { openDetail } from "./detail.js";
import { view, shown, step, whoLabel } from "./travellers.js";

// A status tab, or null (no tab selected) for every country.
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

export function closeList() {
  listOpen = false;
  $("list-overlay").classList.remove("show");
  $("list-panel").classList.remove("open");
  $("list-toggle-btn").classList.remove("active");
  $("mob-list-btn").classList.remove("active");
}

export function renderList() {
  if (!listOpen) return;
  const body = $("list-body");
  const countries = (
    listFilter
      ? Object.keys(state.trips)
          .map((cca3) => ({ cca3, info: state.lookup[cca3], v: view(cca3) }))
          .filter((x) => x.v?.status === listFilter)
      : state.countries.map((c) => ({ cca3: c.cca3, info: c, v: view(c.cca3) }))
  )
    .filter(
      (x) => !listSearch || x.info.name.toLowerCase().includes(listSearch),
    )
    .sort((a, b) => a.info.name.localeCompare(b.info.name));

  const multi = state.travellers.length > 1;
  const s = shown();
  if (!countries.length) {
    const hidden = multi && s.length < state.travellers.length;
    const labels = {
      visited: "visited countries",
      planned: "planned trips",
      wishlist: "wishlist countries",
    };
    const none = hidden
      ? `no ${labels[listFilter]} for ${s.map((i) => escapeHtml(state.travellers[i])).join(" + ")}.`
      : `no ${labels[listFilter]} in data.json yet.`;
    body.innerHTML = `<div class="list-empty">${listSearch ? "no matches." : none}</div>`;
    return;
  }

  body.innerHTML = countries
    .map(({ cca3, info, v }) => {
      const cca2 = getFlagCca2(cca3);
      const flagHtml = cca2
        ? flagImg(cca2, "w40", info.flag || "")
        : info.flag || "";
      if (!v)
        return `<div class="list-item" data-cca3="${cca3}">
      <div class="list-item-flag">${flagHtml}</div>
      <div class="list-item-info"><div class="list-item-name">${info.name}</div></div>
    </div>`;
      const t = state.trips[cca3];
      const ds = v.who.map((i) => t[i]);
      const rs = ds.map((d) => rating(d.rating)).filter(Boolean);
      const stars = "★".repeat(
        rs.length ? Math.round(rs.reduce((a, b) => a + b) / rs.length) : 0,
      );
      // Several travellers: each year once, others' lower statuses, a lone
      // traveller's notes, then the shared note.
      const sub = escapeHtml(
        (multi
          ? [
              ...new Set(
                ds
                  .map((d) => d.year)
                  .filter(Boolean)
                  .map(String),
              ),
              ...s
                .filter((i) => !v.who.includes(i) && t[i]?.status)
                .map((i) => `${state.travellers[i]} ${t[i].status}`),
              v.who.length === 1 && ds[0].notes,
              state.notes[cca3],
            ]
          : ds.flatMap((d) => [d.year, d.notes])
        )
          .filter(Boolean)
          .join(" · "),
      );
      const who =
        multi && s.length > 1
          ? `<div class="list-item-who">${escapeHtml(whoLabel(v, s))}</div>`
          : "";
      return `<div class="list-item" data-cca3="${cca3}">
      <div class="list-item-flag">${flagHtml}</div>
      <div class="list-item-info">
        <div class="list-item-name">${info.name}</div>
        ${sub ? `<div class="list-item-sub">${sub}</div>` : ""}
      </div>
      ${stars ? `<div class="list-item-stars">${stars}</div>` : ""}${who}
      <div class="list-item-badge ${`${v.status} ${step(v, s)}`.trim()}"></div>
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
    // Clicking the active tab deselects it: then every country is listed.
    tab.addEventListener("click", () => {
      const on = !tab.classList.contains("active");
      document
        .querySelectorAll(".list-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.toggle("active", on);
      listFilter = on ? tab.dataset.filter : null;
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
