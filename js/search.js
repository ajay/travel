import { state } from "./state.js";
import { $, getFlagCca2, flagImg } from "./util.js";
import { openDetail } from "./detail.js";
import { zoomToCountry } from "./map.js";

export function initSearch() {
  $("search").addEventListener("input", function () {
    const val = this.value.trim();
    const res = $("search-results");
    if (!val) {
      res.classList.remove("show");
      return;
    }
    const hits = state.sortedCountries
      .filter((c) => c.name.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 8);
    if (!hits.length) {
      res.classList.remove("show");
      return;
    }
    res.innerHTML = hits
      .map((c) => {
        const cca2 = getFlagCca2(c.cca3);
        const flagHtml = cca2
          ? flagImg(
              cca2,
              "w40",
              "width:20px;height:14px;object-fit:cover;border-radius:2px;vertical-align:middle;margin-right:6px",
              c.flag || "",
            )
          : `<span style="margin-right:6px">${c.flag || ""}</span>`;
        return `<div class="search-result-item" data-cca3="${c.cca3}" style="display:flex;align-items:center">${flagHtml}${c.name}</div>`;
      })
      .join("");
    res.classList.add("show");
  });
  $("search-results").addEventListener("click", (e) => {
    const item = e.target.closest(".search-result-item");
    if (!item) return;
    const cca3 = item.dataset.cca3;
    $("search").value = "";
    $("search-results").classList.remove("show");
    openDetail(cca3);
    zoomToCountry(cca3);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#search") && !e.target.closest("#search-results"))
      $("search-results").classList.remove("show");
  });
  $("mob-search-btn").addEventListener("click", () => {
    $("search").focus();
  });
}
