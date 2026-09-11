"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

async function testWebpConversion() {
  const source = fs.readFileSync(path.join(root, "admin.js"), "utf8");
  const start = source.indexOf("  async function decodeImage");
  const end = source.indexOf("\n  function setUploadedUrls", start);
  assert.ok(start >= 0 && end > start, "image conversion functions were not found");

  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
      drawImage() {},
    }),
    toBlob: (callback, type) => callback(new Blob(["webp"], { type })),
  };
  const decoded = { width: 4000, height: 2000, close() {} };
  const context = {
    Blob,
    URL,
    Image: class {},
    window: { createImageBitmap: true },
    createImageBitmap: async () => decoded,
    document: { createElement: (tag) => tag === "canvas" ? canvas : {} },
  };
  const functions = vm.runInNewContext(`(function () {${source.slice(start, end)}; return { convertToWebp };})()`, context);
  const result = await functions.convertToWebp({ name: "factory-photo.png", type: "image/png", size: 1024 });
  assert.equal(result.width, 2400);
  assert.equal(result.height, 1200);
  assert.equal(result.blob.type, "image/webp");
}

async function testStorageWorkflow() {
  const requests = [];
  let usage = { categories: 0, products: 0, locations: 0 };
  const response = (payload, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => payload == null ? "" : JSON.stringify(payload),
  });
  const context = {
    Blob,
    URLSearchParams,
    console,
    Date,
    Math,
    location: { hostname: "localhost" },
    localStorage: { getItem: () => null, setItem() {} },
    fetch: async (url, options = {}) => {
      requests.push({ url, options });
      if (url.includes("hls_get_media_usage")) return response(usage);
      if (url.includes("/rest/v1/hls_media") && options.method === "POST") {
        return response([{ id: "media-id", ...JSON.parse(options.body) }]);
      }
      return response({});
    },
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000001" },
    window: {
      HLS_SUPABASE: { url: "https://example.supabase.co", anonKey: "publishable-key-with-safe-length" },
      HLS_DATA: {},
    },
  };
  context.globalThis = context;
  vm.runInNewContext(fs.readFileSync(path.join(root, "content-service.js"), "utf8"), context);

  const media = await context.window.HLSContentService.uploadMedia(
    new Blob(["webp"], { type: "image/webp" }),
    { folder: "products", originalName: "product.png", width: 800, height: 600 },
    "admin-token"
  );
  assert.equal(media.mime_type, "image/webp");
  assert.match(media.public_url, /storage\/v1\/object\/public\/hls-site-assets\/products\//);
  assert.equal(requests[0].options.headers["Content-Type"], "image/webp");
  assert.ok(requests.some((item) => item.url.includes("/rest/v1/hls_media")), "hls_media metadata was not written");

  await context.window.HLSContentService.deleteMedia(media, "admin-token");
  assert.ok(requests.some((item) => item.url.includes("/storage/v1/object/hls-site-assets/") && item.options.method === "DELETE"));

  const requestCount = requests.length;
  usage = { categories: 0, products: 1, locations: 0 };
  await assert.rejects(
    context.window.HLSContentService.deleteMedia(media, "admin-token"),
    /仍被 1 筆網站內容使用/
  );
  assert.equal(requests.length, requestCount + 1, "referenced media should only perform the usage check");
}

async function main() {
  await testWebpConversion();
  await testStorageWorkflow();
  console.log("Media smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
