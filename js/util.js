import { state } from "./state.js";

export const $ = (id) => document.getElementById(id);

export const isMobile = () => window.innerWidth <= 640;

export const rating = (r) => Math.max(0, Math.min(5, parseInt(r) || 0));

export const cssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

export function getFlagCca2(cca3) {
  return state.cca3ToCca2[cca3] || null;
}

export function flagImg(cca2, size, fallback) {
  return `<img src="https://flagcdn.com/${size}/${cca2}.png" onerror="this.outerHTML='${fallback}'" />`;
}

export function swipeToClose(el, close) {
  let startY = 0;
  el.addEventListener(
    "touchstart",
    (e) => {
      startY = e.touches[0].clientY;
    },
    { passive: true },
  );
  el.addEventListener(
    "touchend",
    (e) => {
      if (isMobile() && e.changedTouches[0].clientY - startY > 80) close();
    },
    { passive: true },
  );
}
