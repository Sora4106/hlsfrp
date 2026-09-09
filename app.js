(function () {
  "use strict";

  const state = {
    lang: localStorage.getItem("hls-lang") === "en" ? "en" : "zh",
    data: null,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  const t = (value) => {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    return value[state.lang] || value.zh || value.en || "";
  };
  const ui = (key) => state.data.ui[state.lang][key] || key;
  const routeHref = (path) => `#/${path}`;
  const productById = (id) => state.data.products.find((product) => product.id === id);
  const categoryById = (id) => state.data.categories.find((category) => category.id === id);
  const assetLabel = (path) => path.split("/").pop().replace(/[_-]/g, " ").replace(/\.[^.]+$/, "");

  const icons = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3h3l1.5 4-2 1.5a15 15 0 0 0 5.8 5.8l1.5-2 4 1.5v3A3.2 3.2 0 0 1 17.8 20C10.2 19.5 4.5 13.8 4 6.2A3.2 3.2 0 0 1 7.2 3Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };

  function currentRoute() {
    const raw = location.hash.replace(/^#\/?/, "") || "home";
    return raw.split("?")[0].split("/").filter(Boolean);
  }

  function setMeta(title, description) {
    document.title = `${title}｜${t(state.data.company.shortName)}`;
    const meta = $('meta[name="description"]');
    if (meta && description) meta.setAttribute("content", description);
  }

  function buttonLink(href, label, variant = "primary") {
    return `<a class="button button-${variant}" href="${href}"><span>${esc(label)}</span>${icons.arrow}</a>`;
  }

  function sectionHeading(eyebrow, heading, body = "", alignment = "left") {
    return `
      <div class="section-heading section-heading-${alignment} reveal">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h2>${esc(heading)}</h2>
        ${body ? `<p class="section-lead">${esc(body)}</p>` : ""}
      </div>`;
  }

  function renderHeader() {
    const company = state.data.company;
    const nav = [
      ["home", ui("home")],
      ["about", ui("about")],
      ["products", ui("products")],
      ["news", ui("news")],
      ["contact", ui("contact")],
    ];
    const active = currentRoute()[0];
    $("#site-header").innerHTML = `
      <div class="utility-bar">
        <div class="container utility-inner">
          <span>${esc(t(company.eyebrow))}</span>
          <div class="utility-actions">
            <a href="tel:${esc(company.phone)}">${icons.phone}${esc(company.phone)}</a>
            <span class="utility-divider"></span>
            <button class="language-switch" type="button" data-action="language" aria-label="${state.lang === "zh" ? "Switch to English" : "切換為繁體中文"}">
              <span class="${state.lang === "zh" ? "active" : ""}">繁中</span>
              <span>／</span>
              <span class="${state.lang === "en" ? "active" : ""}">EN</span>
            </button>
          </div>
        </div>
      </div>
      <div class="nav-shell">
        <div class="container nav-inner">
          <a class="brand" href="${routeHref("home")}" aria-label="${esc(t(company.name))}">
            <span class="brand-mark"><img src="public/assets/legacy/11_n090.jpg" alt="" /></span>
            <span class="brand-copy">
              <strong>${esc(t(company.name))}</strong>
              <small>${state.lang === "zh" ? "HOU LI SHENG ENTERPRISE CO., LTD" : "FRP DESIGN & MANUFACTURING"}</small>
            </span>
          </a>
          <button class="menu-toggle" type="button" data-action="menu" aria-expanded="false" aria-label="${esc(ui("menu"))}">
            <span></span><span></span><span></span>
          </button>
          <nav class="main-nav" aria-label="${state.lang === "zh" ? "主要導覽" : "Main navigation"}">
            ${nav.map(([path, label]) => `<a href="${routeHref(path)}" class="${active === path || (active === "product" && path === "products") ? "active" : ""}">${esc(label)}</a>`).join("")}
            <a class="nav-cta" href="${routeHref("contact")}">${esc(ui("contactUs"))}${icons.arrow}</a>
          </nav>
        </div>
      </div>`;
  }

  function renderFooter() {
    const company = state.data.company;
    $("#site-footer").innerHTML = `
      <div class="footer-main">
        <div class="container footer-grid">
          <div class="footer-brand">
            <img src="public/assets/legacy/11_n090.jpg" alt="" />
            <div><strong>${esc(t(company.name))}</strong><p>${esc(t(company.tagline))}</p></div>
          </div>
          <div>
            <p class="footer-label">${esc(ui("products"))}</p>
            <div class="footer-links">
              ${state.data.categories.map((category) => `<a href="${routeHref("products")}">${esc(t(category.name))}</a>`).join("")}
            </div>
          </div>
          <div>
            <p class="footer-label">${esc(ui("contact"))}</p>
            <div class="footer-contact">
              <a href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              <a href="mailto:${esc(company.email)}">${esc(company.email)}</a>
              <span>${esc(t(company.address))}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <span>© ${new Date().getFullYear()} ${esc(t(company.name))}</span>
          <span>${state.lang === "zh" ? "網站內容移轉自原公司網站・台灣製造" : "Content migrated from the legacy company website · Made in Taiwan"}</span>
        </div>
      </div>`;
  }

  function categoryCard(category, index = 0) {
    return `
      <article class="category-card reveal" style="--delay:${index * 70}ms">
        <a href="${routeHref("products")}" aria-label="${esc(t(category.name))}">
          <div class="category-image"><img src="${esc(category.image)}" alt="${esc(t(category.name))}" loading="lazy" /></div>
          <div class="category-content">
            <span class="category-number">0${index + 1}</span>
            <h3>${esc(t(category.name))}</h3>
            <p>${esc(t(category.description))}</p>
            <span class="text-link">${esc(ui("details"))}${icons.arrow}</span>
          </div>
        </a>
      </article>`;
  }

  function productCard(product, index = 0) {
    const category = categoryById(product.category);
    const image = product.images[0];
    return `
      <article class="product-card reveal" style="--delay:${index * 55}ms">
        <a href="${routeHref(`product/${product.id}`)}">
          <div class="product-image">
            <img src="${esc(image)}" alt="${esc(t(product.name))}" loading="lazy" />
            <span class="product-arrow">${icons.arrow}</span>
          </div>
          <div class="product-content">
            <p>${esc(t(category.name))}</p>
            <h3>${esc(t(product.name))}</h3>
            <span>${esc(t(product.summary))}</span>
          </div>
        </a>
      </article>`;
  }

  function renderHome() {
    const company = state.data.company;
    const about = state.data.about;
    const featuredIds = ["feed-system", "domestic-treatment", "chemical-tank", "integrated-bathroom"];
    const featured = featuredIds.map(productById);
    setMeta(t(company.name), t(company.tagline));
    return `
      <section class="hero home-hero">
        <div class="hero-backdrop"></div>
        <div class="container hero-layout">
          <div class="hero-copy">
            <p class="hero-kicker">${esc(t(company.eyebrow))}</p>
            <h1>${state.lang === "zh" ? "專業複材製造，<br><em>成就長久可靠</em>" : "Composite expertise,<br><em>built to endure</em>"}</h1>
            <p>${esc(t(company.tagline))}</p>
            <div class="hero-actions">
              ${buttonLink(routeHref("products"), ui("explore"))}
              ${buttonLink(routeHref("contact"), ui("contactUs"), "ghost")}
            </div>
          </div>
          <div class="hero-stamp" aria-label="Since 1975"><span>SINCE</span><strong>1975</strong><small>FRP EXPERTISE</small></div>
        </div>
        <a class="scroll-cue" href="#home-about"><span>${state.lang === "zh" ? "向下探索" : "Discover"}</span><i></i></a>
      </section>

      <section class="capability-strip">
        <div class="container capability-grid">
          <div><strong>50<sup>+</sup></strong><span>${state.lang === "zh" ? "年製造經驗" : "Years of experience"}</span></div>
          <div><strong>03</strong><span>${state.lang === "zh" ? "亞洲服務據點" : "Asian locations"}</span></div>
          <div><strong>FRP</strong><span>${state.lang === "zh" ? "設計・研發・製造" : "Design · R&D · Manufacturing"}</span></div>
        </div>
      </section>

      <section id="home-about" class="section about-preview">
        <div class="container split-layout">
          <div class="about-visual reveal">
            <div class="image-frame"><img src="public/assets/legacy/18_cjzo.jpg" alt="${state.lang === "zh" ? "好利生高雄工廠" : "Hou Li Sheng factory in Kaohsiung"}" loading="lazy" /></div>
            <div class="experience-card"><strong>1975</strong><span>${state.lang === "zh" ? "從高雄出發" : "Founded in Kaohsiung"}</span></div>
          </div>
          <div class="about-copy">
            ${sectionHeading(state.lang === "zh" ? "關於好利生" : "ABOUT HOU LI SHENG", t(about.heading), t(about.lead))}
            <p class="body-copy reveal">${esc(t(about.paragraphs[0]))}</p>
            <div class="mini-values reveal">
              <span>${icons.check}${state.lang === "zh" ? "台灣製造" : "Made in Taiwan"}</span>
              <span>${icons.check}${state.lang === "zh" ? "彈性客製" : "Custom solutions"}</span>
              <span>${icons.check}${state.lang === "zh" ? "耐用工藝" : "Durable craft"}</span>
            </div>
            <div class="reveal">${buttonLink(routeHref("about"), ui("learnMore"), "outline")}</div>
          </div>
        </div>
      </section>

      <section class="section category-section">
        <div class="container">
          ${sectionHeading(state.lang === "zh" ? "跨產業解決方案" : "INDUSTRY SOLUTIONS", state.lang === "zh" ? "一種材料，回應多種現場需求" : "One material, engineered for many environments", state.lang === "zh" ? "從養殖、污水到特殊儲存與衛浴設備，以 FRP 的耐蝕、輕量與成型彈性，打造適合現場的產品。" : "FRP's corrosion resistance, low weight and forming flexibility support farming, wastewater, storage and sanitation applications.")}
          <div class="category-grid">${state.data.categories.map(categoryCard).join("")}</div>
        </div>
      </section>

      <section class="section featured-section">
        <div class="container">
          <div class="heading-row">
            ${sectionHeading(state.lang === "zh" ? "精選產品" : "FEATURED PRODUCTS", state.lang === "zh" ? "從需求出發，製作剛好的設備" : "Products shaped around real requirements")}
            <div class="reveal">${buttonLink(routeHref("products"), ui("allProducts"), "outline")}</div>
          </div>
          <div class="product-grid">${featured.map(productCard).join("")}</div>
        </div>
      </section>

      <section class="section quality-banner">
        <div class="quality-image"></div>
        <div class="container quality-content reveal">
          <p class="eyebrow">${state.lang === "zh" ? "可靠來自每一道細節" : "RELIABILITY IN EVERY DETAIL"}</p>
          <h2>${state.lang === "zh" ? "真材實料，讓產品經得起時間" : "Honest materials, made to stand the test of time"}</h2>
          <p>${state.lang === "zh" ? "從結構、材質到現場安裝條件，我們以累積數十年的製造經驗協助評估。" : "From structural design and materials to installation conditions, decades of experience guide every assessment."}</p>
          ${buttonLink(routeHref("contact"), ui("contactUs"), "light")}
        </div>
      </section>

      <section class="section news-preview">
        <div class="container">
          <div class="heading-row">
            ${sectionHeading(state.lang === "zh" ? "原站內容完整保存" : "LEGACY CONTENT PRESERVED", ui("latestNews"), state.lang === "zh" ? "舊網站發布的 11 篇消息已完整移轉。" : "All 11 news entries published on the legacy website are preserved.")}
            <div class="reveal">${buttonLink(routeHref("news"), ui("latestNews"), "outline")}</div>
          </div>
          <div class="news-list home-news-list">
            ${state.data.news.slice(0, 3).map((article, index) => newsRow(article, index)).join("")}
          </div>
        </div>
      </section>

      ${renderCta()}`;
  }

  function renderAbout() {
    const about = state.data.about;
    setMeta(ui("about"), t(about.lead));
    return `
      ${renderPageHero(state.lang === "zh" ? "半世紀的堅持，持續向前" : "Five decades of progress", ui("about"), "public/assets/legacy/17_u2wr.jpg")}
      <section class="section story-section">
        <div class="container story-grid">
          <div>
            ${sectionHeading(state.lang === "zh" ? "我們的故事" : "OUR STORY", t(about.heading), t(about.lead))}
            <div class="story-copy reveal">${about.paragraphs.map((paragraph) => `<p>${esc(t(paragraph))}</p>`).join("")}</div>
          </div>
          <div class="story-image-stack reveal">
            <img class="story-main" src="public/assets/legacy/18_cjzo.jpg" alt="${state.lang === "zh" ? "好利生工廠" : "Hou Li Sheng factory"}" />
            <img class="story-detail" src="public/assets/legacy/17_u2wr.jpg" alt="${state.lang === "zh" ? "FRP 飼料桶生產基地" : "FRP feed silo production site"}" />
          </div>
        </div>
      </section>
      <section class="section timeline-section">
        <div class="container">
          ${sectionHeading(state.lang === "zh" ? "發展足跡" : "OUR JOURNEY", state.lang === "zh" ? "從在地製造，到服務亞洲市場" : "From local manufacturing to regional service", "", "center")}
          <div class="timeline">
            ${about.milestones.map((item, index) => `<div class="timeline-item reveal" style="--delay:${index * 80}ms"><strong>${esc(item.year)}</strong><span></span><p>${esc(t(item.text))}</p></div>`).join("")}
          </div>
        </div>
      </section>
      <section class="section principles-section">
        <div class="container principles-grid">
          ${[
            ["01", state.lang === "zh" ? "真材實料" : "Honest materials", state.lang === "zh" ? "以合適材料與結構回應使用環境。" : "Materials and structures selected for the actual environment."],
            ["02", state.lang === "zh" ? "經驗落地" : "Applied experience", state.lang === "zh" ? "把數十年製造經驗轉化成可執行方案。" : "Decades of manufacturing knowledge turned into practical solutions."],
            ["03", state.lang === "zh" ? "彈性客製" : "Flexible customization", state.lang === "zh" ? "依尺寸、容量與現場條件討論製作。" : "Dimensions, capacity and site conditions can all be discussed."],
          ].map(([number, title, text], index) => `<article class="principle reveal" style="--delay:${index * 70}ms"><span>${number}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("")}
        </div>
      </section>
      ${renderCta()}`;
  }

  function renderPageHero(kicker, title, image) {
    return `
      <section class="page-hero" style="--page-image:url('${esc(image)}')">
        <div class="container page-hero-content">
          <p>${esc(kicker)}</p>
          <h1>${esc(title)}</h1>
          <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${routeHref("home")}">${esc(ui("home"))}</a><span>/</span><strong>${esc(title)}</strong></nav>
        </div>
      </section>`;
  }

  function renderProducts() {
    setMeta(ui("products"), state.lang === "zh" ? "完整瀏覽好利生 FRP 養殖、污水處理、儲存與衛浴設備。" : "Browse Hou Li Sheng FRP farming, wastewater, storage and sanitation equipment.");
    return `
      ${renderPageHero(state.lang === "zh" ? "耐蝕・輕量・耐用・可客製" : "CORROSION RESISTANT · LIGHTWEIGHT · CUSTOM", ui("products"), "public/assets/legacy/10_9kto.jpg")}
      <section class="section product-index-intro">
        <div class="container">
          ${sectionHeading(state.lang === "zh" ? "完整產品系列" : "FULL PRODUCT RANGE", state.lang === "zh" ? "為不同產業環境打造合適的 FRP 設備" : "FRP equipment for diverse industrial environments", state.lang === "zh" ? "所有舊站有效產品頁與原始實拍圖片均已移轉至此。" : "Every valid legacy product page and original product image has been migrated here.", "center")}
          <div class="product-jump reveal">
            ${state.data.categories.map((category) => `<a href="#category-${esc(category.id)}">${esc(t(category.name))}</a>`).join("")}
          </div>
        </div>
      </section>
      ${state.data.categories.map((category, categoryIndex) => {
        const products = category.products.map(productById);
        return `
          <section id="category-${esc(category.id)}" class="section product-category ${categoryIndex % 2 ? "section-tint" : ""}">
            <div class="container">
              <div class="category-heading reveal">
                <span>0${categoryIndex + 1}</span>
                <div><p class="eyebrow">${esc(t(category.name))}</p><h2>${esc(t(category.description))}</h2></div>
              </div>
              <div class="product-grid">${products.map(productCard).join("")}</div>
            </div>
          </section>`;
      }).join("")}
      ${renderCta()}`;
  }

  function renderProductDetail(product) {
    const category = categoryById(product.category);
    setMeta(t(product.name), t(product.summary));
    return `
      <section class="product-detail-hero">
        <div class="container product-hero-grid">
          <div class="product-hero-copy">
            <nav class="breadcrumbs dark" aria-label="Breadcrumb"><a href="${routeHref("home")}">${esc(ui("home"))}</a><span>/</span><a href="${routeHref("products")}">${esc(ui("products"))}</a><span>/</span><strong>${esc(t(product.name))}</strong></nav>
            <p class="eyebrow">${esc(t(category.name))}</p>
            <h1>${esc(t(product.name))}</h1>
            <p>${esc(t(product.summary))}</p>
            ${buttonLink(routeHref("contact"), ui("contactUs"))}
          </div>
          <button class="product-hero-image gallery-trigger reveal" type="button" data-image="${esc(product.images[0])}" data-caption="${esc(t(product.name))}">
            <img src="${esc(product.images[0])}" alt="${esc(t(product.name))}" />
            <span>${state.lang === "zh" ? "放大查看" : "View image"}</span>
          </button>
        </div>
      </section>
      <section class="section product-facts">
        <div class="container facts-grid">
          <article class="fact-block reveal">
            <div class="fact-icon">${icons.layers}</div>
            <p class="eyebrow">${esc(ui("features"))}</p>
            <ul>${product.features.map((feature) => `<li>${icons.check}<span>${esc(t(feature))}</span></li>`).join("")}</ul>
          </article>
          <article class="fact-block reveal">
            <div class="fact-icon">${icons.pin}</div>
            <p class="eyebrow">${esc(ui("applications"))}</p>
            <p>${esc(t(product.applications))}</p>
          </article>
          <article class="fact-block reveal">
            <div class="fact-icon">${icons.arrow}</div>
            <p class="eyebrow">${esc(ui("specifications"))}</p>
            <p>${esc(t(product.specifications))}</p>
          </article>
        </div>
      </section>
      <section class="section product-gallery-section">
        <div class="container">
          ${sectionHeading(state.lang === "zh" ? "原始產品影像" : "ORIGINAL PRODUCT IMAGERY", ui("gallery"), state.lang === "zh" ? "以下圖片完整保留自公司舊網站。" : "The images below are preserved from the legacy company website.")}
          <div class="detail-gallery ${product.images.length === 1 ? "single" : ""}">
            ${product.images.map((image, index) => `<button class="gallery-trigger reveal" type="button" data-image="${esc(image)}" data-caption="${esc(t(product.name))} ${index + 1}"><img src="${esc(image)}" alt="${esc(t(product.name))} ${index + 1}" loading="lazy" /><span>${assetLabel(image)}</span></button>`).join("")}
          </div>
          ${product.specImages?.length ? `
            <div class="spec-images">
              <h2 class="reveal">${esc(ui("specifications"))}</h2>
              ${product.specImages.map((image) => `<button class="gallery-trigger spec-card reveal" type="button" data-image="${esc(image)}" data-caption="${esc(t(product.name))} ${esc(ui("specifications"))}"><img src="${esc(image)}" alt="${esc(t(product.name))} ${esc(ui("specifications"))}" loading="lazy" /></button>`).join("")}
            </div>` : ""}
          <div class="back-link reveal"><a href="${routeHref("products")}">← ${esc(ui("backProducts"))}</a></div>
        </div>
      </section>
      ${renderCta()}`;
  }

  function newsRow(article, index = 0) {
    const [year, month, day] = article.date.split("-");
    return `
      <article class="news-row reveal" style="--delay:${index * 60}ms">
        <a href="${routeHref(`news/${article.id}`)}">
          <time datetime="${esc(article.date)}"><strong>${esc(day)}</strong><span>${esc(month)} / ${esc(year)}</span></time>
          <div><p>${esc(ui("originalArchive"))}</p><h3>${esc(t(article.title))}</h3><span>${esc(t(article.summary))}</span></div>
          <i>${icons.arrow}</i>
        </a>
      </article>`;
  }

  function renderNews() {
    setMeta(ui("news"), state.lang === "zh" ? "好利生舊網站歷史消息完整封存。" : "Complete archive of news from the legacy Hou Li Sheng website.");
    return `
      ${renderPageHero(state.lang === "zh" ? "完整保留舊站發布內容" : "LEGACY CONTENT, FULLY PRESERVED", ui("news"), "public/assets/legacy/54_drpf.jpg")}
      <section class="section news-index">
        <div class="container news-layout">
          <aside class="archive-aside reveal">
            <p class="eyebrow">2016 ARCHIVE</p>
            <h2>${state.lang === "zh" ? "歷史消息封存" : "Historical news archive"}</h2>
            <p>${state.lang === "zh" ? "此區完整保留舊網站中 11 篇可存取的歷史內容，日期與來源依原站標示。" : "This section preserves all 11 accessible legacy articles. Dates and sources follow the original site."}</p>
            <strong>11</strong><span>${state.lang === "zh" ? "篇已移轉消息" : "migrated articles"}</span>
          </aside>
          <div class="news-list">${state.data.news.map(newsRow).join("")}</div>
        </div>
      </section>`;
  }

  function renderArticle(article) {
    setMeta(t(article.title), t(article.summary));
    const headingIndexes = new Set([1, 9, 15]);
    return `
      <article class="article-page">
        <header class="article-header">
          <div class="container article-header-inner">
            <nav class="breadcrumbs dark" aria-label="Breadcrumb"><a href="${routeHref("home")}">${esc(ui("home"))}</a><span>/</span><a href="${routeHref("news")}">${esc(ui("news"))}</a></nav>
            <p class="eyebrow">${esc(ui("originalArchive"))}</p>
            <h1>${esc(t(article.title))}</h1>
            <div class="article-meta"><span>${icons.clock}${esc(article.date)}</span><span>${esc(ui("source"))}：${esc(t(article.source))}</span><span>${esc(article.author)}</span></div>
          </div>
        </header>
        <div class="container article-layout">
          <div class="article-body">
            <p class="article-lead">${esc(t(article.summary))}</p>
            ${article.body.map((paragraph, index) => headingIndexes.has(index) && article.id === 21 ? `<h2>${esc(t(paragraph))}</h2>` : `<p>${esc(t(paragraph))}</p>`).join("")}
            <div class="archive-note">${state.lang === "zh" ? "此篇內容、日期與來源依公司舊網站原樣封存。" : "Content, date and source are preserved from the legacy company website."}</div>
            <a class="article-back" href="${routeHref("news")}">← ${esc(ui("backNews"))}</a>
          </div>
          <aside class="article-side">
            <p class="eyebrow">${esc(ui("latestNews"))}</p>
            ${state.data.news.filter((item) => item.id !== article.id).slice(0, 4).map((item) => `<a href="${routeHref(`news/${item.id}`)}"><time>${esc(item.date)}</time><strong>${esc(t(item.title))}</strong></a>`).join("")}
          </aside>
        </div>
      </article>`;
  }

  function renderContact() {
    const company = state.data.company;
    setMeta(ui("contact"), `${t(company.address)} · ${company.phone}`);
    return `
      ${renderPageHero(state.lang === "zh" ? "從需求開始，一起找到合適做法" : "LET'S BUILD THE RIGHT SOLUTION", ui("contact"), "public/assets/legacy/17_u2wr.jpg")}
      <section class="section contact-intro">
        <div class="container contact-intro-grid">
          <div>
            ${sectionHeading(state.lang === "zh" ? "聯絡總公司" : "CONTACT HEADQUARTERS", state.lang === "zh" ? "告訴我們你的尺寸、容量與使用環境" : "Tell us your dimensions, capacity and operating environment", state.lang === "zh" ? "若尚未確定規格也沒關係，我們可以從現場條件開始討論。" : "If specifications are not yet final, we can begin with your site conditions.")}
            <div class="quick-contact reveal">
              <a href="tel:${esc(company.phone)}">${icons.phone}<span><small>${esc(ui("callUs"))}</small><strong>${esc(company.phone)}</strong></span></a>
              <a href="mailto:${esc(company.email)}">${icons.mail}<span><small>${esc(ui("emailUs"))}</small><strong>${esc(company.email)}</strong></span></a>
            </div>
          </div>
          <form id="inquiry-form" class="inquiry-form reveal">
            <div class="form-row"><label>${esc(ui("name"))}<input name="name" autocomplete="name" required /></label><label>${esc(ui("email"))}<input type="email" name="email" autocomplete="email" required /></label></div>
            <label>${esc(ui("phone"))}<input name="phone" autocomplete="tel" /></label>
            <label>${esc(ui("message"))}<textarea name="message" rows="5" required></textarea></label>
            <button class="button button-primary" type="submit"><span>${esc(ui("submit"))}</span>${icons.arrow}</button>
            <p class="form-hint">${state.lang === "zh" ? "目前使用電子郵件送出；日後可直接串接 Supabase 詢價資料表。" : "Currently submitted by email; ready to connect to a Supabase inquiry table later."}</p>
          </form>
        </div>
      </section>
      <section class="section locations-section">
        <div class="container">
          ${sectionHeading(state.lang === "zh" ? "區域服務據點" : "REGIONAL LOCATIONS", state.lang === "zh" ? "台灣、泰國與廈門聯絡資訊" : "Contact details for Taiwan, Thailand and Xiamen", "", "center")}
          <div class="location-grid">
            ${state.data.contacts.map((contact, index) => `
              <article class="location-card reveal" style="--delay:${index * 70}ms">
                <div class="location-image"><img src="${esc(contact.image)}" alt="${esc(t(contact.region))}" loading="lazy" /><span>${esc(t(contact.region))}</span></div>
                <div class="location-content">
                  <h3>${esc(t(contact.company))}</h3>
                  <p>${icons.pin}<span>${esc(t(contact.address))}</span></p>
                  <p>${icons.phone}<a href="tel:${esc(contact.phone)}">${esc(contact.phone)}</a></p>
                  ${contact.fax ? `<p><span class="contact-key">FAX</span><span>${esc(contact.fax)}</span></p>` : ""}
                  <p>${icons.mail}<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
                  ${contact.website ? `<p><span class="contact-key">WEB</span><a href="${esc(contact.website)}" target="_blank" rel="noopener">www.hls.co.th</a></p>` : ""}
                  ${contact.line ? `<p><span class="contact-key">LINE</span><span>${esc(contact.line)}</span></p>` : ""}
                </div>
              </article>`).join("")}
          </div>
        </div>
      </section>
      <section class="map-section">
        <iframe title="${state.lang === "zh" ? "好利生高雄總公司地圖" : "Map to Hou Li Sheng headquarters"}" src="https://maps.google.com/maps?q=%E9%AB%98%E9%9B%84%E5%B8%82%E5%A4%A7%E5%AF%AE%E5%8D%80%E5%A4%A7%E6%9C%89%E4%B8%80%E8%A1%9733%E8%99%9F&t=&z=14&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        <a class="map-card" href="https://maps.google.com/?q=%E9%AB%98%E9%9B%84%E5%B8%82%E5%A4%A7%E5%AF%AE%E5%8D%80%E5%A4%A7%E6%9C%89%E4%B8%80%E8%A1%9733%E8%99%9F" target="_blank" rel="noopener">${icons.pin}<span><small>${state.lang === "zh" ? "台灣總公司" : "TAIWAN HEADQUARTERS"}</small><strong>${esc(t(company.address))}</strong></span></a>
      </section>`;
  }

  function renderCta() {
    const company = state.data.company;
    return `
      <section class="section cta-section">
        <div class="container cta-inner reveal">
          <div><p class="eyebrow">${state.lang === "zh" ? "有一個 FRP 專案？" : "PLANNING AN FRP PROJECT?"}</p><h2>${state.lang === "zh" ? "從現場條件開始聊聊" : "Let's begin with your site requirements"}</h2></div>
          <div class="cta-actions"><a href="tel:${esc(company.phone)}">${icons.phone}<span><small>${esc(ui("callUs"))}</small><strong>${esc(company.phone)}</strong></span></a>${buttonLink(routeHref("contact"), ui("contactUs"), "light")}</div>
        </div>
      </section>`;
  }

  function renderNotFound() {
    setMeta("404", "Page not found");
    return `<section class="not-found"><div><p>404</p><h1>${state.lang === "zh" ? "找不到這個頁面" : "Page not found"}</h1>${buttonLink(routeHref("home"), ui("home"))}</div></section>`;
  }

  function render() {
    const parts = currentRoute();
    let html;
    if (parts[0] === "home") html = renderHome();
    else if (parts[0] === "about") html = renderAbout();
    else if (parts[0] === "products") html = renderProducts();
    else if (parts[0] === "product" && productById(parts[1])) html = renderProductDetail(productById(parts[1]));
    else if (parts[0] === "news" && parts[1]) {
      const article = state.data.news.find((item) => item.id === Number(parts[1]));
      html = article ? renderArticle(article) : renderNotFound();
    } else if (parts[0] === "news") html = renderNews();
    else if (parts[0] === "contact") html = renderContact();
    else html = renderNotFound();

    renderHeader();
    $("#main-content").innerHTML = html;
    renderFooter();
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    document.body.classList.remove("menu-open");
    window.scrollTo({ top: 0, behavior: "instant" });
    initReveals();
  }

  function initReveals() {
    const elements = $$(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px" });
    elements.forEach((element) => observer.observe(element));
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3600);
  }

  document.addEventListener("click", (event) => {
    const languageButton = event.target.closest('[data-action="language"]');
    if (languageButton) {
      state.lang = state.lang === "zh" ? "en" : "zh";
      localStorage.setItem("hls-lang", state.lang);
      render();
      return;
    }

    const menuButton = event.target.closest('[data-action="menu"]');
    if (menuButton) {
      const open = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(open));
      return;
    }

    if (event.target.closest(".main-nav a")) document.body.classList.remove("menu-open");

    const galleryButton = event.target.closest(".gallery-trigger");
    if (galleryButton) {
      const dialog = $("#lightbox");
      const image = $("img", dialog);
      image.src = galleryButton.dataset.image;
      image.alt = galleryButton.dataset.caption || "";
      $("p", dialog).textContent = galleryButton.dataset.caption || "";
      dialog.showModal();
      return;
    }

    if (event.target.closest(".lightbox-close")) $("#lightbox").close();
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "inquiry-form") return;
    event.preventDefault();
    const form = new FormData(event.target);
    if (!form.get("name") || !form.get("email") || !form.get("message")) {
      showToast(ui("required"));
      return;
    }
    const subject = state.lang === "zh" ? `網站詢價｜${form.get("name")}` : `Website inquiry | ${form.get("name")}`;
    const body = [
      `${ui("name")}: ${form.get("name")}`,
      `${ui("email")}: ${form.get("email")}`,
      `${ui("phone")}: ${form.get("phone") || "-"}`,
      "",
      `${ui("message")}:`,
      form.get("message"),
    ].join("\n");
    window.location.href = `mailto:${state.data.company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(ui("mailReady"));
  });

  window.addEventListener("hashchange", render);
  $("#lightbox").addEventListener("click", (event) => {
    if (event.target === $("#lightbox")) $("#lightbox").close();
  });

  HLSContentService.getSiteData()
    .then((data) => {
      state.data = data;
      if (!location.hash) history.replaceState(null, "", routeHref("home"));
      render();
    })
    .catch(() => {
      $("#main-content").innerHTML = "<p class='load-error'>網站內容暫時無法載入，請稍後再試。</p>";
    });
})();
