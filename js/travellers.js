import { state } from "./state.js";

export const STATUSES = ["visited", "planned", "wishlist"];
const FIELDS = ["status", "year", "rating", "notes"];
const isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const norm = (k) => (typeof k === "string" ? k.trim().toLowerCase() : "");
const isNum = (x) =>
  (typeof x === "number" || (typeof x === "string" && x.trim() !== "")) &&
  isFinite(x);
const json = JSON.stringify;

// Validates data into state; returns what to warn about, or "".
export function load(data) {
  if (!isObj(data)) return "not an object";
  const w = [];
  for (const k of Object.keys(data))
    if (k !== "travellers" && k !== "countries") w.push(`${k} (unknown key)`);
  const countries = isObj(data.countries) ? data.countries : {};
  if (data.countries !== undefined && !isObj(data.countries))
    w.push("countries (not an object)");
  const names = [];
  const list = data.travellers;
  if (Array.isArray(list) && list.length)
    list.forEach((n, i) => {
      const k = norm(n);
      const why = !k
        ? "not a name"
        : k === "notes"
          ? "reserved"
          : names.includes(k) && "duplicate";
      if (why) w.push(`travellers[${i}]: ${json(n)} (${why})`);
      else names.push(k);
    });
  else {
    for (const [cca3, e] of Object.entries(countries))
      if (Object.hasOwn(state.lookup, cca3) && isObj(e))
        for (const k of Object.keys(e).map(norm))
          if (k && k !== "notes" && !names.includes(k)) names.push(k);
    const why =
      list === undefined
        ? " (missing"
        : Array.isArray(list)
          ? " (empty"
          : `: ${json(list)} (not a list`;
    if (list !== undefined || names.length)
      w.push(
        `travellers${why}; using names found in countries: ${names.join(", ") || "none"})`,
      );
  }
  state.travellers = names;
  state.on = names.map(() => true);
  state.trips = {};
  state.notes = {};
  for (const [cca3, e] of Object.entries(countries)) {
    const at = `countries.${cca3}`;
    if (!Object.hasOwn(state.lookup, cca3)) w.push(`${at} (unknown code)`);
    else if (!isObj(e)) w.push(`${at}: ${json(e)} (not an object)`);
    else {
      const trips = [];
      const seen = new Set();
      for (const [k, v] of Object.entries(e)) {
        const n = norm(k);
        const i = names.indexOf(n);
        if (n !== "notes" && i < 0) w.push(`${at}.${k} (unknown traveller)`);
        else if (seen.has(n)) w.push(`${at}.${k} (duplicate)`);
        else {
          seen.add(n);
          if (n === "notes") {
            if (typeof v === "string") state.notes[cca3] = v;
            else w.push(`${at}.${k}: ${json(v)} (not text)`);
          } else {
            const t = trip(v, `${at}.${k}`, w);
            if (t) trips[i] = t;
          }
        }
      }
      if (trips.length) state.trips[cca3] = trips;
    }
  }
  return w.length ? `ignoring ${w.join(", ")}` : "";
}

function trip(v, at, w) {
  const bare = typeof v === "string";
  if (!bare && !isObj(v)) {
    w.push(`${at}: ${json(v)} (not a status or object)`);
    return;
  }
  const t = {};
  for (const [f, x] of Object.entries(bare ? { status: v } : v)) {
    const p = bare ? at : `${at}.${f}`;
    if (!FIELDS.includes(f)) w.push(`${p} (unknown field)`);
    else if (f === "status" && !STATUSES.includes(x))
      w.push(`${p}: ${json(x)} (unknown status)`);
    else if (
      (f === "notes" && typeof x !== "string") ||
      (f === "year" && !["string", "number"].includes(typeof x))
    )
      w.push(`${p}: ${json(x)} (not text)`);
    else if (f === "rating" && !isNum(x))
      w.push(`${p}: ${json(x)} (not a number)`);
    else t[f] = x;
  }
  if (Object.keys(t).length) return t;
}

export const shown = () =>
  state.travellers.map((_, i) => i).filter((i) => state.on[i]);

// The furthest status among the shown travellers, and who holds it.
export function view(cca3) {
  const t = state.trips[cca3] || [];
  const s = shown();
  for (const status of STATUSES) {
    const who = s.filter((i) => t[i]?.status === status);
    if (who.length) return { status, who };
  }
  return null;
}

export const anyStatus = (cca3) => !!state.trips[cca3]?.some((t) => t?.status);
