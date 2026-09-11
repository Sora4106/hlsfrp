(function () {
  "use strict";

  const TABLES = Object.freeze({
    categories: "hls_product_categories",
    products: "hls_products",
    news: "hls_news",
    locations: "hls_locations",
    inquiries: "hls_inquiries",
    media: "hls_media",
  });
  const MEDIA_BUCKET = "hls-site-assets";
  const CONFIG_KEY = "hls-supabase-config";

  function config() {
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}"); } catch { stored = {}; }
    const settings = { ...(window.HLS_SUPABASE || {}), ...stored };
    return {
      url: String(settings.url || "").replace(/\/$/, ""),
      anonKey: String(settings.anonKey || ""),
    };
  }

  function setConfig(settings) {
    const next = {
      url: String(settings?.url || "").trim().replace(/\/$/, ""),
      anonKey: String(settings?.anonKey || "").trim(),
    };
    if (!/^https:\/\/[a-z0-9.-]+$/i.test(next.url) || next.anonKey.length <= 20) {
      throw new Error("Project URL 或 Publishable Key 格式不正確。");
    }
    window.HLS_SUPABASE = Object.freeze(next);
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(next)); } catch { /* The active page can still use the settings. */ }
    return next;
  }

  function isConfigured() {
    const settings = config();
    return /^https:\/\/[a-z0-9.-]+$/i.test(settings.url) && settings.anonKey.length > 20;
  }

  async function parseResponse(response) {
    const raw = await response.text();
    let payload = null;
    if (raw) {
      try { payload = JSON.parse(raw); } catch { payload = raw; }
    }
    if (!response.ok) {
      const message = payload?.message || payload?.msg || payload?.error_description || `Request failed (${response.status})`;
      throw new Error(message);
    }
    return payload;
  }

  async function apiRequest(path, options = {}) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    const settings = config();
    const headers = {
      apikey: settings.anonKey,
      Authorization: `Bearer ${options.token || settings.anonKey}`,
      ...options.headers,
    };
    if (options.body != null) headers["Content-Type"] = "application/json";
    const response = await fetch(`${settings.url}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body == null ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    return parseResponse(response);
  }

  const bySortOrder = (a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);

  function normalizeSiteData(payload) {
    const categories = Array.isArray(payload?.categories) ? payload.categories.sort(bySortOrder).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      image: row.image,
      products: [],
    })) : [];
    const products = Array.isArray(payload?.products) ? payload.products.sort(bySortOrder).map((row) => ({
      id: row.id,
      category: row.category_id,
      name: row.name,
      summary: row.summary,
      features: Array.isArray(row.features) ? row.features : [],
      applications: row.applications,
      specifications: row.specifications,
      images: Array.isArray(row.images) ? row.images : [],
      specImages: Array.isArray(row.spec_images) ? row.spec_images : [],
    })) : [];
    categories.forEach((category) => {
      category.products = products.filter((product) => product.category === category.id).map((product) => product.id);
    });
    const news = Array.isArray(payload?.news) ? payload.news.map((row) => ({
      id: Number(row.id),
      title: row.title,
      date: row.published_at,
      source: row.source,
      author: row.author || "",
      views: Number(row.views) || 0,
      summary: row.summary,
      body: Array.isArray(row.body) ? row.body : [],
    })) : [];
    const contacts = Array.isArray(payload?.locations) ? payload.locations.sort(bySortOrder).map((row) => ({
      id: row.id,
      region: row.region,
      company: row.company,
      image: row.image,
      address: row.address,
      phone: row.phone,
      fax: row.fax || "",
      email: row.email,
      website: row.website || "",
      line: row.line || "",
    })) : [];
    return { categories, products, news, contacts };
  }

  async function getSiteData() {
    const fallback = window.HLS_DATA;
    if (!isConfigured()) return fallback;
    try {
      const payload = await apiRequest("/rest/v1/rpc/hls_get_site_content", {
        method: "POST",
        body: {},
      });
      const remote = normalizeSiteData(payload);
      const hasRemoteContent = remote.categories.length || remote.products.length || remote.news.length || remote.contacts.length;
      return hasRemoteContent ? { ...fallback, ...remote } : fallback;
    } catch (error) {
      console.warn("Supabase content unavailable; using the bundled site content.", error);
      return fallback;
    }
  }

  async function recordInquiry(inquiry) {
    if (!isConfigured()) return false;
    await apiRequest(`/rest/v1/${TABLES.inquiries}`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: inquiry,
    });
    return true;
  }

  async function signIn(email, password) {
    return apiRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email, password },
    });
  }

  async function signOut(token) {
    if (!token) return;
    await apiRequest("/auth/v1/logout", { method: "POST", token });
  }

  async function getAdminRows(table, token) {
    if (!Object.values(TABLES).includes(table)) throw new Error("Unknown content table.");
    const order = table === TABLES.news
      ? "published_at.desc,id.desc"
      : table === TABLES.inquiries || table === TABLES.media
        ? "created_at.desc"
        : "sort_order.asc,id.asc";
    return apiRequest(`/rest/v1/${table}?select=*&order=${encodeURIComponent(order)}`, { token });
  }

  async function saveAdminRow(table, row, token) {
    if (!Object.values(TABLES).includes(table)) throw new Error("Unknown content table.");
    const body = { ...row };
    if (table === TABLES.news && !body.id) delete body.id;
    return apiRequest(`/rest/v1/${table}?on_conflict=id`, {
      method: "POST",
      token,
      headers: { Prefer: "return=representation,resolution=merge-duplicates" },
      body,
    });
  }

  function encodedStoragePath(path) {
    return String(path).split("/").map((part) => encodeURIComponent(part)).join("/");
  }

  function mediaPublicUrl(path) {
    return `${config().url}/storage/v1/object/public/${MEDIA_BUCKET}/${encodedStoragePath(path)}`;
  }

  async function storageRequest(path, options = {}) {
    if (!isConfigured()) throw new Error("Supabase is not configured.");
    const settings = config();
    const response = await fetch(`${settings.url}/storage/v1${path}`, {
      method: options.method || "GET",
      headers: {
        apikey: settings.anonKey,
        Authorization: `Bearer ${options.token || settings.anonKey}`,
        ...options.headers,
      },
      body: options.body,
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    return parseResponse(response);
  }

  async function removeStorageObject(storagePath, token) {
    return storageRequest(`/object/${MEDIA_BUCKET}/${encodedStoragePath(storagePath)}`, {
      method: "DELETE",
      token,
    });
  }

  async function uploadMedia(blob, details, token) {
    if (!(blob instanceof Blob) || blob.type !== "image/webp") throw new Error("Only optimized WebP files can be uploaded.");
    const folder = ["products", "categories", "locations", "library"].includes(details.folder) ? details.folder : "library";
    const uuid = globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const month = new Date().toISOString().slice(0, 7).replace("-", "/");
    const storagePath = `${folder}/${month}/${uuid}.webp`;
    await storageRequest(`/object/${MEDIA_BUCKET}/${encodedStoragePath(storagePath)}`, {
      method: "POST",
      token,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "31536000",
        "x-upsert": "false",
      },
      body: blob,
    });
    const media = {
      bucket_id: MEDIA_BUCKET,
      storage_path: storagePath,
      public_url: mediaPublicUrl(storagePath),
      original_name: String(details.originalName || "image").slice(0, 500),
      mime_type: "image/webp",
      width: details.width,
      height: details.height,
      size_bytes: blob.size,
    };
    try {
      const rows = await apiRequest(`/rest/v1/${TABLES.media}`, {
        method: "POST",
        token,
        headers: { Prefer: "return=representation" },
        body: media,
      });
      return Array.isArray(rows) ? rows[0] : { ...media, ...rows };
    } catch (error) {
      try { await removeStorageObject(storagePath, token); } catch { /* Avoid masking the metadata error. */ }
      throw error;
    }
  }

  async function getMediaUsage(publicUrl, token) {
    return apiRequest("/rest/v1/rpc/hls_get_media_usage", {
      method: "POST",
      token,
      body: { p_url: publicUrl },
    });
  }

  async function deleteMedia(media, token) {
    const usage = await getMediaUsage(media.public_url, token);
    const total = Object.values(usage || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
    if (total) throw new Error(`這張圖片仍被 ${total} 筆網站內容使用，請先從內容中移除。`);
    await removeStorageObject(media.storage_path, token);
    await apiRequest(`/rest/v1/${TABLES.media}?id=eq.${encodeURIComponent(media.id)}`, {
      method: "DELETE",
      token,
      headers: { Prefer: "return=minimal" },
    });
    return true;
  }

  async function recordVisit() {
    if (location.hostname !== "sora4106.github.io") return null;

    const endpoint = "https://page-views-api.ratneshc.com/api/v1";
    const query = new URLSearchParams({ site: "sora4106.github.io", path: "/hlsfrp/" });
    const tracked = await fetch(`${endpoint}/track?${query}`, {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!tracked.ok) throw new Error(`Visit tracking failed: ${tracked.status}`);

    const response = await fetch(`${endpoint}/views?${query}`, {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error(`Visit count failed: ${response.status}`);
    const result = await response.json();
    return Number.isFinite(Number(result.views)) ? Number(result.views) : null;
  }

  window.HLSContentService = Object.freeze({
    TABLES,
    isConfigured,
    setConfig,
    getSiteData,
    recordInquiry,
    signIn,
    signOut,
    getAdminRows,
    saveAdminRow,
    uploadMedia,
    getMediaUsage,
    deleteMedia,
    recordVisit,
  });
})();
