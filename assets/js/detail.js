(function () {
  const works = window.WORKS || [];
  const qs = (sel, ctx = document) => ctx.querySelector(sel);

  function normalizeAssetPath(src) {
    const map = {
      "assets/img/第二版-封面.jpg": "assets/img/podcast-cover.jpg",
      "assets/img/第二版-封面.webp": "assets/img/podcast-cover.webp",
      "assets/img/播客剪辑截图1.png": "assets/img/podcast-still-1.png",
      "assets/img/播客剪辑截图1.webp": "assets/img/podcast-still-1.webp",
      "assets/img/播客剪辑截图2.png": "assets/img/podcast-still-2.png",
      "assets/img/播客剪辑截图2.webp": "assets/img/podcast-still-2.webp"
    };
    return map[src] || src;
  }

  function toWebp(src) {
    if (!src) return "";
    return normalizeAssetPath(src).replace(/\.(png|jpe?g)$/i, ".webp");
  }

  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  function loadIframeWhenNear(iframe, src) {
    if (!iframe || !src) return;
    iframe.removeAttribute("src");
    iframe.dataset.src = src;

    const load = () => {
      if (iframe.src === src) return;
      iframe.src = src;
    };

    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px", threshold: 0.01 }
    );
    observer.observe(iframe);
  }

  function renderDetail() {
    const slug = getSlug();
    const work = works.find((w) => w.slug === slug) || works[0];
    if (!work) return;

    const detailTitleEn = work.detail_title_en || work.title_en || "";
    qs("[data-detail-title]").textContent = detailTitleEn ? `${work.title_zh} / ${detailTitleEn}` : work.title_zh;
    const role = `${work.role_zh || ""}${work.role_zh && work.role_en ? " / " : ""}${work.role_en || ""}`;
    qs("[data-detail-role]").textContent = role || "";
    qs("[data-detail-year]").textContent = work.year;
    const desc = `${work.one_line_zh || ""}${work.one_line_zh && work.one_line_en ? "\n\n" : ""}${work.one_line_en || ""}`;
    qs("[data-detail-desc]").textContent = desc || "";

    const creditsProcessSection = qs("[data-detail-credits-process-section]");
    if (creditsProcessSection) {
      creditsProcessSection.style.display = work.hide_credits_process ? "none" : "";
    }

    const creditList = qs("[data-detail-credits]");
    if (creditList) {
      const credits = work.credits && work.credits.length ? work.credits : ["待补充 / To be updated"];
      creditList.innerHTML = credits.map((c) => `<li>${c}</li>`).join("");
    }

    const toolsWrap = qs("[data-detail-tools]");
    if (toolsWrap) {
      const tools = work.tools && work.tools.length ? work.tools : ["DaVinci Resolve"];
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
    stillsWrap.classList.toggle("stills-large", work.slug === "bookstore");
    const stills = work.stills && work.stills.length ? work.stills : [];
    stillsWrap.classList.toggle("stills-grid-single", stills.length === 1);
    if (stills.length) {
        const isSingle = stills.length === 1;
        stillsWrap.innerHTML = stills
          .map((src, idx) => {
            src = normalizeAssetPath(src);
            const webp = toWebp(src);
            const source = webp && webp !== src ? `<source srcset="${webp}" type="image/webp" />` : "";
            const imgStyle = isSingle ? ' style="width:100%;height:auto;"' : "";
            return `<div class="still-card"${isSingle ? ' style="min-height:0;"' : ""}><picture>${source}<img alt="still ${idx + 1}" src="${src}" loading="lazy" fetchpriority="low" decoding="async"${imgStyle} /></picture></div>`;
          })
          .join("");
      }
    }

    const iframe = qs("[data-detail-iframe]");
    const mediaImg = qs("[data-detail-media]");
    const mediaSource = qs("[data-detail-media-webp]");
    const mediaPicture = mediaImg ? mediaImg.closest("picture") : null;
    const coverImg = qs("[data-detail-cover]");
    const coverSource = qs("[data-detail-cover-webp]");
    const coverPicture = coverImg ? coverImg.closest("picture") : null;
    const mediaFrame = iframe ? iframe.closest(".media-frame") : null;
    if (work.embed) {
      const embedRatio = work.embed_ratio || "16 / 9";
      iframe.style.aspectRatio = embedRatio;
      iframe.style.setProperty("--detail-embed-ratio", embedRatio);
      loadIframeWhenNear(iframe, work.embed);
      iframe.style.display = "block";
      if (mediaFrame) {
        mediaFrame.classList.add("is-embed-frame");
        mediaFrame.style.setProperty("--detail-embed-ratio", embedRatio);
      }
      if (mediaImg) mediaImg.style.display = "none";
      if (mediaPicture) mediaPicture.style.display = "none";
    } else {
      iframe.style.display = "none";
      if (mediaFrame) {
        mediaFrame.classList.remove("is-embed-frame");
        mediaFrame.style.removeProperty("--detail-embed-ratio");
      }
      if (mediaImg) {
        const mediaSrc = normalizeAssetPath(work.media || work.cover || (work.stills && work.stills[0]) || "");
        const mediaWebp = work.media_webp || toWebp(mediaSrc);
        if (mediaSrc) {
          mediaImg.src = mediaSrc;
          mediaImg.alt = `${work.title_zh} / ${work.title_en}`;
          mediaImg.loading = "lazy";
          mediaImg.setAttribute("fetchpriority", "low");
          mediaImg.decoding = "async";
          mediaImg.style.display = "block";
          if (mediaSource && mediaWebp && mediaWebp !== mediaSrc) {
            mediaSource.setAttribute("srcset", mediaWebp);
          }
          if (mediaPicture) mediaPicture.style.display = "block";
        } else {
          mediaImg.style.display = "none";
          if (mediaPicture) mediaPicture.style.display = "none";
        }
      }
    }

    if (coverImg) {
      const coverSrc = normalizeAssetPath(work.cover || (work.stills && work.stills[0]) || "");
      const coverWebp = work.cover_webp || toWebp(coverSrc);
      if (coverSrc) {
        coverImg.src = coverSrc;
        coverImg.alt = `${work.title_zh} / ${work.title_en}`;
        coverImg.loading = "eager";
        coverImg.setAttribute("fetchpriority", "high");
        coverImg.decoding = "async";
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

    const link = qs("[data-detail-link]");
    link.href = work.link || "#";
    link.textContent = work.link_label || (work.link ? "在线播放" : "链接待补充（未上线流媒体）");
  }

  renderDetail();
})();
