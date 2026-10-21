import { state } from "./state.js";
import { $ } from "./util.js";

const wikiCache = {};

async function fetchWiki(countryName) {
  if (wikiCache[countryName]) return wikiCache[countryName];
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`,
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const result = {
      extract: data.extract || "",
      pageUrl:
        data.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
    };
    wikiCache[countryName] = result;
    return result;
  } catch (e) {
    return null;
  }
}

function renderWikiContent(containerEl, data) {
  if (!data) {
    containerEl.innerHTML = `<div class="wiki-excerpt" style="color:var(--text-muted);font-size:.78rem">No information available.</div>`;
    return;
  }
  const excerpt =
    data.extract.length > 320
      ? data.extract.slice(0, 320).replace(/\s\S+$/, "") + "…"
      : data.extract;
  containerEl.innerHTML = `
    <div class="wiki-excerpt">${excerpt}</div>
    <a class="wiki-link" href="${data.pageUrl}" target="_blank" rel="noopener">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Read more on Wikipedia
    </a>`;
}

export function initWiki() {
  const btn = $("wiki-toggle");
  const box = $("wiki-content");
  let loaded = false;
  btn.addEventListener("click", async () => {
    const open = box.classList.toggle("open");
    if (open && !loaded) {
      loaded = true;
      box.innerHTML = '<div class="wiki-loading">Loading…</div>';
      const data = await fetchWiki(state.lookup[state.selected]?.name || "");
      renderWikiContent(box, data);
    }
    if (!open) {
      loaded = false;
      box.innerHTML = "";
    }
  });
}

export function resetWiki() {
  const box = $("wiki-content");
  box.classList.remove("open");
  box.innerHTML = "";
}
