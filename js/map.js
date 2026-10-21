import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";
import { state } from "./state.js";
import { $, isMobile } from "./util.js";
import { openDetail, closeDetail } from "./detail.js";
import { closeStats } from "./stats.js";

// Dot when the largest landmass is under DOT_AREA px² on a DOT_REF_W-wide map.
// Fixed width on purpose: every screen gets the same list.
const DOT_AREA = 12;
const DOT_REF_W = 1440;
const DOT_R = 3;
// Max on-screen tap radius around a dot on touch screens.
const HIT_R = 8;
// Pinned dots, never faded: TUV has no shape, KIR's capital is on Tarawa.
const AT = { TUV: [179.2, -8.5], KIR: [173.0, 1.4] };
let anchorOf = () => null;
let dotLayer = null;
// The lifted selected paths, each with its old next sibling.
let lifted = [];

export async function buildMap() {
  const world = await d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
  );
  const svg = (state.svg = d3.select("#map-svg"));
  const W = svg.node().clientWidth || window.innerWidth;
  const H = svg.node().clientHeight || window.innerHeight - 56;
  const proj = d3
    .geoNaturalEarth1()
    .scale(W / 6.3)
    .translate([W / 2, H / 2]);
  const path = d3.geoPath().projection(proj);
  const g = svg.append("g").attr("id", "map-g");
  g.append("rect")
    .attr("x", -9999)
    .attr("y", -9999)
    .attr("width", 19998)
    .attr("height", 19998)
    .attr("class", "ocean");
  const features = topojson.feature(world, world.objects.countries).features;
  for (const f of features) f.cca3 = getCca3(f.id);
  // Smaller dots on narrow maps, so they don't bury their neighbours; status
  // dots shrink less, to stay clearly visible.
  const shrink = Math.min(1, Math.max(0.4, W / DOT_REF_W));
  const rOf = (d) =>
    DOT_R * (state.statuses[d.cca3] ? Math.max(0.7, shrink) : shrink);
  const dotList = dotData(features, path, proj, W, rOf);
  const addDots = (layer) =>
    layer.selectAll("circle").data(dotList).enter().append("circle");
  // Land under the dots: shows over sea, hidden under any country it overlaps.
  addDots(g.append("g").attr("class", "dot-land"));
  // Tap area under the shapes too, so it only widens taps over sea.
  if (isMobile() || matchMedia("(pointer: coarse)").matches)
    addDots(g.append("g").attr("class", "dot-hit")).call(hook);
  g.selectAll(".country")
    .data(features)
    .enter()
    .append("path")
    .attr("class", (d) => (d.cca3 ? cls(d.cca3) : "territory"))
    .attr("d", path)
    .call(hook);
  g.append("path")
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr("class", "mesh")
    .attr("d", path);
  dotLayer = g.append("g").style("--dot-k", shrink);
  addDots(dotLayer)
    .attr("class", (d) => cls(d.cca3))
    .call(hook);
  const dots = g.selectAll("circle");
  const hits = g.selectAll(".dot-hit circle");
  // Fade by the shape's size net of its outline, which scales with zoom
  // unless non-scaling.
  const cs = getComputedStyle(g.select("path.country").node());
  const line = parseFloat(cs.strokeWidth) || 0;
  const fixed = cs.vectorEffect === "non-scaling-stroke";
  const fade = (d, k) => {
    const s =
      (Math.sqrt(d.area) * k - line * (fixed ? 1 : k)) / Math.sqrt(DOT_AREA);
    return Math.min(1, Math.max(0, 2 - s));
  };
  const sizeDots = (k) => {
    for (const d of dotList) {
      d.cx = d.ax + (d.x - d.ax) / k ** 2;
      d.cy = d.ay + (d.y - d.ay) / k ** 2;
    }
    dots
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("r", (d) => rOf(d) / k)
      .attr("opacity", (d) => fade(d, k))
      .style("pointer-events", (d) => (fade(d, k) > 0.3 ? null : "none"));
    // Tap area: HIT_R px, short of the nearest dot.
    hits.attr("r", (d) => {
      const gap = d3.min(dotList, (e) =>
        e === d ? Infinity : Math.hypot(e.cx - d.cx, e.cy - d.cy),
      );
      return Math.min(HIT_R / k, gap / 2);
    });
  };
  sizeDots(1);
  // Hatch stripes keep their on-screen size at any zoom.
  const hatch = svg.selectAll("pattern");
  state.zoom = d3
    .zoom()
    .scaleExtent([1, 12])
    .translateExtent([
      [-W * 0.3, -H * 0.3],
      [W * 1.3, H * 1.3],
    ])
    .on("zoom", (e) => {
      g.attr("transform", e.transform);
      sizeDots(e.transform.k);
      hatch.attr("patternTransform", `rotate(45) scale(${1 / e.transform.k})`);
    });
  svg.call(state.zoom);
}

