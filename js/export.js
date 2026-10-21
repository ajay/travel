import { $, cssVar } from "./util.js";
import { closeList } from "./list.js";
import { state } from "./state.js";
import { shown } from "./travellers.js";

// One key cell: a status colour, hatched for wishlist (╱ s1, ╲ s2, ╳ s0).
function cell(ctx, x, y, status, step) {
  ctx.fillStyle = cssVar(
    status === "wishlist" ? "--wishlist-bg" : `--${status}-${step}`,
  );
  ctx.fillRect(x, y, 12, 20);
  if (status !== "wishlist") return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, 12, 20);
  ctx.clip();
  ctx.strokeStyle = cssVar(`--wishlist-ink-${step}`);
  ctx.lineWidth = 1.5;
  for (let d = -20; d < 32; d += 5) {
    if (step !== 2) (ctx.moveTo(x + d, y + 20), ctx.lineTo(x + d + 20, y));
    if (step !== 1) (ctx.moveTo(x + d, y), ctx.lineTo(x + d + 20, y + 20));
  }
  ctx.stroke();
  ctx.restore();
}

export function initExport() {
  const btn = $("export-btn");
  const label = btn.querySelector("span");
  btn.addEventListener("click", async () => {
    closeList();
    btn.classList.add("loading");
    label.textContent = "generating…";

    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const mapEl = document.querySelector(".map-container");
      const canvas = await html2canvas(mapEl, {
        backgroundColor: cssVar("--bg"),
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // html2canvas drops CSS filters and ::placeholder; leave controls out.
        ignoreElements: (el) =>
          el.matches(
            ".search-wrap, .zoom-controls, .list-panel, .list-overlay",
          ),
      });

      const ctx = canvas.getContext("2d");
      // html2canvas leaves its scale and page offset on the context.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const y = canvas.height - 32;
      const font = `24px ${cssVar("--mono")}`;
      ctx.font = font;
      ctx.fillStyle = cssVar("--accent");
      ctx.fillText("ajay.engineer/", 32, y);
      const x = 32 + ctx.measureText("ajay.engineer/").width;
      ctx.font = `500 ${font}`;
      ctx.fillStyle = cssVar("--text");
      ctx.fillText("travel", x, y);
      // The header isn't in the PNG, so name who is shown, with a key for two.
      if (state.travellers.length > 1) {
        const names = shown().map((i) => state.travellers[i]);
        let kx = x + ctx.measureText("travel").width;
        ctx.font = font;
        ctx.fillStyle = cssVar("--text-muted");
        const who = `  ·  ${names.join(" + ")}`;
        ctx.fillText(who, kx, y);
        kx += ctx.measureText(who).width;
        if (names.length === 2)
          for (const [step, name] of [
            [1, names[0]],
            [2, names[1]],
            [0, "both"],
          ]) {
            kx += 32;
            ["visited", "planned", "wishlist"].forEach((s, n) =>
              cell(ctx, kx + n * 14, y - 18, s, step),
            );
            kx += 3 * 14 + 8;
            ctx.fillStyle = cssVar("--text-muted");
            ctx.fillText(name, kx, y);
            kx += ctx.measureText(name).width;
          }
      }

      const link = document.createElement("a");
      link.download = "ajay-engineer-travel.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
      alert("export failed. try again or use a screenshot tool.");
    }

    btn.classList.remove("loading");
    label.textContent = "png";
  });
}
