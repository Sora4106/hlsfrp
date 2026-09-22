(function () {
  "use strict";

  const state = {
    lang: window.HLSLocale.detectLanguage(),
    data: null,
  };
  const now = Date.now();
  let rapidReloadDelay = 0;
  try {
    const lastLoad = Number(sessionStorage.getItem("hls-last-load") || 0);
    const elapsed = now - lastLoad;
    rapidReloadDelay = lastLoad && elapsed < 1800 ? Math.min(1400, 1800 - elapsed) : 0;
    sessionStorage.setItem("hls-last-load", String(now));
  } catch {
    rapidReloadDelay = 0;
  }

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
  const ui = (key) => state.data.ui[state.lang]?.[key] || state.data.ui.en[key] || key;
  const copy = (zh, en, th) => t(window.HLSLocale.localized(zh, en, th));
  const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const routeHref = (path) => `#/${path}`;
  const productById = (id) => state.data.products.find((product) => product.id === id);
  const categoryById = (id) => state.data.categories.find((category) => category.id === id);
  const thumbnailPath = (path) => path.includes("/optimized/") ? path.replace(/\.webp$/i, "-card.webp") : path;

  function requestedSection() {
    const query = location.hash.split("?")[1] || "";
    const section = new URLSearchParams(query).get("section");
    return state.data.categories.some((category) => category.id === section) ? section : "";
  }

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

  function scrollButton(target, label, variant = "outline") {
    return `<button class="button button-${variant}" type="button" data-scroll-target="${target}"><span>${esc(label)}</span>${icons.arrow}</button>`;
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
    const languageOptions = [
      ["zh", "繁中"],
      ["zh-CN", "简中"],
      ["en", "EN"],
      ["th", "ไทย"],
    ];
    const active = currentRoute()[0];
    $("#site-header").innerHTML = `
      <div class="utility-bar">
        <div class="container utility-inner">
          <span>${esc(t(company.eyebrow))}</span>
          <div class="utility-actions">
            <a href="tel:${esc(company.phone)}">${icons.phone}${esc(company.phone)}</a>
            <span class="utility-divider"></span>
            <div class="language-switch" role="group" aria-label="${esc(ui("languageLabel"))}">
              ${languageOptions.map(([code, label]) => `<button type="button" data-language="${code}" class="${state.lang === code ? "active" : ""}" aria-pressed="${state.lang === code}">${label}</button>`).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="nav-shell">
        <div class="container nav-inner">
          <a class="brand" href="${routeHref("home")}" aria-label="${esc(t(company.name))}">
            <span class="brand-mark"><img src="public/assets/optimized/11_n090.webp" alt="" width="259" height="154" /></span>
            <span class="brand-copy">
              <strong>${esc(t(company.name))}</strong>
              <small>${state.lang === "en" || state.lang === "th" ? "FRP DESIGN & MANUFACTURING" : "HOU LI SHENG ENTERPRISE CO., LTD"}</small>
            </span>
          </a>
          <button class="menu-toggle" type="button" data-action="menu" aria-expanded="false" aria-label="${esc(ui("menu"))}">
            <span></span><span></span><span></span>
          </button>
          <nav class="main-nav" aria-label="${copy("主要導覽", "Main navigation", "เมนูหลัก")}">
            ${nav.map(([path, label]) => `<a href="${routeHref(path)}" class="${active === path || (active === "product" && path === "products") ? "active" : ""}">${esc(label)}</a>`).join("")}
            <a class="nav-cta" href="${routeHref("contact")}">${esc(ui("contactUs"))}${icons.arrow}</a>
          </nav>
        </div>
      </div>`;
  }

  function renderFooter() {
    const company = state.data.company;
    const businessNumber = copy("統一編號：90736328", "Taiwan Unified Business No.: 90736328", "เลขประจำตัวผู้เสียภาษีไต้หวัน: 90736328");
    $("#site-footer").innerHTML = `
      <div class="footer-main">
        <div class="container footer-grid">
          <div class="footer-brand">
            <img src="public/assets/optimized/11_n090.webp" alt="" width="259" height="154" loading="lazy" decoding="async" />
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
              <span>${esc(businessNumber)}</span>
              <span>${esc(t(company.address))}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <span>© ${new Date().getFullYear()} ${esc(t(company.name))}</span>
          <a class="footer-privacy" href="${routeHref("privacy")}">${copy("隱私權政策", "Privacy notice", "นโยบายความเป็นส่วนตัว")}</a>
          <span>${copy("台灣設計與製造", "Designed and manufactured in Taiwan", "ออกแบบและผลิตในไต้หวัน")}</span>
        </div>
      </div>`;
  }

  function categoryCard(category, index = 0) {
    return `
      <article class="category-card reveal" style="--delay:${index * 70}ms">
        <a href="${routeHref("products")}" aria-label="${esc(t(category.name))}">
          <div class="category-image"><img src="${esc(thumbnailPath(category.image))}" alt="${esc(t(category.name))}" loading="lazy" decoding="async" /></div>
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
            <img src="${esc(thumbnailPath(image))}" alt="${esc(t(product.name))}" loading="lazy" decoding="async" />
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
    const featured = featuredIds.map(productById).filter(Boolean);
    setMeta(t(company.name), t(company.tagline));
    return `
      <section class="hero home-hero">
        <div class="hero-backdrop"></div>
        <div class="container hero-layout">
          <div class="hero-copy">
            <p class="hero-kicker">${esc(t(company.eyebrow))}</p>
            <h1>${copy("專業複材製造，<br><em>成就長久可靠</em>", "Composite expertise,<br><em>built to endure</em>", "ผู้เชี่ยวชาญวัสดุคอมโพสิต<br><em>เพื่อความทนทานที่ไว้วางใจได้</em>")}</h1>
            <p>${esc(t(company.tagline))}</p>
            <div class="hero-actions">
              ${buttonLink(routeHref("products"), ui("explore"))}
              ${buttonLink(routeHref("contact"), ui("contactUs"), "ghost")}
            </div>
          </div>
          <div class="hero-stamp" aria-label="Since 1975"><span>SINCE</span><strong>1975</strong><small>FRP EXPERTISE</small></div>
        </div>
        <a class="scroll-cue" href="#home-about"><span>${copy("向下探索", "Discover", "เลื่อนลงเพื่อดูเพิ่มเติม")}</span><i></i></a>
      </section>

      <section class="capability-strip">
        <div class="container capability-grid">
          <div><strong>50<sup>+</sup></strong><span>${copy("年製造經驗", "Years of experience", "ปีแห่งประสบการณ์")}</span></div>
          <div><strong>${String(state.data.contacts.length).padStart(2, "0")}</strong><span>${copy("亞洲服務據點", "Asian locations", "จุดบริการในเอเชีย")}</span></div>
          <div><strong>FRP</strong><span>${copy("設計・研發・製造", "Design · R&D · Manufacturing", "ออกแบบ・วิจัย・ผลิต")}</span></div>
        </div>
      </section>

      <section id="home-about" class="section about-preview">
        <div class="container split-layout">
          <div class="about-visual reveal">
            <div class="image-frame"><img src="public/assets/optimized/18_cjzo.webp" alt="${copy("好利生高雄工廠", "Hou Li Sheng factory in Kaohsiung", "โรงงานโฮ่ว ลี่ เซิง ที่เกาสง")}" loading="lazy" decoding="async" /></div>
            <div class="experience-card"><strong>1975</strong><span>${copy("從高雄出發", "Founded in Kaohsiung", "ก่อตั้งที่เกาสง")}</span></div>
          </div>
          <div class="about-copy">
            ${sectionHeading(copy("關於好利生", "ABOUT HOU LI SHENG", "เกี่ยวกับโฮ่ว ลี่ เซิง"), t(about.heading), t(about.lead))}
            <p class="body-copy reveal">${esc(t(about.paragraphs[0]))}</p>
            <div class="mini-values reveal">
              <span>${icons.check}${copy("台灣製造", "Made in Taiwan", "ผลิตในไต้หวัน")}</span>
              <span>${icons.check}${copy("彈性客製", "Custom solutions", "สั่งผลิตได้ยืดหยุ่น")}</span>
              <span>${icons.check}${copy("耐用工藝", "Durable craft", "งานผลิตที่ทนทาน")}</span>
            </div>
            <div class="reveal">${buttonLink(routeHref("about"), ui("learnMore"), "outline")}</div>
          </div>
        </div>
      </section>

      <section class="section category-section">
        <div class="container">
          ${sectionHeading(copy("跨產業解決方案", "INDUSTRY SOLUTIONS", "โซลูชันสำหรับหลายอุตสาหกรรม"), copy("一種材料，回應多種現場需求", "One material, engineered for many environments", "วัสดุหนึ่งชนิด รองรับสภาพงานที่หลากหลาย"), copy("從養殖、污水到特殊儲存與衛浴設備，以 FRP 的耐蝕、輕量與成型彈性，打造適合現場的產品。", "FRP's corrosion resistance, low weight and forming flexibility support farming, wastewater, storage and sanitation applications.", "ด้วยคุณสมบัติทนการกัดกร่อน น้ำหนักเบา และขึ้นรูปได้ยืดหยุ่น FRP จึงเหมาะกับงานปศุสัตว์ บำบัดน้ำเสีย ถังเก็บ และสุขภัณฑ์"))}
          <div class="category-grid">${state.data.categories.map(categoryCard).join("")}</div>
        </div>
      </section>

      <section class="section featured-section">
        <div class="container">
          <div class="heading-row">
            ${sectionHeading(copy("精選產品", "FEATURED PRODUCTS", "ผลิตภัณฑ์แนะนำ"), copy("從需求出發，製作剛好的設備", "Products shaped around real requirements", "ออกแบบอุปกรณ์ให้เหมาะกับความต้องการจริง"))}
            <div class="reveal">${buttonLink(routeHref("products"), ui("allProducts"), "outline")}</div>
          </div>
          <div class="product-grid">${featured.map(productCard).join("")}</div>
        </div>
      </section>

      <section class="section quality-banner">
        <div class="quality-image"></div>
        <div class="container quality-content reveal">
          <p class="eyebrow">${copy("可靠來自每一道細節", "RELIABILITY IN EVERY DETAIL", "ความเชื่อมั่นเริ่มจากทุกรายละเอียด")}</p>
          <h2>${copy("真材實料，讓產品經得起時間", "Honest materials, made to stand the test of time", "วัสดุคุณภาพ เพื่อผลิตภัณฑ์ที่ทนต่อกาลเวลา")}</h2>
          <p>${copy("從結構、材質到現場安裝條件，我們以累積數十年的製造經驗協助評估。", "From structural design and materials to installation conditions, decades of experience guide every assessment.", "ตั้งแต่โครงสร้าง วัสดุ ไปจนถึงเงื่อนไขติดตั้ง เราใช้ประสบการณ์หลายทศวรรษช่วยประเมินทุกโครงการ")}</p>
          ${buttonLink(routeHref("contact"), ui("contactUs"), "light")}
        </div>
      </section>

      <section class="section news-preview">
        <div class="container">
          <div class="heading-row">
            ${sectionHeading(copy("產業知識與動態", "INDUSTRY KNOWLEDGE", "ความรู้และข่าวอุตสาหกรรม"), ui("latestNews"), copy("掌握養殖設備、產業應用與公司相關資訊。", "Explore equipment knowledge, industry applications and company updates.", "ติดตามความรู้ด้านอุปกรณ์ การประยุกต์ใช้ในอุตสาหกรรม และข่าวสารของบริษัท"))}
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
      ${renderPageHero(copy("半世紀的堅持，持續向前", "Five decades of progress", "กว่าครึ่งศตวรรษที่มุ่งมั่นพัฒนา"), ui("about"), "public/assets/optimized/17_u2wr.webp")}
      <section class="section story-section">
        <div class="container story-grid">
          <div>
            ${sectionHeading(copy("我們的故事", "OUR STORY", "เรื่องราวของเรา"), t(about.heading), t(about.lead))}
            <div class="story-copy reveal">${about.paragraphs.map((paragraph) => `<p>${esc(t(paragraph))}</p>`).join("")}</div>
          </div>
          <div class="story-image-stack reveal">
            <img class="story-main" src="public/assets/optimized/18_cjzo.webp" alt="${copy("好利生工廠", "Hou Li Sheng factory", "โรงงานโฮ่ว ลี่ เซิง")}" loading="lazy" decoding="async" />
            <img class="story-detail" src="public/assets/optimized/17_u2wr-card.webp" alt="${copy("FRP 飼料桶生產基地", "FRP feed silo production site", "ฐานการผลิตไซโลอาหารสัตว์ FRP")}" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>
      <section class="section timeline-section">
        <div class="container">
          ${sectionHeading(copy("發展足跡", "OUR JOURNEY", "เส้นทางการเติบโต"), copy("從在地製造，到服務亞洲市場", "From local manufacturing to regional service", "จากการผลิตในท้องถิ่นสู่การบริการตลาดเอเชีย"), "", "center")}
          <div class="timeline">
            ${about.milestones.map((item, index) => `<div class="timeline-item reveal" style="--delay:${index * 80}ms"><strong>${esc(item.year)}</strong><span></span><p>${esc(t(item.text))}</p></div>`).join("")}
          </div>
        </div>
      </section>
      <section class="section principles-section">
        <div class="container principles-grid">
          ${[
            ["01", copy("真材實料", "Honest materials", "วัสดุคุณภาพ"), copy("以合適材料與結構回應使用環境。", "Materials and structures selected for the actual environment.", "เลือกวัสดุและโครงสร้างให้เหมาะกับสภาพใช้งานจริง")],
            ["02", copy("經驗落地", "Applied experience", "ประสบการณ์ที่ใช้งานได้จริง"), copy("把數十年製造經驗轉化成可執行方案。", "Decades of manufacturing knowledge turned into practical solutions.", "เปลี่ยนประสบการณ์หลายทศวรรษให้เป็นโซลูชันที่นำไปใช้ได้")],
            ["03", copy("彈性客製", "Flexible customization", "การสั่งผลิตที่ยืดหยุ่น"), copy("依尺寸、容量與現場條件討論製作。", "Dimensions, capacity and site conditions can all be discussed.", "ปรับขนาด ความจุ และรายละเอียดตามสภาพพื้นที่")],
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
    setMeta(ui("products"), copy("瀏覽好利生 FRP 養殖、污水處理、儲存與衛浴設備。", "Browse Hou Li Sheng FRP farming, wastewater, storage and sanitation equipment.", "ดูอุปกรณ์ FRP สำหรับปศุสัตว์ บำบัดน้ำเสีย ถังเก็บ และสุขภัณฑ์ของโฮ่ว ลี่ เซิง"));
    return `
      ${renderPageHero(copy("耐蝕・輕量・耐用・可客製", "CORROSION RESISTANT · LIGHTWEIGHT · CUSTOM", "ทนการกัดกร่อน・น้ำหนักเบา・ทนทาน・สั่งผลิตได้"), ui("products"), "public/assets/optimized/10_9kto.webp")}
      <section class="section product-index-intro">
        <div class="container">
          ${sectionHeading(copy("完整產品系列", "FULL PRODUCT RANGE", "กลุ่มผลิตภัณฑ์ครบถ้วน"), copy("為不同產業環境打造合適的 FRP 設備", "FRP equipment for diverse industrial environments", "อุปกรณ์ FRP สำหรับสภาพแวดล้อมอุตสาหกรรมที่หลากหลาย"), copy("依照用途、容量與現場條件，選擇適合的產品與客製方案。", "Choose suitable products and custom options by use, capacity and site conditions.", "เลือกผลิตภัณฑ์และการสั่งทำตามการใช้งาน ความจุ และสภาพพื้นที่"), "center")}
          <div class="product-jump reveal">
            ${state.data.categories.map((category) => `<button type="button" data-product-section="${esc(category.id)}">${esc(t(category.name))}</button>`).join("")}
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
            <div class="product-detail-actions">
              ${buttonLink(routeHref("contact"), ui("contactUs"))}
              ${scrollButton("product-results", ui("gallery"))}
              ${scrollButton("product-specifications", ui("specifications"))}
            </div>
          </div>
          <button class="product-hero-image gallery-trigger reveal" type="button" data-image="${esc(product.images[0])}" aria-label="${copy("放大圖片", "Enlarge image", "ขยายภาพ")}">
            <img src="${esc(product.images[0])}" alt="${esc(t(product.name))}" decoding="async" />
            <span>${copy("放大查看", "View image", "ขยายภาพ")}</span>
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
        </div>
      </section>
      <section id="product-results" class="section product-gallery-section">
        <div class="container">
          ${sectionHeading(copy("實際產品與應用", "PRODUCTS IN USE", "ผลิตภัณฑ์และการใช้งานจริง"), ui("gallery"), copy("點擊圖片即可查看較大的產品影像。", "Select an image to view a larger version.", "คลิกภาพเพื่อดูผลิตภัณฑ์ในขนาดใหญ่ขึ้น"))}
          <div class="detail-gallery ${product.images.length === 1 ? "single" : ""}">
            ${product.images.map((image, index) => `<button class="gallery-trigger reveal" type="button" data-image="${esc(image)}" aria-label="${copy("放大圖片", "Enlarge image", "ขยายภาพ")} ${index + 1}"><img src="${esc(thumbnailPath(image))}" alt="${esc(t(product.name))} ${index + 1}" loading="lazy" decoding="async" /></button>`).join("")}
          </div>
        </div>
      </section>
      <section id="product-specifications" class="section product-specification-section">
        <div class="container">
          ${sectionHeading(copy("產品資料", "PRODUCT DATA", "ข้อมูลผลิตภัณฑ์"), ui("specifications"), t(product.specifications))}
          ${product.specImages?.length ? `
            <div class="spec-images">
              ${product.specImages.map((image, index) => `<button class="gallery-trigger spec-card reveal" type="button" data-image="${esc(image)}" aria-label="${copy("放大規格圖片", "Enlarge specification image", "ขยายภาพข้อมูลจำเพาะ")} ${index + 1}"><img src="${esc(thumbnailPath(image))}" alt="${esc(t(product.name))} ${esc(ui("specifications"))}" loading="lazy" decoding="async" /></button>`).join("")}
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
    setMeta(ui("news"), copy("好利生產業知識、設備應用與相關消息。", "Hou Li Sheng industry knowledge, equipment applications and news.", "ความรู้ในอุตสาหกรรม การใช้อุปกรณ์ และข่าวสารจากโฮ่ว ลี่ เซิง"));
    return `
      ${renderPageHero(copy("產業觀察與技術資訊", "INDUSTRY INSIGHTS", "ข้อมูลเชิงลึกและเทคโนโลยีอุตสาหกรรม"), ui("news"), "public/assets/optimized/54_drpf.webp")}
      <section class="section news-index">
        <div class="container news-layout">
          <aside class="archive-aside reveal">
            <p class="eyebrow">NEWS & INSIGHTS</p>
            <h2>${copy("產業消息整理", "Industry news", "ข่าวสารอุตสาหกรรม")}</h2>
            <p>${copy("彙整養殖設備、管理效率與相關產業應用資訊。", "Information on livestock equipment, operating efficiency and related industry applications.", "รวบรวมข้อมูลด้านอุปกรณ์ปศุสัตว์ ประสิทธิภาพการจัดการ และการประยุกต์ใช้ในอุตสาหกรรม")}</p>
            <strong>11</strong><span>${copy("篇產業資訊", "industry articles", "บทความอุตสาหกรรม")}</span>
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
      ${renderPageHero(copy("從需求開始，一起找到合適做法", "LET'S BUILD THE RIGHT SOLUTION", "เริ่มจากความต้องการ เพื่อหาโซลูชันที่เหมาะสม"), ui("contact"), "public/assets/optimized/17_u2wr.webp")}
      <section class="section contact-intro">
        <div class="container contact-intro-grid">
          <div class="contact-summary">
            ${sectionHeading(copy("聯絡總公司", "CONTACT HEADQUARTERS", "ติดต่อสำนักงานใหญ่"), copy("請以電子郵件直接與我們聯繫", "Please contact us directly by email", "โปรดติดต่อเราโดยตรงทางอีเมล"), copy("本站不設線上填寫表單；你可依需求自行撰寫郵件，寄給我們的官方信箱。", "This website has no online enquiry form. Write your message in your own email app and send it to our official mailbox.", "เว็บไซต์นี้ไม่มีแบบฟอร์มสอบถามออนไลน์ โปรดเขียนข้อความด้วยโปรแกรมอีเมลของคุณและส่งมายังอีเมลทางการของเรา"))}
            <div class="quick-contact reveal">
              <a href="mailto:${esc(company.email)}">${icons.mail}<span><small>${esc(ui("emailUs"))}</small><strong>${esc(company.email)}</strong></span></a>
            </div>
          </div>
          <aside class="email-contact-card reveal" aria-label="${copy("電子郵件聯絡方式", "Email contact method", "วิธีติดต่อทางอีเมล")}">
            <p class="eyebrow">${copy("資料最小化", "DATA MINIMISATION", "เก็บข้อมูลเท่าที่จำเป็น")}</p>
            <h2>${copy("由你決定要提供的內容", "You decide what to share", "คุณเป็นผู้ตัดสินใจว่าจะแชร์ข้อมูลใด")}</h2>
            <p>${copy("點選下方按鈕會開啟你的電子郵件程式。只有在你自行按下寄送後，郵件內容才會送達本公司；網站不會預先蒐集、暫存或寫入你的姓名、信箱、電話與需求資料。", "The button below opens your own email app. Only after you choose to send will your message reach us; this website does not pre-collect, temporarily store or write your name, email, phone number or enquiry details.", "ปุ่มด้านล่างจะเปิดโปรแกรมอีเมลของคุณ ข้อความจะส่งถึงเราเมื่อคุณเลือกส่งเองเท่านั้น เว็บไซต์นี้จะไม่เก็บ รอจัดเก็บ หรือบันทึกชื่อ อีเมล โทรศัพท์ หรือรายละเอียดคำถามของคุณล่วงหน้า")}</p>
            <a class="button button-primary" href="mailto:${esc(company.email)}"><span>${copy("開啟電子郵件", "Open your email app", "เปิดโปรแกรมอีเมล")}</span>${icons.mail}</a>
            <ul class="email-contact-notes">
              <li>${copy("請勿在信中提供身分證字號、金融帳號、密碼或其他敏感資訊。", "Do not include ID numbers, bank details, passwords or other sensitive information in your email.", "โปรดอย่าส่งเลขบัตรประจำตัว ข้อมูลธนาคาร รหัสผ่าน หรือข้อมูลอ่อนไหวอื่น ๆ ทางอีเมล")}</li>
              <li>${copy("若你選擇寄信，請先閱讀下方的隱私權政策。", "If you choose to email us, please read the privacy notice below first.", "หากคุณเลือกส่งอีเมล โปรดอ่านนโยบายความเป็นส่วนตัวด้านล่างก่อน")}</li>
            </ul>
            <a class="text-link privacy-inline-link" href="${routeHref("privacy")}">${copy("閱讀隱私權政策", "Read the privacy notice", "อ่านนโยบายความเป็นส่วนตัว")}${icons.arrow}</a>
          </aside>
        </div>
      </section>
      <section class="section locations-section">
        <div class="container">
          ${sectionHeading(copy("區域服務據點", "REGIONAL LOCATIONS", "จุดบริการในภูมิภาค"), copy("台灣與泰國聯絡資訊", "Contact details for Taiwan and Thailand", "ข้อมูลติดต่อในไต้หวันและไทย"), "", "center")}
          <div class="location-grid">
            ${state.data.contacts.map((contact, index) => `
              <article class="location-card reveal" style="--delay:${index * 70}ms">
                <div class="location-image"><img src="${esc(thumbnailPath(contact.image))}" alt="${esc(t(contact.region))}" loading="lazy" decoding="async" /><span>${esc(t(contact.region))}</span></div>
                <div class="location-content">
                  <h3>${esc(t(contact.company))}</h3>
                  <dl class="contact-details">
                    <div><dt>${esc(ui("address"))}</dt><dd>${esc(t(contact.address))}</dd></div>
                    <div><dt>${esc(ui("phone"))}</dt><dd><a href="tel:${esc(contact.phone)}">${esc(contact.phone)}</a></dd></div>
                    ${contact.fax ? `<div><dt>${esc(ui("fax"))}</dt><dd>${esc(contact.fax)}</dd></div>` : ""}
                    <div><dt>${esc(ui("email"))}</dt><dd><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></dd></div>
                    ${contact.website ? `<div><dt>${esc(ui("website"))}</dt><dd><a href="${esc(contact.website)}" target="_blank" rel="noopener noreferrer">www.hls.co.th</a></dd></div>` : ""}
                    ${contact.line ? `<div><dt>${esc(ui("line"))}</dt><dd>${esc(contact.line)}</dd></div>` : ""}
                  </dl>
                </div>
              </article>`).join("")}
          </div>
        </div>
      </section>
      <section class="map-section">
        <iframe title="${copy("好利生高雄總公司地圖", "Map to Hou Li Sheng headquarters", "แผนที่สำนักงานใหญ่โฮ่ว ลี่ เซิง ที่เกาสง")}" src="https://www.openstreetmap.org/export/embed.html?bbox=120.4103342%2C22.582475%2C120.4403342%2C22.594475&amp;layer=mapnik&amp;marker=22.588475%2C120.4253342" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
        <a class="map-card" href="https://maps.google.com/?q=%E9%AB%98%E9%9B%84%E5%B8%82%E5%A4%A7%E5%AF%AE%E5%8D%80%E5%A4%A7%E6%9C%89%E4%B8%80%E8%A1%9733%E8%99%9F" target="_blank" rel="noopener noreferrer">${icons.pin}<span><small>${copy("台灣總公司", "TAIWAN HEADQUARTERS", "สำนักงานใหญ่ไต้หวัน")}</small><strong>${esc(t(company.address))}</strong></span></a>
      </section>`;
  }

  function renderPrivacy() {
    const company = state.data.company;
    const email = `<a href="mailto:${esc(company.email)}">${esc(company.email)}</a>`;
    const businessNumber = copy("統一編號：90736328", "Taiwan Unified Business No.: 90736328", "เลขประจำตัวผู้เสียภาษีไต้หวัน: 90736328");
    setMeta(copy("隱私權政策", "Privacy notice", "นโยบายความเป็นส่วนตัว"), copy("好利生實業網站的個人資料與電子郵件處理說明。", "How Hou Li Sheng handles personal data and email enquiries.", "คำอธิบายการจัดการข้อมูลส่วนบุคคลและอีเมลของเว็บไซต์โฮ่ว ลี่ เซิง"));
    return `
      ${renderPageHero(copy("隱私權政策", "PRIVACY NOTICE", "นโยบายความเป็นส่วนตัว"), copy("隱私權政策", "Privacy notice", "นโยบายความเป็นส่วนตัว"), "public/assets/optimized/17_u2wr.webp")}
      <section class="section privacy-section">
        <div class="container privacy-layout">
          <article class="privacy-card">
            <div class="privacy-intro">
              <p class="eyebrow">${copy("生效日期：2026 年 9 月 22 日", "EFFECTIVE: 22 SEPTEMBER 2026", "มีผลบังคับใช้: 22 กันยายน 2026")}</p>
              <h1>${copy("我們只在必要範圍內處理資訊", "We process information only when needed", "เราใช้ข้อมูลเท่าที่จำเป็น")}</h1>
              <p>${copy("本政策適用於好利生實業股份有限公司網站與官方電子郵件聯絡方式。網站不提供會員、電子報訂閱或線上詢問表單。", "This notice applies to the website and official email contact methods of Hou Li Sheng Enterprise Co., Ltd. The website does not offer accounts, newsletter subscriptions or an online enquiry form.", "นโยบายนี้ใช้กับเว็บไซต์และช่องทางอีเมลทางการของบริษัท โฮ่ว ลี่ เซิง เอ็นเตอร์ไพรส์ จำกัด เว็บไซต์ไม่มีบัญชีผู้ใช้ การสมัครรับข่าวสาร หรือแบบฟอร์มสอบถามออนไลน์")}</p>
            </div>

            <section class="privacy-item">
              <h2>${copy("1. 資料控制者與聯絡方式", "1. Who is responsible", "1. ผู้รับผิดชอบข้อมูล")}</h2>
              <p>${esc(t(company.name))}；${esc(businessNumber)}；${esc(t(company.address))}。${copy("如有隱私權、查詢、更正或刪除資料的需求，請來信", "For privacy questions or requests to access, correct or delete your data, email", "หากมีคำถามด้านความเป็นส่วนตัว หรือต้องการขอเข้าถึง แก้ไข หรือลบข้อมูล โปรดส่งอีเมลถึง")} ${email}。</p>
            </section>

            <section class="privacy-item">
              <h2>${copy("2. 網站不蒐集線上詢問資料", "2. No online enquiry collection", "2. ไม่มีการเก็บข้อมูลผ่านแบบสอบถามออนไลน์")}</h2>
              <p>${copy("本站已移除姓名、電子信箱、電話與需求說明的填寫欄位，也不會將這類資料寫入網站資料庫。請使用你自己的電子郵件程式，自行決定是否及提供哪些內容給我們。", "We have removed fields for name, email, phone and enquiry details, and this website does not write those details to a website database. Use your own email app and decide whether, and what, to share with us.", "เราได้ลบช่องกรอกชื่อ อีเมล โทรศัพท์ และรายละเอียดคำถามแล้ว และเว็บไซต์นี้จะไม่บันทึกข้อมูลดังกล่าวลงฐานข้อมูล โปรดใช้โปรแกรมอีเมลของคุณเองและตัดสินใจว่าจะแชร์ข้อมูลใดกับเรา")}</p>
            </section>

            <section class="privacy-item">
              <h2>${copy("3. 當你自行寄送電子郵件時", "3. If you choose to email us", "3. เมื่อคุณเลือกส่งอีเมลถึงเรา")}</h2>
              <p>${copy("我們會處理你主動提供的姓名、公司、電子信箱、電話、郵件內容與附件，僅用於回覆、評估合作或報價需求、後續聯繫及必要的客戶服務。除非另行取得同意，我們不會將詢問內容用於電子報或其他行銷。", "We process the name, company, email address, phone number, message and attachments you voluntarily provide only to reply, assess a potential project or quotation, follow up, and provide necessary customer service. We will not use enquiry content for newsletters or other marketing unless we obtain separate consent.", "เราจะใช้ชื่อ บริษัท อีเมล โทรศัพท์ ข้อความ และไฟล์แนบที่คุณให้โดยสมัครใจเท่านั้น เพื่อการตอบกลับ ประเมินโครงการหรือใบเสนอราคา ติดตามงาน และให้บริการลูกค้าที่จำเป็น เราจะไม่นำข้อมูลคำถามไปใช้ส่งข่าวสารหรือการตลาดอื่น เว้นแต่ได้รับความยินยอมแยกต่างหาก")}</p>
            </section>

            <section class="privacy-item">
              <h2>${copy("4. 使用期間、對象與跨境傳輸", "4. Retention, recipients and cross-border handling", "4. ระยะเวลา ผู้รับข้อมูล และการส่งข้อมูลข้ามประเทศ")}</h2>
              <p>${copy("電子郵件往來原則上於詢問或專案結束後最長保留兩年；如有進行中的交易、爭議或法令保存義務，則保留至該事項結束或法定期限屆滿。資料僅會由需要處理該詢問的公司人員，以及你指定或適當的台灣／泰國服務據點處理。若你寄信至泰國據點，資料可能在台灣與泰國之間傳遞，以便回覆你的需求。", "Email correspondence is normally retained for no more than two years after an enquiry or project closes. It may be retained longer for an active transaction, dispute, or legal retention obligation. Information is handled only by staff who need it and by the appropriate Taiwan or Thailand service location you choose or that is needed to respond. If you email the Thailand office, information may be shared between Taiwan and Thailand to answer your enquiry.", "โดยปกติจะเก็บอีเมลไว้ไม่เกินสองปีหลังปิดคำถามหรือโครงการ แต่อาจเก็บนานขึ้นหากมีธุรกรรม ข้อพิพาท หรือหน้าที่ตามกฎหมาย ข้อมูลจะเข้าถึงได้เฉพาะพนักงานที่จำเป็นและสำนักงานบริการในไต้หวันหรือไทยที่คุณเลือกหรือจำเป็นต่อการตอบกลับ หากคุณส่งอีเมลถึงสำนักงานไทย ข้อมูลอาจส่งต่อระหว่างไต้หวันและไทยเพื่อให้ตอบคำถามได้")}</p>
            </section>

            <section class="privacy-item">
              <h2>${copy("5. 網站技術資訊與第三方服務", "5. Website technology and third parties", "5. เทคโนโลยีเว็บไซต์และบุคคลที่สาม")}</h2>
              <p>${copy("網站不使用廣告 Cookie、第三方廣告追蹤或訪客人次追蹤。瀏覽器僅會在你的裝置儲存語言選擇與歡迎畫面狀態，這些偏好不會傳送給我們。網站由 GitHub Pages 提供靜態託管，公開內容與圖片使用 Supabase 傳遞；這些服務可能依其自身政策處理必要的連線技術資料。聯絡頁的 OpenStreetMap 地圖嵌入，會使瀏覽器連線至該地圖服務。", "The website does not use advertising cookies, third-party advertising trackers, or visitor-count tracking. Your browser stores only your language choice and welcome-screen state on your device; these preferences are not sent to us. GitHub Pages hosts the static site and Supabase delivers published content and images; those services may process necessary connection data under their own policies. The embedded OpenStreetMap map on the contact page connects your browser to that map service.", "เว็บไซต์ไม่ใช้คุกกี้โฆษณา เครื่องมือติดตามโฆษณาจากบุคคลที่สาม หรือการนับผู้เข้าชม เบราว์เซอร์จะเก็บเฉพาะภาษาและสถานะหน้าต้อนรับไว้ในอุปกรณ์ของคุณ และจะไม่ส่งการตั้งค่าเหล่านี้ให้เรา GitHub Pages ใช้โฮสต์เว็บไซต์แบบสถิต และ Supabase ใช้ส่งเนื้อหาและรูปภาพที่เผยแพร่ ซึ่งอาจประมวลผลข้อมูลการเชื่อมต่อที่จำเป็นตามนโยบายของตนเอง แผนที่ OpenStreetMap ที่ฝังในหน้าติดต่อจะเชื่อมต่อเบราว์เซอร์ของคุณกับบริการแผนที่นั้น")}</p>
            </section>

            <section class="privacy-item">
              <h2>${copy("6. 你的權利與安全措施", "6. Your rights and security", "6. สิทธิและความปลอดภัยของคุณ")}</h2>
              <p>${copy("你可透過上述官方信箱申請查詢、閱覽、取得副本、補充或更正、停止蒐集／處理／利用，以及刪除個人資料。我們會在合理期間內依適用法令處理。公司會以權限控管與必要的管理措施，限制電子郵件詢問資料僅由授權人員存取。", "You may use the official email above to request access, review, a copy, correction, cessation of collection, processing or use, or deletion of personal data. We will handle requests within a reasonable period in accordance with applicable law. Access to email enquiry information is limited to authorized personnel through access controls and necessary administrative measures.", "คุณสามารถใช้อีเมลทางการข้างต้นเพื่อขอเข้าถึง ตรวจสอบ ขอสำเนา แก้ไข ระงับการเก็บ ใช้ หรือประมวลผล และลบข้อมูลส่วนบุคคล เราจะดำเนินการภายในระยะเวลาที่เหมาะสมตามกฎหมายที่ใช้บังคับ การเข้าถึงข้อมูลคำถามทางอีเมลจำกัดเฉพาะบุคลากรที่ได้รับอนุญาตด้วยการควบคุมสิทธิ์และมาตรการจัดการที่จำเป็น")}</p>
            </section>

            <section class="privacy-item">
              <h2>${copy("7. 政策更新", "7. Updates to this notice", "7. การปรับปรุงนโยบาย")}</h2>
              <p>${copy("若服務方式、資料處理或法令有重大變動，我們會在本頁更新內容與生效日期。", "If our services, data handling or applicable law changes materially, we will update this page and its effective date.", "หากบริการ วิธีใช้ข้อมูล หรือกฎหมายที่ใช้บังคับเปลี่ยนแปลงอย่างมีนัยสำคัญ เราจะปรับปรุงหน้านี้และวันที่มีผลบังคับใช้")}</p>
            </section>
          </article>
        </div>
      </section>`;
  }

  function renderCta() {
    const company = state.data.company;
    return `
      <section class="section cta-section">
        <div class="container cta-inner reveal">
          <div><p class="eyebrow">${copy("有一個 FRP 專案？", "PLANNING AN FRP PROJECT?", "กำลังวางแผนโครงการ FRP?")}</p><h2>${copy("從現場條件開始聊聊", "Let's begin with your site requirements", "เริ่มพูดคุยจากเงื่อนไขหน้างานของคุณ")}</h2></div>
          <div class="cta-actions"><a href="tel:${esc(company.phone)}">${icons.phone}<span><small>${esc(ui("callUs"))}</small><strong>${esc(company.phone)}</strong></span></a>${buttonLink(routeHref("contact"), ui("contactUs"), "light")}</div>
        </div>
      </section>`;
  }

  function renderNotFound() {
    setMeta("404", "Page not found");
    return `<section class="not-found"><div><p>404</p><h1>${copy("找不到這個頁面", "Page not found", "ไม่พบหน้านี้")}</h1>${buttonLink(routeHref("home"), ui("home"))}</div></section>`;
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
    else if (parts[0] === "privacy") html = renderPrivacy();
    else html = renderNotFound();

    renderHeader();
    $("#main-content").innerHTML = html;
    renderFooter();
    document.documentElement.lang = window.HLSLocale.languageTags[state.lang];
    document.body.classList.remove("menu-open");
    initReveals();
    const section = parts[0] === "products" ? requestedSection() : "";
    if (section) {
      requestAnimationFrame(() => {
        document.getElementById(`category-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
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

  function initWelcomeOverlay() {
    const overlay = $("#welcome-overlay");
    if (new URLSearchParams(location.search).has("skipWelcome")) return;
    try {
      if (sessionStorage.getItem("hls-welcome-seen")) return;
    } catch {
      // The welcome screen can still be shown when storage is unavailable.
    }
    $("[data-welcome-hint]", overlay).textContent = ui("welcomeHint");
    overlay.hidden = false;
    document.body.classList.add("welcome-open");
    requestAnimationFrame(() => overlay.classList.add("visible"));
    $(".welcome-close", overlay).focus();
  }

  function closeWelcomeOverlay() {
    const overlay = $("#welcome-overlay");
    overlay.classList.remove("visible");
    document.body.classList.remove("welcome-open");
    try {
      sessionStorage.setItem("hls-welcome-seen", "1");
    } catch {
      // Closing the overlay must work even when storage is unavailable.
    }
    setTimeout(() => { overlay.hidden = true; }, 180);
  }

  document.addEventListener("click", (event) => {
    const welcomeOverlay = event.target.closest("#welcome-overlay");
    if (welcomeOverlay) {
      closeWelcomeOverlay();
      return;
    }

    const languageButton = event.target.closest("[data-language]");
    if (languageButton) {
      state.lang = window.HLSLocale.supported.includes(languageButton.dataset.language) ? languageButton.dataset.language : "en";
      try { localStorage.setItem("hls-lang", state.lang); } catch { /* Keep the in-memory selection. */ }
      render();
      const welcomeHint = $("[data-welcome-hint]");
      if (welcomeHint) welcomeHint.textContent = ui("welcomeHint");
      return;
    }

    const menuButton = event.target.closest('[data-action="menu"]');
    if (menuButton) {
      const open = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(open));
      return;
    }

    if (event.target.closest(".main-nav a")) document.body.classList.remove("menu-open");

    const sectionButton = event.target.closest("[data-product-section]");
    if (sectionButton) {
      document.getElementById(`category-${sectionButton.dataset.productSection}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const scrollTargetButton = event.target.closest("[data-scroll-target]");
    if (scrollTargetButton) {
      document.getElementById(scrollTargetButton.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const galleryButton = event.target.closest(".gallery-trigger");
    if (galleryButton) {
      const dialog = $("#lightbox");
      const image = $("img", dialog);
      image.src = galleryButton.dataset.image;
      image.alt = $("img", galleryButton)?.alt || "";
      dialog.showModal();
      return;
    }

    if (event.target.closest(".lightbox-close")) $("#lightbox").close();
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#welcome-overlay").hidden) closeWelcomeOverlay();
  });
  $("#lightbox").addEventListener("click", (event) => {
    if (event.target === $("#lightbox")) $("#lightbox").close();
  });

  const reloadGuard = $("#reload-guard");
  if (rapidReloadDelay) {
    reloadGuard.hidden = false;
    $("p", reloadGuard).textContent = {
      zh: "請稍候，網站安全載入中⋯",
      "zh-CN": "请稍候，网站安全加载中⋯",
      en: "Please wait while the website loads safely…",
      th: "โปรดรอสักครู่ ระบบกำลังโหลดเว็บไซต์อย่างปลอดภัย…",
    }[state.lang];
  }

  Promise.all([HLSContentService.getSiteData(), delay(rapidReloadDelay)])
    .then(([data]) => {
      state.data = data;
      reloadGuard.hidden = true;
      if (!location.hash) history.replaceState(null, "", routeHref("home"));
      render();
      initWelcomeOverlay();
    })
    .catch(() => {
      $("#main-content").innerHTML = "<p class='load-error'>網站內容暫時無法載入，請稍後再試。</p>";
    });
})();
