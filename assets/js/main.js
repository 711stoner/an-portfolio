(function () {
  document.documentElement.classList.add("js");
  const works = window.WORKS || [];
  const categories = window.WORK_CATEGORIES || [];
  const years =
    window.WORK_YEARS || [
      { key: "2026", label: "2026 / 2026" },
      { key: "2025", label: "2025 / 2025" },
      { key: "2024", label: "2024 / 2024" },
      { key: "2023", label: "2023 / 2023" },
      { key: "2022", label: "2022 / 2022" },
      { key: "2021", label: "2021 / 2021" }
    ];

  const defaultCategory = categories.find((c) => c.key === "All")
    ? "All"
    : (categories[0] && categories[0].key) || "All";
  let selectedCategory = defaultCategory;

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function initParallax() {
    const hero = qs(".hero");
    if (!hero) return;
    const layers = qsa(".hero-layer");
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      layers.forEach((layer, i) => {
        const depth = (i + 1) * 8;
        layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    });
  }

  function initNavSpy() {
    const links = qsa(".nav-links a[href^='#']");
    if (!links.length) return;
    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const section = qs(`#${id}`);
      if (section) map.set(section, link);
    });
    if (!map.size) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            const link = map.get(entry.target);
            if (link) link.classList.add("active");
          }
        });
      },
      { threshold: 0.35 }
    );
    map.forEach((_, section) => observer.observe(section));
  }

  function initScrollParallax() {
    const items = qsa("[data-parallax]");
    if (!items.length) return;
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      items.forEach((item) => {
        const wrapper = item.parentElement;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const progress = rect.top / vh - 0.5;
        const offset = Math.max(-12, Math.min(12, progress * 18));
        item.style.transform = `translateY(${offset}px)`;
      });
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
  }

  function initStickyFilters() {
    const filters = qs(".filters");
    if (!filters) return;
    const offset = 68;
    let ticking = false;

    const update = () => {
      ticking = false;
      const top = filters.getBoundingClientRect().top;
      filters.classList.toggle("is-stuck", top <= offset + 1);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
  }

  function initReveal() {
    const items = qsa(".reveal");
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function formatRole(work) {
    const zh = work.role_zh || work.role || "";
    const en = work.role_en || "";
    if (zh && en) return `${zh} / ${en}`;
    return zh || en || "";
  }

  function formatOneLine(work) {
    const zh = work.one_line_zh || work.one_line || "";
    const en = work.one_line_en || "";
    if (zh && en) return `${zh} ${en}`;
    return zh || en || "";
  }

  function toWebp(src) {
    if (!src) return "";
    return src.replace(/\.(png|jpe?g)$/i, ".webp");
  }

  function getMime(src) {
    const ext = (src || "").split(".").pop().toLowerCase();
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "png") return "image/png";
    if (ext === "webp") return "image/webp";
    return "";
  }

  function renderWorkCard(work) {
    const coverSize = work.cover_size || "contain";
    const coverUrl = work.cover || "";
    const coverWebp = work.cover_webp || toWebp(coverUrl);
    const coverType = getMime(coverUrl) || "image/png";
    const bgBase = `linear-gradient(120deg, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.2)), url('${coverUrl}')`;
    const bgWebp = coverWebp && coverWebp !== coverUrl
      ? `linear-gradient(120deg, rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.2)), image-set(url('${coverWebp}') type('image/webp'), url('${coverUrl}') type('${coverType}'))`
      : bgBase;
    const coverStyle = coverUrl
      ? ` style="background-image: ${bgBase}; background-image: ${bgWebp}; background-size: ${coverSize}; background-position: center; background-repeat: no-repeat;"`
      : "";
    return `
      <article class="work-card" data-slug="${work.slug}">
        <div class="work-cover"${coverStyle}>
          <div class="cover-shift" data-parallax></div>
        </div>
        <div class="work-info">
          <h3>
            <span class="block">${work.title_zh}</span>
            ${work.title_en ? `<span class="block text-sm" style="color:#64748b;font-weight:400;">${work.title_en}</span>` : ""}
          </h3>
          <p>${formatRole(work)}</p>
          <div class="platform-row">
            <span class="platform-pill">${work.platform}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderWorksGrid(container, list) {
    container.innerHTML = list.map(renderWorkCard).join("");
    qsa(".work-card", container).forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.slug));
    });
  }

  function renderWorksGrouped(container, list) {
    const yearKeys = years.map((y) => String(y.key)).filter((k) => k && k !== "All");
    const groupMap = new Map();
    list.forEach((work) => {
      const y = String(work.year || "");
      if (!groupMap.has(y)) groupMap.set(y, []);
      groupMap.get(y).push(work);
    });

    const sections = yearKeys.map((year) => {
      const items = groupMap.get(year) || [];
      const cards = items.length
        ? `<div class="grid grid-4">${items.map(renderWorkCard).join("")}</div>`
        : `<div class="year-empty">暂无作品 / No works yet</div>`;
      return `
        <div class="year-group">
          <div class="year-title">${year} <span>Year / 年份</span></div>
          ${cards}
        </div>
      `;
    });

    container.innerHTML = sections.join("");
    qsa(".work-card", container).forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.slug));
    });
  }

  function renderFilters(container) {
    container.innerHTML = categories
      .map(
        (cat) =>
          `<button class="filter-btn ${cat.key === selectedCategory ? "active" : ""}" data-key="${cat.key}">${cat.label}</button>`
      )
      .join("");

    qsa(".filter-btn", container).forEach((btn) => {
      btn.addEventListener("click", () => {
        qsa(".filter-btn", container).forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedCategory = btn.dataset.key;
        applyFilters();
      });
    });
  }

  function applyFilters() {
    const grid = qs("[data-grid='works']");
    if (!grid) return;
    let list = works.slice();
    if (selectedCategory !== "All") {
      list = list.filter((w) => w.category === selectedCategory);
    }
    const seen = new Set();
    list = list.filter((w) => {
      if (!w || !w.slug) return false;
      if (seen.has(w.slug)) return false;
      seen.add(w.slug);
      return true;
    });
    list.sort((a, b) => {
      const ay = Number(a.year) || 0;
      const by = Number(b.year) || 0;
      if (ay !== by) return by - ay;
      const aTitle = (a.title_zh || a.title_en || "").toString();
      const bTitle = (b.title_zh || b.title_en || "").toString();
      return aTitle.localeCompare(bTitle, "zh-Hans-CN");
    });
    const limit = Number(grid.dataset.limit || "0");
    if (limit) list = list.slice(0, limit);
    if (grid.dataset.grouped === "true") {
      renderWorksGrouped(grid, list);
    } else {
      renderWorksGrid(grid, list);
    }
  }

  function openModal(slug) {
    const modal = qs(".modal");
    if (!modal) return;
    const work = works.find((w) => w.slug === slug);
    if (!work) return;

    const title = qs("[data-modal-title]");
    const role = qs("[data-modal-role]");
    const year = qs("[data-modal-year]");
    const desc = qs("[data-modal-desc]");
    const link = qs("[data-modal-link]");
    const detailLink = qs("[data-modal-detail-link]");
    const iframe = qs("[data-modal-iframe]");
    const placeholder = qs("[data-modal-placeholder]");
    const coverImg = qs("[data-modal-cover]");
    const coverSource = qs("[data-modal-cover-webp]");
    const coverPicture = coverImg ? coverImg.closest("picture") : null;
    const credits = qs("[data-modal-credits]");
    const tools = qs("[data-modal-tools]");
    const process = qs("[data-modal-process]");
    const stills = qs("[data-modal-stills]");

    title.textContent = `${work.title_zh} / ${work.title_en}`;
    role.textContent = formatRole(work);
    year.textContent = work.year;
    desc.textContent = formatOneLine(work);
    link.href = work.link || "#";
    link.textContent = work.link ? "打开原链接 / Open Link" : "链接待补充 / Link pending";
    if (detailLink) {
      detailLink.href = `work.html?slug=${encodeURIComponent(work.slug)}`;
    }
    if (credits) {
      const list = work.credits && work.credits.length ? work.credits : ["待补充 / To be updated"];
      credits.innerHTML = list.map((item) => `<li>${item}</li>`).join("");
    }
    if (tools) {
      const list = work.tools && work.tools.length ? work.tools : ["Premiere Pro", "DaVinci Resolve"];
      tools.innerHTML = list.map((item) => `<span class="chip">${item}</span>`).join("");
    }
    if (process) {
      const list = work.process && work.process.length ? work.process : ["前期策划 / Pre‑production", "现场执行 / On‑set", "后期剪辑 / Post"];
      process.innerHTML = list
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
  if (stills) {
    stills.classList.toggle("stills-large", work.slug === "bookstore");
    const list = work.stills && work.stills.length ? work.stills : [];
    stills.innerHTML = list.length
        ? list
            .map((src, idx) => {
              const webp = toWebp(src);
              const source = webp && webp !== src ? `<source srcset="${webp}" type="image/webp" />` : "";
              return `<div class="still-card"><picture>${source}<img alt="still ${idx + 1}" src="${src}" loading="lazy" decoding="async" /></picture></div>`;
            })
            .join("")
        : `<div class="still-card">画面待补充 / Stills pending</div>`;
    }

    if (work.embed) {
      iframe.style.display = "block";
      iframe.src = work.embed;
      if (coverImg) coverImg.style.display = "none";
      if (coverPicture) coverPicture.style.display = "none";
      if (placeholder) placeholder.style.display = "none";
    } else {
      iframe.style.display = "none";
      if (coverImg) {
        const coverSrc = work.cover || (work.stills && work.stills[0]) || "";
        const coverWebp = work.cover_webp || toWebp(coverSrc);
        if (coverSrc) {
          coverImg.src = coverSrc;
          coverImg.alt = `${work.title_zh} / ${work.title_en}`;
          coverImg.style.display = "block";
          if (coverSource && coverWebp && coverWebp !== coverSrc) {
            coverSource.setAttribute("srcset", coverWebp);
          }
          if (coverPicture) coverPicture.style.display = "block";
        } else {
          coverImg.style.display = "none";
          if (coverPicture) coverPicture.style.display = "none";
        }
      }
      if (placeholder) placeholder.style.display = "none";
    }

    modal.classList.add("active");
    activateTab("overview");
  }

  function closeModal() {
    const modal = qs(".modal");
    if (!modal) return;
    const iframe = qs("[data-modal-iframe]");
    if (iframe) iframe.src = "";
    const coverImg = qs("[data-modal-cover]");
    if (coverImg) coverImg.src = "";
    const coverSource = qs("[data-modal-cover-webp]");
    if (coverSource) coverSource.setAttribute("srcset", "");
    modal.classList.remove("active");
  }

  function initModal() {
    const modal = qs(".modal");
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) closeModal();
    });
    qsa("[data-modal-close]").forEach((btn) => btn.addEventListener("click", closeModal));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    qsa(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => activateTab(btn.dataset.tab));
    });
  }

  function activateTab(key) {
    qsa(".tab-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === key));
    qsa("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === key));
  }

  function initWorks() {
    const grid = qs("[data-grid='works']");
    if (!grid) return;
    applyFilters();
  }

  function initFilters() {
    const container = qs("[data-filters]");
    if (!container) return;
    renderFilters(container);
  }

  initParallax();
  initNavSpy();
  initScrollParallax();
  initStickyFilters();
  initReveal();
  initWorks();
  initFilters();
  initModal();
})();
