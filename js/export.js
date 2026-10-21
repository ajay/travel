import { $ } from "./util.js";

export function initExport() {
  const btn = $("export-btn");
  btn.addEventListener("click", async () => {
    btn.classList.add("loading");
    btn.textContent = "Generating…";

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
        backgroundColor: "#0a0f1e",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const ctx = canvas.getContext("2d");
      ctx.font = "bold 28px serif";
      ctx.fillStyle = "rgba(232,201,122,0.8)";
      ctx.fillText("Atlas", 24, canvas.height - 24);

      const link = document.createElement("a");
      link.download = "atlas-travel-map.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Try again or use a screenshot tool.");
    }

    btn.classList.remove("loading");
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export PNG';
  });
}
