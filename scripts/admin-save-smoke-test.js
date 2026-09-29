"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "..", "admin.js"), "utf8");
const start = source.indexOf("  function imageUrls");
const end = source.indexOf("\n  async function saveEditor", start);
assert.ok(start >= 0 && end > start, "image, video URL and form serialization functions were not found");

const context = { FormData, URL };
const rowFromForm = vm.runInNewContext(`
  (function () {
    const state = { type: "products", rows: [], selectedIndex: -1 };
    const today = () => "2026-09-11";
    const LEGACY_PLACEHOLDER_IMAGE = "public/assets/optimized/example.webp";
    const localized = (zh = "", en = "", th = "") => ({ zh, "zh-CN": zh, en, th });
    ${source.slice(start, end)}
    return rowFromForm;
  })()
`, context);

function productForm(published) {
  const form = new FormData();
  form.set("id", "sensors");
  form.set("category_id", "farming");
  form.set("name_zh", "智慧環境監測感測器");
  form.set("images", "public/assets/optimized/example.webp\nhttps://example.supabase.co/storage/v1/object/public/hls-site-assets/products/sensor.webp");
  form.set("videos", "https://youtu.be/M7lc1UVf-VE");
  form.set("sort_order", "12");
  if (published) form.set("published", "on");
  return form;
}

assert.equal(rowFromForm(productForm(true)).published, true, "checked content must be published");
assert.equal(rowFromForm(productForm(false)).published, false, "unchecked content must remain a draft");
assert.deepEqual(
  [...rowFromForm(productForm(true)).videos],
  ["https://www.youtube.com/watch?v=M7lc1UVf-VE"],
  "YouTube product video URLs must be canonicalized and saved with the product"
);
assert.deepEqual(
  [...rowFromForm(productForm(true)).images],
  ["https://example.supabase.co/storage/v1/object/public/hls-site-assets/products/sensor.webp"],
  "legacy placeholder images must not be saved back to a product"
);
assert.match(source, /function removeImageValue\(target, index\)/, "image removal handler is required");
assert.match(source, /uploadImageFiles\(fileList, target = "", multiple = true\)/, "uploads must retain their originating image field");

async function testSessionRefresh() {
  const refreshStart = source.indexOf("  function normalizeSession");
  const refreshEnd = source.indexOf("\n  function localized", refreshStart);
  assert.ok(refreshStart >= 0 && refreshEnd > refreshStart, "session refresh functions were not found");
  let stored = null;
  const sessionTools = vm.runInNewContext(`
    (function () {
      const SESSION_KEY = "hls-admin-session";
      const state = { session: { access_token: "expired-token", refresh_token: "refresh-token", expires_at: 1 } };
      let refreshPromise = null;
      const $ = () => ({ hidden: false });
      ${source.slice(refreshStart, refreshEnd)}
      return { activeAccessToken, state };
    })()
  `, {
    Date,
    sessionStorage: { setItem: (_key, value) => { stored = JSON.parse(value); }, removeItem() {} },
    window: {
      HLSContentService: {
        refreshSession: async () => ({
          access_token: "refreshed-token",
          refresh_token: "next-refresh-token",
          expires_in: 3600,
        }),
      },
    },
  });
  assert.equal(await sessionTools.activeAccessToken(), "refreshed-token");
  assert.equal(sessionTools.state.session.refresh_token, "next-refresh-token");
  assert.equal(stored.access_token, "refreshed-token");
}

testSessionRefresh()
  .then(() => console.log("Admin save and session refresh tests passed."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
