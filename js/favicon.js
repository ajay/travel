try {
  const c = document.createElement("canvas");
  c.width = c.height = 180;
  const ctx = c.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 180, 180);
  grad.addColorStop(0, "#0d1b3e");
  grad.addColorStop(1, "#0a0f1e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 180, 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e8c97a";
  ctx.font = "bold 52px Georgia, serif";
  ctx.fillText("Atlas", 90, 90);
  const png = c.toDataURL("image/png");
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = png;
} catch (e) {}