function dotData(features, path, proj, W, rOf) {
  const big = {};
  for (const { cca3, geometry: g } of features) {
    if (!cca3) continue;
    for (const c of g.type === "Polygon" ? [g.coordinates] : g.coordinates) {
      const poly = { type: "Polygon", coordinates: c };
      poly.sr = d3.geoArea(poly);
      if (!(big[cca3]?.sr >= poly.sr)) big[cca3] = poly;
    }
  }
  anchorOf = (cca3) =>
    AT[cca3] ? proj(AT[cca3]) : big[cca3] && path.centroid(big[cca3]);
  const ref = DOT_REF_W / W;
  const s = proj.scale() * ref;
  // NaturalEarth1 scales area by >= 0.87, so a big sphere area rules a dot out.
  const dots = Object.keys(state.lookup)
    .filter((cca3) => AT[cca3] || big[cca3]?.sr * s * s < 2 * DOT_AREA)
    .map((cca3) => ({ cca3, area: AT[cca3] ? 0 : path.area(big[cca3]) }))
    .filter((d) => d.area * ref * ref < DOT_AREA)
    .sort((a, b) => !!state.statuses[a.cca3] - !!state.statuses[b.cca3]);
  for (const d of dots) {
    [d.ax, d.ay] = anchorOf(d.cca3);
    [d.x, d.y] = [d.ax, d.ay];
  }
  // Push overlapping dots apart, by the same ground distance on every screen
  // (a few px at DOT_REF_W), but at least clear of each other; the push
  // shrinks as 1/k on zoom.
  d3.forceSimulation(dots)
    .force("x", d3.forceX((d) => d.ax).strength(0.2))
    .force("y", d3.forceY((d) => d.ay).strength(0.2))
    .force(
      "c",
      d3.forceCollide((d) => Math.max((DOT_R + 1) / ref, rOf(d) + 0.5)),
    )
    .stop()
    .tick(120);
  return dots;
}

function hook(sel) {
  sel
    .attr("data-cca3", (d) => d.cca3)
    .on("mousemove", showTip)
    .on("mouseleave", hideTip)
    .on("click", pick);
}

function showTip(event, d) {
  const tip = $("tooltip");
  tip.textContent = state.lookup[d.cca3]?.name ?? d.properties?.name ?? "—";
  tip.style.left = event.offsetX + 14 + "px";
  tip.style.top = event.offsetY - 30 + "px";
  tip.classList.add("show");
}

function hideTip() {
  $("tooltip").classList.remove("show");
}

function pick(event, d) {
  if (!d.cca3) return;
  event.stopPropagation();
  openDetail(d.cca3);
}

function getCca3(numId) {
  const m = state.countries.find((c) => parseInt(c.ccn3) === parseInt(numId));
  return m ? m.cca3 : null;
}

function cls(cca3) {
  return (
    "country " +
    (state.statuses[cca3] || "") +
    (state.selected === cca3 ? " selected" : "")
  ).trim();
}

export function refreshMap() {
  d3.selectAll(".country").attr("class", function () {
    return cls(this.getAttribute("data-cca3"));
  });
  // Lift the selected shape over its neighbours' borders, but under the dots.
  const sel = document.querySelectorAll("path.country.selected");
  if (lifted.length && lifted[0][0] !== sel[0]) {
    for (const [p, next] of lifted.reverse()) next.before(p);
    lifted = [];
  }
  if (sel.length && !lifted.length && dotLayer) {
    lifted = [...sel].map((p) => [p, p.nextSibling]);
    dotLayer.node().before(...sel);
  }
  updateCounts();
}

function updateCounts() {
  const v = Object.values(state.statuses);
  for (const s of ["visited", "planned", "wishlist"])
    $(`count-${s}`).textContent = v.filter((x) => x === s).length;
}

export function zoomToCountry(cca3) {
  const { svg, zoom } = state;
  const xy = anchorOf(cca3);
  if (xy && zoom && svg) {
    const box = $("map-svg").getBoundingClientRect();
    // On mobile, centre in the strip above the detail sheet.
    const bottom =
      $("detail").classList.contains("open") && isMobile()
        ? window.innerHeight - $("detail").offsetHeight
        : box.bottom;
    const h = Math.max(40, Math.min(box.bottom, bottom) - box.top);
    svg
      .transition()
      .duration(700)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(box.width / 2, h / 2)
          .scale(3)
          .translate(-xy[0], -xy[1]),
      );
  }
}

export function initMap() {
  $("map-svg").addEventListener("click", () => {
    closeDetail();
    if (!isMobile()) closeStats();
  });
  $("zoom-in").addEventListener("click", () =>
    state.svg?.transition().duration(300).call(state.zoom.scaleBy, 1.5),
  );
  $("zoom-out").addEventListener("click", () =>
    state.svg?.transition().duration(300).call(state.zoom.scaleBy, 0.67),
  );
  $("zoom-reset").addEventListener("click", () =>
    state.svg
      ?.transition()
      .duration(500)
      .call(state.zoom.transform, d3.zoomIdentity),
  );
}
