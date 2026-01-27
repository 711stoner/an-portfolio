(function () {
  const works = window.WORKS || [];
  const qs = (sel, ctx = document) => ctx.querySelector(sel);

  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  function renderDetail() {
    const slug = getSlug();
    const work = works.find((w) => w.slug === slug) || works[0];
    if (!work) return;

    qs("[data-detail-title]").textContent = `${work.title_zh} / ${work.title_en}`;
    const role = `${work.role_zh || ""}${work.role_zh && work.role_en ? " / " : ""}${work.role_en || ""}`;
    qs("[data-detail-role]").textContent = role || "";
    qs("[data-detail-year]").textContent = work.year;
    const desc = `${work.one_line_zh || ""}${work.one_line_en ? " " + work.one_line_en : ""}`;
    qs("[data-detail-desc]").textContent = desc || "";

    const creditList = qs("[data-detail-credits]");
    if (creditList) {
      const credits = work.credits && work.credits.length ? work.credits : ["待补充 / To be updated"];
      creditList.innerHTML = credits.map((c) => `<li>${c}</li>`).join("");
    }

    const toolsWrap = qs("[data-detail-tools]");
    if (toolsWrap) {
      const tools = work.tools && work.tools.length ? work.tools : ["Premiere Pro", "DaVinci Resolve"];
      toolsWrap.innerHTML = tools.map((t) => `<span class="chip">${t}</span>`).join("");
    }

    const processWrap = qs("[data-detail-process]");
    if (processWrap) {
      const process = work.process && work.process.length ? work.process : ["前期策划 / Pre‑production", "现场执行 / On‑set", "后期剪辑 / Post"];
      processWrap.innerHTML = process
        .map(
          (item) => `
          <div class="skill-card">
            <strong>${item.split("/")[0].trim()}</strong>
            <p style="margin-top: 6px; color: #6b7280;">${item}</p>
          </div>
        `
        )
        .join("");
    }

    const stillsWrap = qs("[data-detail-stills]");
    if (stillsWrap) {
      const stills = work.stills && work.stills.length ? work.stills : [];
      if (stills.length) {
        stillsWrap.innerHTML = stills
          .map((src, idx) => `<div class="still-card"><img alt="still ${idx + 1}" src="${src}" /></div>`)
          .join("");
      }
    }

    const iframe = qs("[data-detail-iframe]");
    const placeholder = qs("[data-detail-placeholder]");
    if (work.embed) {
      iframe.src = work.embed;
      iframe.style.display = "block";
      if (placeholder) placeholder.style.display = "none";
    } else {
      iframe.style.display = "none";
      if (placeholder) placeholder.style.display = "block";
    }

    const link = qs("[data-detail-link]");
    link.href = work.link || "#";
    link.textContent = work.link ? "打开原链接 / Open Link" : "链接待补充 / Link pending";
  }

  renderDetail();
})();
