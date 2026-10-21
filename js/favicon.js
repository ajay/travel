import { cssVar } from "./util.js";

try {
  const c = document.createElement("canvas");
  c.width = c.height = 180;
  const ctx = c.getContext("2d");
  ctx.fillStyle = cssVar("--bg");
  ctx.fillRect(0, 0, 180, 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = cssVar("--accent");
  ctx.font =
    "600 96px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("/t", 90, 96);
  const png = c.toDataURL("image/png");
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = png;
} catch (e) {}
