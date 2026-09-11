"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "portable-admin", "好利生網站內容管理.html"), "utf8");
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];

assert.equal(scripts.length, 1, "portable admin should contain one inline script");
assert.doesNotThrow(() => new Function(scripts[0][1]), "embedded JavaScript should compile");
assert.doesNotMatch(html, /<script[^>]+src=/i, "portable admin should not load local scripts");
assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i, "portable admin should not load a local stylesheet");
assert.match(html, /hls_media/);
assert.match(html, /data-media-drop/);
assert.match(html, /image\/webp/);

console.log("Portable admin static check passed.");
