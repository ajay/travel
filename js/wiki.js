import { $, escapeHtml } from "./util.js";

const wikiCache = {};

async function fetchWiki(countryName) {
  if (wikiCache[countryName]) return wikiCache[countryName];
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`,
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const page = data.content_urls?.desktop?.page;
    const result = {
      extract: data.extract || "",
      pageUrl: String(page).startsWith("https://en.wikipedia.org/")
        ? page
        : `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
    };
    wikiCache[countryName] = result;
    return result;
  } catch (e) {
    return null;
  }
}

function renderWikiContent(containerEl, data) {
  if (!data) {
    containerEl.innerHTML =
      '<div class="wiki-excerpt wiki-empty">no information available.</div>';
    return;
  }
  const excerpt =
    data.extract.length > 320
      ? data.extract.slice(0, 320).replace(/\s\S+$/, "") + "…"
      : data.extract;
  containerEl.innerHTML = `
    <div class="wiki-excerpt">${escapeHtml(excerpt)}</div>
    <a class="wiki-link" href="${escapeHtml(data.pageUrl)}" target="_blank" rel="noopener">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      read more on wikipedia
    </a>`;
}

let wikiGen = 0;

export async function loadWiki(countryName) {
  const gen = ++wikiGen;
  const box = $("wiki-content");
  box.innerHTML = '<div class="wiki-note">loading…</div>';
  const data = await fetchWiki(countryName);
  if (gen === wikiGen) renderWikiContent(box, data);
}
