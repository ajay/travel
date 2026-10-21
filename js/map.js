import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";
import { state } from "./state.js";
import { $, isMobile } from "./util.js";
import { openDetail, closeDetail } from "./detail.js";
import { closeStats } from "./stats.js";

export async function buildMap() {
  const world = await d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
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
    .attr("fill", "#0d1829");
  const features = topojson.feature(world, world.objects.countries).features;
  g.selectAll(".country")
    .data(features)
    .enter()
    .append("path")
    .attr("class", (d) => cls(getCca3(d.id)))
    .attr("d", path)
    .attr("data-cca3", (d) => getCca3(d.id))
    .on("mousemove", function (event) {
      const info = state.lookup[this.getAttribute("data-cca3")];
      const tip = $("tooltip");
      tip.textContent = info?.name ?? "—";
      tip.style.left = event.offsetX + 14 + "px";
      tip.style.top = event.offsetY - 30 + "px";
      tip.classList.add("show");
    })
    .on("mouseleave", () => $("tooltip").classList.remove("show"))
    .on("click", function (event) {
      event.stopPropagation();
      openDetail(this.getAttribute("data-cca3"));
    });
  g.append("path")
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "#1e2d45")
    .attr("stroke-width", 0.5)
    .attr("d", path);
  state.zoom = d3
    .zoom()
    .scaleExtent([1, 12])
    .translateExtent([
      [-W * 0.3, -H * 0.3],
      [W * 1.3, H * 1.3],
    ])
    .on("zoom", (e) => g.attr("transform", e.transform));
  svg.call(state.zoom);
}

function getCca3(numId) {
  const m = state.countries.find((c) => parseInt(c.ccn3) === parseInt(numId));
  return m ? m.cca3 : String(numId);
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
  updateCounts();
}

function updateCounts() {
  const v = Object.values(state.statuses);
  for (const s of ["visited", "planned", "wishlist"])
    $(`count-${s}`).textContent = v.filter((x) => x === s).length;
}

export function zoomToCountry(cca3) {
  const { svg, zoom } = state;
  const el = $("map-svg").querySelector(`[data-cca3="${cca3}"]`);
  if (el && zoom && svg) {
    const b = el.getBBox();
    const W = $("map-svg").clientWidth;
    const H = $("map-svg").clientHeight;
    svg
      .transition()
      .duration(700)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(W / 2, H / 2)
          .scale(3)
          .translate(-(b.x + b.width / 2), -(b.y + b.height / 2)),
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
