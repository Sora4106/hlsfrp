(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const today = () => new Date().toISOString().slice(0, 10);
  const TABLES = window.HLSContentService.TABLES;
  const SESSION_KEY = "hls-admin-session";
  const CONTENT_FORMAT = "hls-content-v1";
  const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
  const MAX_IMPORT_RECORDS = 100;
  const typeLabels = {
    news: "消息",
    products: "產品",
    categories: "產品分類",
    locations: "服務據點",
    media: "圖片",
    inquiries: "歷史詢問",
  };
  const state = {
    type: "news",
    rows: [],
    categoryOptions: [],
    selectedIndex: -1,
    session: null,
    uploadTarget: "",
    uploadMultiple: true,
    pickerRows: [],
    pickerSelected: new Set(),
  };
  let refreshPromise = null;

  function showStatus(message, isError = false) {
    const status = $("#admin-status");
    status.textContent = message;
    status.classList.toggle("error", isError);
    status.classList.add("show");
    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => status.classList.remove("show"), 4200);
    const activity = $("#admin-activity");
    if (activity) {
      activity.classList.toggle("error", isError);
      activity.classList.toggle("success", !isError && /成功|完成|已儲存|已發布/.test(message));
      const text = $("span", activity);
      if (text) text.textContent = `${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}　${message}`;
    }
  }

  function setSaveFeedback(message, kind = "") {
    const feedback = $("[data-save-feedback]");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `save-feedback ${kind}`.trim();
  }

  function normalizeSession(session) {
    if (!session?.access_token) return session;
    const expiresAt = Number(session.expires_at)
      || Math.floor(Date.now() / 1000) + (Number(session.expires_in) || 3600);
    return { ...session, expires_at: expiresAt };
  }

  function storeSession(session) {
    state.session = normalizeSession(session);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.session)); } catch { /* Keep the active in-memory login. */ }
    return state.session;
  }

  async function activeAccessToken() {
    if (!state.session?.access_token) throw new Error("請重新登入後再操作。");
    const expiresAt = Number(state.session.expires_at) * 1000;
    if (expiresAt > Date.now() + 90000) return state.session.access_token;
    if (!state.session.refresh_token) throw new Error("登入已過期，請重新登入。");

    if (!refreshPromise) {
      refreshPromise = window.HLSContentService.refreshSession(state.session.refresh_token)
        .then((session) => storeSession(session))
        .finally(() => { refreshPromise = null; });
    }
    try {
      return (await refreshPromise).access_token;
    } catch {
      state.session = null;
      try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Direct-file mode may restrict browser storage. */ }
      $("#workspace").hidden = true;
      $("#logout-button").hidden = true;
      $("#auth-panel").hidden = false;
      throw new Error("登入已過期，請重新登入後再儲存。");
    }
  }

  function localized(zh = "", en = "", th = "") {
    return {
      zh,
      "zh-CN": window.HLSLocale.toSimplified(zh),
      en,
      th,
    };
  }

  function localRows(type) {
    if (type === "categories") {
      return window.HLS_DATA.categories.map((item, sort_order) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        sort_order,
        published: true,
      }));
    }
    if (type === "products") {
      return window.HLS_DATA.products.map((item, sort_order) => ({
        id: item.id,
        category_id: item.category,
        name: item.name,
        summary: item.summary,
        features: item.features || [],
        applications: item.applications,
        specifications: item.specifications,
        images: item.images || [],
        spec_images: item.specImages || [],
        sort_order,
        published: true,
      }));
    }
    if (type === "news") {
      return window.HLS_DATA.news.map((item, sort_order) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        body: item.body || [],
        source: item.source,
        author: item.author || "",
        views: Number(item.views) || 0,
        published_at: item.date,
        sort_order,
        published: true,
      }));
    }
    if (type === "locations") {
      return window.HLS_DATA.contacts.map((item, sort_order) => ({
        id: item.id,
        region: item.region,
        company: item.company,
        address: item.address,
        image: item.image,
        phone: item.phone || "",
        fax: item.fax || "",
        email: item.email || "",
        website: item.website || "",
        line: item.line || "",
        sort_order,
        published: true,
      }));
    }
    return [];
  }

  function titleFor(row) {
    if (state.type === "news") return row.title?.zh || row.title?.en || `消息 #${row.id || "新"}`;
    if (state.type === "products" || state.type === "categories") return row.name?.zh || row.name?.en || row.id || "未命名";
    if (state.type === "locations") return row.region?.zh || row.company?.zh || row.id || "未命名";
    if (state.type === "media") return row.original_name || row.storage_path || "圖片";
    return row.name || row.email || "歷史詢問";
  }

  function subtitleFor(row) {
    if (state.type === "news") return `${row.published_at || "未定日期"} · ${row.published ? "已發布" : "草稿"}`;
    if (state.type === "products") return `${row.category_id || "未分類"} · ${row.published ? "已發布" : "草稿"}`;
    if (state.type === "inquiries") return `${row.status || "new"} · ${new Date(row.created_at).toLocaleString("zh-TW")}`;
    if (state.type === "media") return `${row.width || 0} × ${row.height || 0} · ${formatBytes(row.size_bytes)} · ${new Date(row.created_at).toLocaleDateString("zh-TW")}`;
    return `${row.id || "未設定 ID"} · ${row.published ? "已發布" : "草稿"}`;
  }

  function renderList() {
    $("#record-count").textContent = `${state.rows.length} 筆`;
    $("#record-list").innerHTML = state.rows.length
      ? state.rows.map((row, index) => `
          <button class="record-item ${index === state.selectedIndex ? "active" : ""}" type="button" data-record-index="${index}">
            ${state.type === "media" ? `<img class="record-item-thumbnail" src="${esc(row.public_url || "")}" alt="" loading="lazy" />` : ""}
            <span class="record-item-copy"><strong>${esc(titleFor(row))}${row._local ? "<em>尚未同步</em>" : ""}</strong>
            <span>${esc(subtitleFor(row))}</span></span>
          </button>`).join("")
      : '<div class="empty-editor"><p>目前沒有資料。</p></div>';
  }

  function mergeLocalAndRemote(type, remote) {
    if (type === "inquiries" || type === "media") return remote.map((row) => ({ ...row, _local: false }));
    const merged = new Map(localRows(type).map((row) => [String(row.id), { ...row, _local: true }]));
    remote.forEach((row) => merged.set(String(row.id), { ...row, _local: false }));
    return [...merged.values()].sort((a, b) => {
      if (type === "news") return String(b.published_at).localeCompare(String(a.published_at)) || Number(b.id) - Number(a.id);
      return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
    });
  }

  async function loadRows(selectedId = null) {
    $("#record-list").innerHTML = '<div class="empty-editor"><p>正在載入…</p></div>';
    $("#editor").innerHTML = '<div class="empty-editor"><p>正在載入…</p></div>';
    try {
      const token = await activeAccessToken();
      const requests = [window.HLSContentService.getAdminRows(TABLES[state.type], token)];
      if (state.type === "products") requests.push(window.HLSContentService.getAdminRows(TABLES.categories, token));
      const [remote, remoteCategories = []] = await Promise.all(requests);
      if (state.type === "products") state.categoryOptions = mergeLocalAndRemote("categories", remoteCategories);
      state.rows = mergeLocalAndRemote(state.type, Array.isArray(remote) ? remote : []);
      state.selectedIndex = selectedId == null
        ? -1
        : state.rows.findIndex((row) => String(row.id) === String(selectedId));
      renderList();
      if (state.selectedIndex >= 0) renderEditor(state.rows[state.selectedIndex]);
      else renderEmptyEditor();
    } catch (error) {
      state.rows = [];
      renderList();
      $("#editor").innerHTML = `<div class="empty-editor"><div><strong>無法讀取內容</strong><p>${esc(error.message)}</p></div></div>`;
      showStatus("無法讀取資料，請確認此帳號已加入 hls_admins。", true);
    }
  }

  function renderEmptyEditor() {
    if (state.type === "media") {
      $("#editor").innerHTML = `
        <div class="media-upload-panel" data-media-drop>
          <span class="media-upload-icon">＋</span>
          <strong>拖曳圖片到這裡</strong>
          <p>支援 JPG、PNG、WebP、GIF、BMP、AVIF；上傳前自動縮放至最長邊 2400px 並轉成 WebP。</p>
          <button class="primary-button" type="button" data-action="upload-media">選擇圖片</button>
          <small>單張原始檔最大 25 MB；GIF 會取第一個畫面。</small>
        </div>`;
      return;
    }
    $("#editor").innerHTML = '<div class="empty-editor"><div><strong>選擇內容開始編輯</strong><p>也可以使用右上方按鈕新增內容。</p></div></div>';
  }

  function localizedFields(key, label, value = {}, multiline = false, hint = "") {
    const control = (lang, languageLabel) => {
      const current = value?.[lang] || "";
      return `<label><span>${languageLabel}</span>${multiline
        ? `<textarea name="${key}_${lang}" maxlength="12000">${esc(current)}</textarea>`
        : `<input name="${key}_${lang}" value="${esc(current)}" maxlength="500" />`}</label>`;
    };
    return `<fieldset class="wide"><legend>${esc(label)}</legend><div class="language-grid">${control("zh", "繁體中文")}${control("en", "English")}${control("th", "ไทย")}</div>${hint ? `<p class="form-note">${esc(hint)}</p>` : ""}</fieldset>`;
  }

  function commonFields(row, idLabel = "識別碼") {
    return `
      <label>${idLabel}<input name="id" value="${esc(row.id || "")}" maxlength="80" pattern="[a-z0-9][a-z0-9-]{1,79}" ${row.id ? "readonly" : "required"} /></label>
      <label>排序<input type="number" name="sort_order" value="${Number(row.sort_order) || 0}" min="0" max="9999" /></label>
      <label class="checkbox-label publish-toggle wide"><input type="checkbox" name="published" ${row.published !== false ? "checked" : ""} /> <span><strong>顯示於網站前台</strong><small>未勾選時仍會儲存，但狀態為草稿，訪客看不到。</small></span></label>`;
  }

  function listValue(items, lang, separator) {
    return (Array.isArray(items) ? items : []).map((item) => item?.[lang] || "").filter(Boolean).join(separator);
  }

  function formatBytes(value) {
    const bytes = Number(value) || 0;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function imagePreview(urls) {
    const items = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
    if (!items.length) return '<p class="image-preview-empty">上傳後會在這裡顯示預覽。</p>';
    return items.map((url) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(url)}" alt="" loading="lazy" /></a>`).join("");
  }

  function imagePickerField(name, label, value, multiple = false, required = false) {
    const urls = multiple ? (Array.isArray(value) ? value : []) : [value || ""];
    const control = multiple
      ? `<textarea name="${name}" maxlength="12000" ${required ? "required" : ""}>${esc(urls.join("\n"))}</textarea>`
      : `<input name="${name}" value="${esc(value || "")}" maxlength="1000" ${required ? "required" : ""} />`;
    return `
      <div class="image-field wide">
        <label>${esc(label)}${control}</label>
        <div class="image-field-actions">
          <button class="secondary-button" type="button" data-action="upload-media" data-upload-target="${name}" data-upload-multiple="${multiple}">選擇圖片並轉成 WebP</button>
          <button class="secondary-button" type="button" data-action="choose-existing-media" data-upload-target="${name}" data-upload-multiple="${multiple}">從圖片庫選擇</button>
          <span>${multiple ? "可選多張；每行會自動填入一個網址。" : "新圖片會取代欄位中的網址。"}</span>
        </div>
        <div class="image-preview" data-image-preview="${name}">${imagePreview(urls)}</div>
      </div>`;
  }

  function editorShell(title, subtitle, fields) {
    return `
      <div class="editor-title"><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div></div>
      <form id="editor-form" class="editor-form" novalidate>
        <div class="form-grid">${fields}</div>
        <div class="editor-actions"><p class="save-feedback" data-save-feedback role="status" aria-live="polite"></p><button class="secondary-button" type="button" data-action="cancel">取消</button><button class="primary-button" type="submit" data-action="save-content">儲存內容</button></div>
      </form>`;
  }

  function categoryEditor(row) {
    return editorShell(row.id ? "編輯產品分類" : "新增產品分類", "分類識別碼建立後不建議變更。", `
      ${commonFields(row)}
      ${localizedFields("name", "分類名稱", row.name)}
      ${localizedFields("description", "分類說明", row.description, true)}
      ${imagePickerField("image", "代表圖片", row.image, false, true)}`);
  }

  function productEditor(row) {
    const categories = state.categoryOptions.length ? state.categoryOptions : localRows("categories");
    const options = categories.map((item) => `<option value="${esc(item.id)}" ${row.category_id === item.id ? "selected" : ""}>${esc(item.name?.zh || item.id)}</option>`).join("");
    return editorShell(row.id ? "編輯產品" : "新增產品", "圖片可填網站內的 public 路徑，或 Supabase Storage 的公開網址。", `
      ${commonFields(row)}
      <label class="wide">產品分類<select name="category_id" required><option value="">請選擇</option>${options}</select></label>
      ${localizedFields("name", "產品名稱", row.name)}
      ${localizedFields("summary", "產品摘要", row.summary, true)}
      ${localizedFields("features", "特色（每行一項）", {
        zh: listValue(row.features, "zh", "\n"), en: listValue(row.features, "en", "\n"), th: listValue(row.features, "th", "\n"),
      }, true, "三種語言請盡量維持相同項目順序。")}
      ${localizedFields("applications", "適用範圍", row.applications, true)}
      ${localizedFields("specifications", "規格說明", row.specifications, true)}
      ${imagePickerField("images", "產品圖片", row.images, true, true)}
      ${imagePickerField("spec_images", "規格圖片", row.spec_images, true)}`);
  }

  function newsEditor(row) {
    return editorShell(row.id ? "編輯消息" : "新增消息", "消息編號留空時會由資料庫自動產生。內文以空白行分段。", `
      <label>消息編號<input type="number" name="id" value="${esc(row.id || "")}" min="1" ${row.id ? "readonly" : ""} /></label>
      <label>發布日期<input type="date" name="published_at" value="${esc(row.published_at || today())}" required /></label>
      <label>作者<input name="author" value="${esc(row.author || "")}" maxlength="200" /></label>
      <label>瀏覽次數<input type="number" name="views" value="${Number(row.views) || 0}" min="0" /></label>
      <label>排序<input type="number" name="sort_order" value="${Number(row.sort_order) || 0}" min="0" max="9999" /></label>
      <label class="checkbox-label publish-toggle"><input type="checkbox" name="published" ${row.published !== false ? "checked" : ""} /> <span><strong>顯示於網站前台</strong><small>未勾選時會儲存為草稿。</small></span></label>
      ${localizedFields("title", "消息標題", row.title)}
      ${localizedFields("summary", "消息摘要", row.summary, true)}
      ${localizedFields("source", "消息來源", row.source)}
      ${localizedFields("body", "消息內文（空白行分段）", {
        zh: listValue(row.body, "zh", "\n\n"), en: listValue(row.body, "en", "\n\n"), th: listValue(row.body, "th", "\n\n"),
      }, true, "三種語言請盡量維持相同段落順序。")}`);
  }

  function locationEditor(row) {
    return editorShell(row.id ? "編輯服務據點" : "新增服務據點", "取消的據點可取消勾選「顯示於網站前台」。", `
      ${commonFields(row)}
      ${localizedFields("region", "區域名稱", row.region)}
      ${localizedFields("company", "公司名稱", row.company)}
      ${localizedFields("address", "地址", row.address, true)}
      ${imagePickerField("image", "代表圖片", row.image, false, true)}
      <label>電話<input name="phone" value="${esc(row.phone || "")}" maxlength="80" /></label>
      <label>傳真<input name="fax" value="${esc(row.fax || "")}" maxlength="80" /></label>
      <label>電子郵件<input type="email" name="email" value="${esc(row.email || "")}" maxlength="254" /></label>
      <label>網站<input type="url" name="website" value="${esc(row.website || "")}" maxlength="1000" /></label>
      <label>LINE<input name="line" value="${esc(row.line || "")}" maxlength="100" /></label>`);
  }

  function inquiryEditor(row) {
    const statuses = { new: "新詢價", contacted: "已聯絡", closed: "已結案", spam: "垃圾訊息" };
    return editorShell("歷史詢問（官網已停止新增）", `${row.created_at ? new Date(row.created_at).toLocaleString("zh-TW") : ""} · ${row.language || ""}`, `
      <label>姓名<input value="${esc(row.name || "")}" readonly /></label>
      <label>電子郵件<input value="${esc(row.email || "")}" readonly /></label>
      <label>電話<input value="${esc(row.phone || "")}" readonly /></label>
      <label>處理狀態<select name="status">${Object.entries(statuses).map(([value, label]) => `<option value="${value}" ${row.status === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <div class="wide"><strong>需求內容</strong><div class="inquiry-message">${esc(row.message || "")}</div></div>
      <p class="form-note wide">來源頁面：${esc(row.source_page || "未記錄")}</p>`);
  }

  function mediaEditor(row) {
    return `
      <div class="editor-title"><div><h2>${esc(row.original_name || "圖片")}</h2><p>${esc(row.storage_path || "")}</p></div></div>
      <div class="media-detail">
        <a href="${esc(row.public_url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(row.public_url)}" alt="${esc(row.original_name || "")}" /></a>
        <dl>
          <div><dt>格式</dt><dd>WebP</dd></div>
          <div><dt>尺寸</dt><dd>${Number(row.width) || 0} × ${Number(row.height) || 0}px</dd></div>
          <div><dt>原始檔案大小</dt><dd>${row.original_size_bytes == null ? "舊資料未記錄" : formatBytes(row.original_size_bytes)}</dd></div>
          <div><dt>WebP 檔案大小</dt><dd>${formatBytes(row.size_bytes)}</dd></div>
          <div><dt>上傳時間</dt><dd>${row.created_at ? new Date(row.created_at).toLocaleString("zh-TW") : ""}</dd></div>
        </dl>
        <label>公開圖片網址<input value="${esc(row.public_url || "")}" readonly /></label>
        <div class="editor-actions">
          <button class="secondary-button" type="button" data-action="copy-media-url" data-media-url="${esc(row.public_url || "")}">複製網址</button>
          <button class="danger-button" type="button" data-action="delete-media">刪除圖片</button>
        </div>
        <p class="form-note">仍被產品、分類或據點使用的圖片，系統會阻止刪除。</p>
      </div>`;
  }

  function renderEditor(row) {
    if (state.type === "categories") $("#editor").innerHTML = categoryEditor(row);
    else if (state.type === "products") $("#editor").innerHTML = productEditor(row);
    else if (state.type === "news") $("#editor").innerHTML = newsEditor(row);
    else if (state.type === "locations") $("#editor").innerHTML = locationEditor(row);
    else if (state.type === "media") $("#editor").innerHTML = mediaEditor(row);
    else $("#editor").innerHTML = inquiryEditor(row);
  }

  function formText(form, name) {
    return String(form.get(name) || "").trim();
  }

  function localizedFromForm(form, key) {
    return localized(formText(form, `${key}_zh`), formText(form, `${key}_en`), formText(form, `${key}_th`));
  }

  function localizedArrayFromForm(form, key, blocks = false) {
    const split = (language) => formText(form, `${key}_${language}`)
      .split(blocks ? /\n\s*\n/ : /\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    const values = { zh: split("zh"), en: split("en"), th: split("th") };
    const length = Math.max(values.zh.length, values.en.length, values.th.length);
    return Array.from({ length }, (_, index) => localized(values.zh[index] || "", values.en[index] || "", values.th[index] || ""));
  }

  function urlLines(form, key) {
    return formText(form, key).split(/\n/).map((item) => item.trim()).filter(Boolean);
  }

  function rowFromForm(form) {
    const published = form.has("published");
    const sort_order = Number(form.get("sort_order")) || 0;
    if (state.type === "categories") return {
      id: formText(form, "id"),
      name: localizedFromForm(form, "name"),
      description: localizedFromForm(form, "description"),
      image: formText(form, "image"),
      sort_order,
      published,
    };
    if (state.type === "products") return {
      id: formText(form, "id"),
      category_id: formText(form, "category_id"),
      name: localizedFromForm(form, "name"),
      summary: localizedFromForm(form, "summary"),
      features: localizedArrayFromForm(form, "features"),
      applications: localizedFromForm(form, "applications"),
      specifications: localizedFromForm(form, "specifications"),
      images: urlLines(form, "images"),
      spec_images: urlLines(form, "spec_images"),
      sort_order,
      published,
    };
    if (state.type === "news") return {
      id: Number(form.get("id")) || undefined,
      title: localizedFromForm(form, "title"),
      summary: localizedFromForm(form, "summary"),
      body: localizedArrayFromForm(form, "body", true),
      source: localizedFromForm(form, "source"),
      author: formText(form, "author"),
      views: Math.max(0, Number(form.get("views")) || 0),
      published_at: formText(form, "published_at") || today(),
      sort_order,
      published,
    };
    if (state.type === "locations") return {
      id: formText(form, "id"),
      region: localizedFromForm(form, "region"),
      company: localizedFromForm(form, "company"),
      address: localizedFromForm(form, "address"),
      image: formText(form, "image"),
      phone: formText(form, "phone"),
      fax: formText(form, "fax"),
      email: formText(form, "email"),
      website: formText(form, "website"),
      line: formText(form, "line"),
      sort_order,
      published,
    };
    return { ...state.rows[state.selectedIndex], status: formText(form, "status"), _local: undefined };
  }

  async function saveEditor(formElement) {
    const button = $('button[type="submit"]', formElement);
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "儲存中…";
    setSaveFeedback("正在寫入 Supabase，請稍候…", "saving");
    showStatus("正在儲存內容…");
    try {
      const row = rowFromForm(new FormData(formElement));
      delete row._local;
      const token = await activeAccessToken();
      const response = await window.HLSContentService.saveAdminRow(TABLES[state.type], row, token);
      const saved = Array.isArray(response) ? response[0] : response;
      const savedId = saved?.id ?? row.id;
      await loadRows(savedId);
      const stateLabel = state.type === "inquiries" ? "處理狀態已更新" : row.published ? "已發布" : "已儲存為草稿";
      setSaveFeedback(`✓ 儲存成功 · ${stateLabel} · ${new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}`, "success");
      showStatus(`儲存成功：${stateLabel}。`);
    } catch (error) {
      const message = `儲存失敗：${error.message}`;
      setSaveFeedback(message, "error");
      showStatus(message, true);
      window.alert(message);
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }

  async function submitEditorForm(form) {
    if (!form || form.dataset.saving === "true") return;
    if (!form.checkValidity()) {
      const message = "無法儲存：尚有必填欄位未完成或格式不正確。";
      setSaveFeedback(message, "error");
      showStatus(message, true);
      form.reportValidity();
      return;
    }
    form.dataset.saving = "true";
    try {
      await saveEditor(form);
    } finally {
      delete form.dataset.saving;
    }
  }

  function newRow() {
    if (state.type === "news") return { published_at: today(), published: true, views: 0, sort_order: state.rows.length };
    if (state.type === "products") return { published: true, images: [], spec_images: [], features: [], sort_order: state.rows.length };
    if (state.type === "categories" || state.type === "locations") return { published: true, sort_order: state.rows.length };
    return null;
  }

  function cleanRecord(row) {
    const copy = JSON.parse(JSON.stringify(row));
    delete copy._local;
    delete copy.created_at;
    delete copy.updated_at;
    return copy;
  }

  function templateRecord(type) {
    const words = localized("請填寫繁體中文", "Write English here", "กรอกภาษาไทยที่นี่");
    if (type === "news") return {
      title: words,
      summary: words,
      body: [words],
      source: localized("公司消息", "Company news", "ข่าวบริษัท"),
      author: "好利生實業",
      views: 0,
      published_at: today(),
      sort_order: state.rows.length,
      published: false,
    };
    if (type === "products") return {
      id: "new-product-id",
      category_id: state.categoryOptions[0]?.id || "farming",
      name: words,
      summary: words,
      features: [words],
      applications: words,
      specifications: words,
      images: ["public/assets/optimized/example.webp"],
      spec_images: [],
      sort_order: state.rows.length,
      published: false,
    };
    if (type === "categories") return {
      id: "new-category-id",
      name: words,
      description: words,
      image: "public/assets/optimized/example.webp",
      sort_order: state.rows.length,
      published: false,
    };
    return {
      id: "new-location-id",
      region: words,
      company: words,
      address: words,
      image: "public/assets/optimized/example.webp",
      phone: "",
      fax: "",
      email: "",
      website: "",
      line: "",
      sort_order: state.rows.length,
      published: false,
    };
  }

  function transferPackage(records, task) {
    return {
      format: CONTENT_FORMAT,
      contentType: state.type,
      task,
      gptPrompt: "請依照 task 編輯 records。保留 format 與 contentType，維持所有欄位名稱及資料型態；zh 為繁體中文、zh-CN 為簡體中文、en 為英文、th 為泰文。不要虛構產品規格或聯絡資訊，不確定的內容保留原值。完成後只輸出一個合法的完整 JSON，不要加 Markdown 程式碼框或其他說明。",
      rules: [
        "id 只能使用小寫英文字母、數字及連字號；既有資料的 id 不得變更。",
        "published=false 表示草稿；確認內容後才改成 true。",
        "圖片使用既有 public/assets 路徑或 https 公開網址，不可使用本機磁碟路徑。",
        "產品 features 與消息 body 必須是多語物件陣列。",
        "一次最多 100 筆；匯入只會新增或更新，不會刪除資料。",
      ],
      records,
    };
  }

  function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  function exportTemplate() {
    if (state.type === "inquiries") return;
    const task = `請協助新增${typeLabels[state.type]}。先將 records 中的範例改成真實內容，需要多筆時複製物件；內容先保持 published=false 供人工確認。`;
    downloadJson(`hls-gpt-${state.type}-新增範本.json`, transferPackage([templateRecord(state.type)], task));
    showStatus("GPT 作業範本已下載。");
  }

  function exportCurrent() {
    if (state.type === "inquiries") return;
    const records = state.rows.map(cleanRecord);
    const task = `請依我的後續指示編輯這些${typeLabels[state.type]}。保留不需修改的資料與既有 id。`;
    downloadJson(`hls-gpt-${state.type}-目前資料-${today()}.json`, transferPackage(records, task));
    showStatus(`已匯出 ${records.length} 筆目前資料。`);
  }

  function requireString(value, field, maxLength, allowEmpty = false) {
    if (typeof value !== "string") throw new Error(`${field} 必須是文字。`);
    const result = value.trim();
    if (!allowEmpty && !result) throw new Error(`${field} 不可空白。`);
    if (result.length > maxLength) throw new Error(`${field} 超過 ${maxLength} 字。`);
    return result;
  }

  function normalizeId(value, field = "id") {
    const id = requireString(value, field, 80);
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) throw new Error(`${field} 只能使用小寫英文字母、數字與連字號。`);
    return id;
  }

  function normalizeLocalized(value, field, maxLength = 12000) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} 必須是多語物件。`);
    const result = localized(
      requireString(value.zh || "", `${field}.zh`, maxLength, true),
      requireString(value.en || "", `${field}.en`, maxLength, true),
      requireString(value.th || "", `${field}.th`, maxLength, true)
    );
    if (!result.zh && !result.en && !result.th) throw new Error(`${field} 至少需要填寫一種語言。`);
    result["zh-CN"] = typeof value["zh-CN"] === "string" && value["zh-CN"].trim()
      ? requireString(value["zh-CN"], `${field}.zh-CN`, maxLength)
      : window.HLSLocale.toSimplified(result.zh);
    return result;
  }

  function normalizeLocalizedArray(value, field) {
    if (!Array.isArray(value) || !value.length) throw new Error(`${field} 必須是至少包含一項的陣列。`);
    if (value.length > 200) throw new Error(`${field} 最多 200 項。`);
    return value.map((item, index) => normalizeLocalized(item, `${field}[${index}]`));
  }

  function normalizeAssetList(value, field, required = false) {
    if (!Array.isArray(value)) throw new Error(`${field} 必須是網址陣列。`);
    if (required && !value.length) throw new Error(`${field} 至少需要一張圖片。`);
    if (value.length > 50) throw new Error(`${field} 最多 50 張圖片。`);
    return value.map((item, index) => {
      const path = requireString(item, `${field}[${index}]`, 1000);
      if (!/^(public\/assets\/|https:\/\/)/i.test(path)) throw new Error(`${field}[${index}] 必須是 public/assets 路徑或 https 網址。`);
      return path;
    });
  }

  function normalizeSort(value) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0 || number > 9999) throw new Error("sort_order 必須是 0–9999 的整數。");
    return number;
  }

  function normalizeImportedRecord(row, index) {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`第 ${index + 1} 筆不是有效物件。`);
    const published = row.published === true;
    const sort_order = normalizeSort(row.sort_order ?? index);
    if (state.type === "categories") return {
      id: normalizeId(row.id),
      name: normalizeLocalized(row.name, "name", 500),
      description: normalizeLocalized(row.description, "description"),
      image: normalizeAssetList([row.image], "image", true)[0],
      sort_order,
      published,
    };
    if (state.type === "products") return {
      id: normalizeId(row.id),
      category_id: normalizeId(row.category_id, "category_id"),
      name: normalizeLocalized(row.name, "name", 500),
      summary: normalizeLocalized(row.summary, "summary"),
      features: normalizeLocalizedArray(row.features, "features"),
      applications: normalizeLocalized(row.applications, "applications"),
      specifications: normalizeLocalized(row.specifications, "specifications"),
      images: normalizeAssetList(row.images, "images", true),
      spec_images: normalizeAssetList(row.spec_images || [], "spec_images"),
      sort_order,
      published,
    };
    if (state.type === "news") {
      const id = row.id == null || row.id === "" ? undefined : Number(row.id);
      if (id !== undefined && (!Number.isSafeInteger(id) || id < 1)) throw new Error("消息 id 必須是正整數或省略。 ");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.published_at || ""))) throw new Error("published_at 必須使用 YYYY-MM-DD。");
      return {
        id,
        title: normalizeLocalized(row.title, "title", 500),
        summary: normalizeLocalized(row.summary, "summary"),
        body: normalizeLocalizedArray(row.body, "body"),
        source: normalizeLocalized(row.source, "source", 500),
        author: requireString(row.author || "", "author", 200, true),
        views: Math.max(0, Math.min(1000000000, Number(row.views) || 0)),
        published_at: row.published_at,
        sort_order,
        published,
      };
    }
    if (state.type === "locations") {
      const website = requireString(row.website || "", "website", 1000, true);
      if (website && !/^https?:\/\//i.test(website)) throw new Error("website 必須是 http 或 https 網址。");
      return {
        id: normalizeId(row.id),
        region: normalizeLocalized(row.region, "region", 500),
        company: normalizeLocalized(row.company, "company", 500),
        address: normalizeLocalized(row.address, "address"),
        image: normalizeAssetList([row.image], "image", true)[0],
        phone: requireString(row.phone || "", "phone", 80, true),
        fax: requireString(row.fax || "", "fax", 80, true),
        email: requireString(row.email || "", "email", 254, true),
        website,
        line: requireString(row.line || "", "line", 100, true),
        sort_order,
        published,
      };
    }
    throw new Error("歷史詢問紀錄不接受 GPT 匯入。");
  }

  function parseTransfer(text) {
    let source = String(text || "").trim();
    if (source.length > MAX_IMPORT_BYTES) throw new Error("JSON 超過 2 MB。 ");
    source = source.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    let payload;
    try { payload = JSON.parse(source); } catch { throw new Error("JSON 格式錯誤，請確認 GPT 只輸出完整 JSON。 "); }
    if (payload?.format !== CONTENT_FORMAT) throw new Error(`format 必須是 ${CONTENT_FORMAT}。`);
    if (payload?.contentType !== state.type) throw new Error(`這是 ${payload?.contentType || "未知"} 格式，請切換到正確分頁後再匯入。`);
    if (!Array.isArray(payload.records) || !payload.records.length) throw new Error("records 必須至少包含一筆內容。 ");
    if (payload.records.length > MAX_IMPORT_RECORDS) throw new Error(`一次最多匯入 ${MAX_IMPORT_RECORDS} 筆。`);
    return payload.records.map(normalizeImportedRecord);
  }

  async function importTransfer(text) {
    if (state.type === "inquiries") return;
    let records;
    try { records = parseTransfer(text); } catch (error) {
      showStatus(`檢查失敗：${error.message}`, true);
      return;
    }
    const publishedCount = records.filter((row) => row.published).length;
    const approved = window.confirm(`已通過格式檢查，共 ${records.length} 筆；其中 ${publishedCount} 筆會立即顯示於前台。確定要寫入 Supabase 嗎？`);
    if (!approved) return;
    const controls = [$("#import-pasted"), $("#import-file"), $("#export-template"), $("#export-current")];
    controls.forEach((control) => { control.disabled = true; });
    let saved = 0;
    try {
      for (let start = 0; start < records.length; start += 4) {
        const batch = records.slice(start, start + 4);
        const token = await activeAccessToken();
        await Promise.all(batch.map((row) => window.HLSContentService.saveAdminRow(TABLES[state.type], row, token)));
        saved += batch.length;
        showStatus(`正在匯入：${saved}/${records.length} 筆`);
      }
      $("#import-json").value = "";
      $("#import-file").value = "";
      await loadRows();
      showStatus(`匯入完成，共新增或更新 ${saved} 筆內容。`);
    } catch (error) {
      await loadRows();
      showStatus(`已完成 ${saved} 筆，其後匯入失敗：${error.message}`, true);
    } finally {
      controls.forEach((control) => { control.disabled = false; });
    }
  }

  async function importFile(file) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      showStatus("檔案超過 2 MB，無法匯入。", true);
      return;
    }
    await importTransfer(await file.text());
  }

  async function decodeImage(file) {
    if ("createImageBitmap" in window) {
      try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* Use image element fallback. */ }
    }
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("瀏覽器無法讀取這個圖片格式。"));
      };
      image.src = objectUrl;
    });
  }

  async function convertToWebp(file) {
    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/avif"]);
    const acceptedExtension = /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name || "");
    if ((!acceptedTypes.has(file.type) && !acceptedExtension) || !file.size) throw new Error(`${file.name || "檔案"} 不是支援的圖片格式。`);
    if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name} 超過 25 MB。`);
    const decoded = await decodeImage(file);
    const sourceWidth = Number(decoded.width || decoded.naturalWidth);
    const sourceHeight = Number(decoded.height || decoded.naturalHeight);
    if (!sourceWidth || !sourceHeight || sourceWidth > 30000 || sourceHeight > 30000) {
      decoded.close?.();
      throw new Error(`${file.name} 的圖片尺寸無效或過大。`);
    }
    const scale = Math.min(1, 2400 / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      decoded.close?.();
      throw new Error("瀏覽器無法啟動圖片轉換功能。 ");
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded, 0, 0, width, height);
    decoded.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
    canvas.width = 1;
    canvas.height = 1;
    if (!blob || blob.type !== "image/webp") throw new Error("目前瀏覽器不支援 WebP 轉換。 ");
    if (blob.size > 8 * 1024 * 1024) throw new Error(`${file.name} 轉換後仍超過 8 MB，請先縮小圖片。`);
    return { blob, width, height, originalName: file.name || "image" };
  }

  function setUploadedUrls(target, urls, multiple) {
    if (!target || !urls.length) return;
    const field = $(`[name="${target}"]`);
    if (!field) return;
    if (multiple) {
      const existing = field.value.split(/\n/).map((value) => value.trim()).filter(Boolean);
      field.value = [...new Set([...existing, ...urls])].join("\n");
    } else {
      field.value = urls.at(-1);
    }
    const preview = $(`[data-image-preview="${target}"]`);
    if (preview) preview.innerHTML = imagePreview(multiple ? field.value.split(/\n/).filter(Boolean) : field.value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function renderMediaPicker() {
    const query = String($("#media-picker-search").value || "").trim().toLocaleLowerCase();
    const rows = state.pickerRows.filter((row) => !query || String(row.original_name || "").toLocaleLowerCase().includes(query));
    $("#media-picker-grid").innerHTML = rows.length
      ? rows.map((row) => {
          const selected = state.pickerSelected.has(row.public_url);
          return `
            <button class="media-picker-card ${selected ? "selected" : ""}" type="button" data-action="select-existing-media" data-media-id="${esc(row.id)}" aria-pressed="${selected}">
              <img src="${esc(row.public_url)}" alt="" loading="lazy" />
              <span><strong>${esc(row.original_name || "圖片")}</strong><small>${Number(row.width) || 0} × ${Number(row.height) || 0}px · ${formatBytes(row.size_bytes)}</small></span>
            </button>`;
        }).join("")
      : '<p class="media-picker-empty">找不到符合的圖片。</p>';
    $("#media-picker-count").textContent = state.pickerSelected.size
      ? `已選擇 ${state.pickerSelected.size} 張圖片`
      : "尚未選擇圖片";
  }

  function closeMediaPicker() {
    const dialog = $("#media-picker");
    if (dialog.open) dialog.close();
    state.pickerRows = [];
    state.pickerSelected = new Set();
    state.uploadTarget = "";
    state.uploadMultiple = true;
    $("#media-picker-search").value = "";
  }

  async function openMediaPicker(target, multiple) {
    state.uploadTarget = target;
    state.uploadMultiple = multiple;
    state.pickerRows = [];
    state.pickerSelected = new Set();
    $("#media-picker-grid").innerHTML = "<p>正在讀取圖片庫…</p>";
    $("#media-picker-count").textContent = "尚未選擇圖片";
    $("#apply-media-selection").hidden = !multiple;
    $("#media-picker").showModal();
    try {
      const token = await activeAccessToken();
      state.pickerRows = await window.HLSContentService.getAdminRows(TABLES.media, token);
      renderMediaPicker();
    } catch (error) {
      $("#media-picker-grid").innerHTML = `<p class="media-picker-empty error">無法讀取圖片庫：${esc(error.message)}</p>`;
      showStatus(`無法讀取圖片庫：${error.message}`, true);
    }
  }

  function selectExistingMedia(mediaId) {
    const row = state.pickerRows.find((item) => String(item.id) === String(mediaId));
    if (!row) return;
    if (!state.uploadMultiple) {
      setUploadedUrls(state.uploadTarget, [row.public_url], false);
      closeMediaPicker();
      showStatus("已從圖片庫選用圖片；請按「儲存內容」完成套用。");
      return;
    }
    if (state.pickerSelected.has(row.public_url)) state.pickerSelected.delete(row.public_url);
    else state.pickerSelected.add(row.public_url);
    renderMediaPicker();
  }

  function applyMediaSelection() {
    const urls = [...state.pickerSelected];
    if (!urls.length) {
      showStatus("請至少選擇一張圖片。", true);
      return;
    }
    setUploadedUrls(state.uploadTarget, urls, true);
    closeMediaPicker();
    showStatus(`已從圖片庫加入 ${urls.length} 張圖片；請按「儲存內容」完成套用。`);
  }

  async function uploadImageFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const selected = state.uploadMultiple ? files.slice(0, 10) : files.slice(0, 1);
    if (files.length > selected.length) showStatus(`一次最多處理 ${selected.length} 張圖片。`);
    const input = $("#media-upload-input");
    input.disabled = true;
    const uploadedUrls = [];
    const skippedDuplicates = [];
    try {
      const token = await activeAccessToken();
      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index];
        showStatus(`正在檢查、轉換並上傳 ${index + 1}/${selected.length}：${file.name}`);
        const converted = await convertToWebp(file);
        const duplicate = await window.HLSContentService.findDuplicateMedia(
          converted.originalName,
          file.size,
          converted.blob.size,
          token
        );
        if (duplicate) {
          skippedDuplicates.push(file.name);
          continue;
        }
        try {
          const media = await window.HLSContentService.uploadMedia(converted.blob, {
            folder: ["products", "categories", "locations"].includes(state.type) ? state.type : "library",
            originalName: converted.originalName,
            originalSize: file.size,
            width: converted.width,
            height: converted.height,
          }, token);
          uploadedUrls.push(media.public_url);
        } catch (error) {
          if (/相同檔名與檔案大小/.test(error.message)) {
            skippedDuplicates.push(file.name);
            continue;
          }
          throw error;
        }
      }
      setUploadedUrls(state.uploadTarget, uploadedUrls, state.uploadMultiple);
      if (state.type === "media") await loadRows();
      if (skippedDuplicates.length) {
        const message = `${uploadedUrls.length} 張已上傳；${skippedDuplicates.length} 張因檔名與檔案大小相同而略過：${skippedDuplicates.join("、")}。可使用「從圖片庫選擇」。`;
        showStatus(message, uploadedUrls.length === 0);
        window.alert(message);
      } else {
        showStatus(`${uploadedUrls.length} 張圖片已轉成 WebP 並存入圖片庫。`);
      }
    } catch (error) {
      if (state.type === "media") await loadRows();
      showStatus(`圖片處理失敗：${error.message}`, true);
    } finally {
      input.disabled = false;
      input.value = "";
      state.uploadTarget = "";
      state.uploadMultiple = true;
    }
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
  }

  async function deleteSelectedMedia() {
    const media = state.rows[state.selectedIndex];
    if (!media) return;
    if (!window.confirm(`確定永久刪除「${media.original_name}」嗎？此動作無法復原。`)) return;
    try {
      showStatus("正在檢查並刪除圖片…");
      await window.HLSContentService.deleteMedia(media, await activeAccessToken());
      await loadRows();
      showStatus("圖片已從 Supabase Storage 與圖片紀錄中刪除。 ");
    } catch (error) {
      showStatus(`無法刪除：${error.message}`, true);
    }
  }

  function updateNewButton() {
    const button = $("#new-record");
    button.hidden = state.type === "inquiries";
    button.textContent = state.type === "media" ? "上傳圖片" : `新增${typeLabels[state.type]}`;
    $("#gpt-transfer").hidden = state.type === "inquiries" || state.type === "media";
  }

  function selectType(type) {
    if (!Object.hasOwn(TABLES, type)) return;
    state.type = type;
    $$("[data-type]").forEach((button) => button.classList.toggle("active", button.dataset.type === type));
    updateNewButton();
    loadRows();
  }

  function readStoredSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (session?.access_token && session?.refresh_token) return normalizeSession(session);
    } catch {
      // A damaged browser session simply requires another login.
    }
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Direct-file mode may restrict browser storage. */ }
    return null;
  }

  async function enterWorkspace(session) {
    storeSession(session);
    $("#auth-panel").hidden = true;
    $("#workspace").hidden = false;
    $("#logout-button").hidden = false;
    updateNewButton();
    await loadRows();
  }

  async function logout() {
    try { await window.HLSContentService.signOut(state.session?.access_token); } catch { /* Local logout still completes. */ }
    state.session = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Direct-file mode may restrict browser storage. */ }
    $("#workspace").hidden = true;
    $("#logout-button").hidden = true;
    $("#auth-panel").hidden = false;
    showStatus("已安全登出。");
  }

  document.addEventListener("click", (event) => {
    const saveButton = event.target.closest('[data-action="save-content"]');
    if (saveButton) {
      event.preventDefault();
      submitEditorForm(saveButton.closest("form"));
      return;
    }
    const existingMediaButton = event.target.closest('[data-action="choose-existing-media"]');
    if (existingMediaButton) {
      openMediaPicker(
        existingMediaButton.dataset.uploadTarget || "",
        existingMediaButton.dataset.uploadMultiple !== "false"
      );
      return;
    }
    if (event.target.closest('[data-action="close-media-picker"]')) {
      closeMediaPicker();
      return;
    }
    const mediaChoice = event.target.closest('[data-action="select-existing-media"]');
    if (mediaChoice) {
      selectExistingMedia(mediaChoice.dataset.mediaId);
      return;
    }
    if (event.target.closest('[data-action="apply-media-selection"]')) {
      applyMediaSelection();
      return;
    }
    const uploadButton = event.target.closest('[data-action="upload-media"]');
    if (uploadButton) {
      state.uploadTarget = uploadButton.dataset.uploadTarget || "";
      state.uploadMultiple = uploadButton.dataset.uploadMultiple !== "false";
      const input = $("#media-upload-input");
      input.multiple = state.uploadMultiple;
      input.click();
      return;
    }
    const copyMediaButton = event.target.closest('[data-action="copy-media-url"]');
    if (copyMediaButton) {
      copyText(copyMediaButton.dataset.mediaUrl || "")
        .then(() => showStatus("圖片網址已複製。"))
        .catch((error) => showStatus(`無法複製網址：${error.message}`, true));
      return;
    }
    if (event.target.closest('[data-action="delete-media"]')) {
      deleteSelectedMedia();
      return;
    }
    const typeButton = event.target.closest("[data-type]");
    if (typeButton) {
      selectType(typeButton.dataset.type);
      return;
    }
    const recordButton = event.target.closest("[data-record-index]");
    if (recordButton) {
      state.selectedIndex = Number(recordButton.dataset.recordIndex);
      renderList();
      renderEditor(state.rows[state.selectedIndex]);
      return;
    }
    if (event.target.closest("#new-record")) {
      if (state.type === "media") {
        state.uploadTarget = "";
        state.uploadMultiple = true;
        const input = $("#media-upload-input");
        input.multiple = true;
        input.click();
        return;
      }
      state.selectedIndex = -1;
      renderList();
      renderEditor(newRow());
      return;
    }
    if (event.target.closest('[data-action="cancel"]')) {
      state.selectedIndex = -1;
      renderList();
      renderEmptyEditor();
      return;
    }
    if (event.target.closest("#export-template")) {
      exportTemplate();
      return;
    }
    if (event.target.closest("#export-current")) {
      exportCurrent();
      return;
    }
    if (event.target.closest("#import-pasted")) {
      importTransfer($("#import-json").value);
    }
  });

  $("#media-upload-input").addEventListener("change", (event) => uploadImageFiles(event.target.files));
  $("#media-picker-search").addEventListener("input", renderMediaPicker);
  $("#media-picker").addEventListener("close", () => {
    state.pickerRows = [];
    state.pickerSelected = new Set();
    state.uploadTarget = "";
    state.uploadMultiple = true;
    $("#media-picker-search").value = "";
  });
  document.addEventListener("dragover", (event) => {
    const mediaDropZone = event.target.closest("[data-media-drop]");
    if (!mediaDropZone) return;
    event.preventDefault();
    mediaDropZone.classList.add("dragover");
  });
  document.addEventListener("dragleave", (event) => {
    const mediaDropZone = event.target.closest("[data-media-drop]");
    if (!mediaDropZone || mediaDropZone.contains(event.relatedTarget)) return;
    mediaDropZone.classList.remove("dragover");
  });
  document.addEventListener("drop", (event) => {
    const mediaDropZone = event.target.closest("[data-media-drop]");
    if (!mediaDropZone) return;
    event.preventDefault();
    mediaDropZone.classList.remove("dragover");
    state.uploadTarget = "";
    state.uploadMultiple = true;
    uploadImageFiles(event.dataTransfer?.files);
  });

  document.addEventListener("submit", async (event) => {
    if (event.target.id === "config-form") {
      event.preventDefault();
      const form = new FormData(event.target);
      try {
        window.HLSContentService.setConfig({ url: formText(form, "url"), anonKey: formText(form, "anonKey") });
        $("#config-notice").hidden = true;
        showStatus("Supabase 連線資料已儲存，現在可以登入。 ");
      } catch (error) {
        showStatus(error.message, true);
      }
      return;
    }
    if (event.target.id === "login-form") {
      event.preventDefault();
      if (!window.HLSContentService.isConfigured()) {
        showStatus("請先設定 Supabase 公開連線資訊。", true);
        return;
      }
      const button = $('button[type="submit"]', event.target);
      const form = new FormData(event.target);
      button.disabled = true;
      try {
        const session = await window.HLSContentService.signIn(formText(form, "email"), String(form.get("password") || ""));
        await enterWorkspace(session);
        event.target.reset();
        showStatus("登入成功。");
      } catch (error) {
        showStatus(`登入失敗：${error.message}`, true);
      } finally {
        button.disabled = false;
      }
      return;
    }
    if (event.target.id === "editor-form") {
      event.preventDefault();
      await submitEditorForm(event.target);
    }
  });

  $("#import-file").addEventListener("change", (event) => importFile(event.target.files?.[0]));
  const dropZone = $("#import-drop-zone");
  ["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
  }));
  dropZone.addEventListener("drop", (event) => importFile(event.dataTransfer?.files?.[0]));
  dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      $("#import-file").click();
    }
  });
  $("#logout-button").addEventListener("click", logout);
  const configured = window.HLSContentService.isConfigured();
  $("#config-notice").hidden = configured;
  const storedSession = configured ? readStoredSession() : null;
  if (storedSession) enterWorkspace(storedSession);
})();
