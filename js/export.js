import { $, cssVar } from "./util.js";

export function initExport() {
  const btn = $("export-btn");
  const label = btn.querySelector("span");
  btn.addEventListener("click", async () => {
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
        ignoreElements: (el) => el.matches(".search-wrap, .zoom-controls"),
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

      const link = document.createElement("a");
      link.download = "ajay-engineer-travel.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
      alert("export failed. try again or use a screenshot tool.");
    }

    btn.classList.remove("loading");
    label.textContent = "export png";
  });
}
