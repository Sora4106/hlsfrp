"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputDirectory = path.join(root, "portable-admin");
const outputFile = path.join(outputDirectory, "好利生網站內容管理.html");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

let html = read("admin.html");
const css = read("admin.css");
const scripts = ["localization.js", "content.js", "supabase-config.js", "content-service.js", "admin.js"]
  .map((file) => `/* ${file} */\n${read(file).replaceAll("</script", "<\\/script")}`)
  .join("\n\n");
const logo = fs.readFileSync(path.join(root, "public", "assets", "optimized", "11_n090.webp")).toString("base64");

html = html
  .replace(
    /<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/i,
    '<meta http-equiv="Content-Security-Policy" content="default-src data: blob:; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: https://*.supabase.co; media-src data: blob: https://*.supabase.co; connect-src https://*.supabase.co; object-src \'none\'; base-uri \'none\'; form-action \'none\'" />'
  )
  .replace(/\s*<link rel="icon"[^>]*\/>/i, "")
  .replace(/\s*<link rel="stylesheet" href="admin\.css"\s*\/>/i, () => `\n    <style>\n${css}\n    </style>`)
  .replace(/\s*<script src="(?:localization|content|supabase-config|content-service|admin)\.js" defer><\/script>/gi, "")
  .replaceAll('src="public/assets/optimized/11_n090.webp"', `src="data:image/webp;base64,${logo}"`)
  .replaceAll('href="index.html#/home"', 'href="https://sora4106.github.io/hlsfrp/#/home"')
  .replace("</body>", () => `  <script>\n${scripts}\n  </script>\n  </body>`);

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputFile, html, "utf8");
fs.writeFileSync(
  path.join(outputDirectory, "使用說明.txt"),
  [
    "好利生網站內容管理工具",
    "",
    "1. 直接雙擊「好利生網站內容管理.html」。不需要安裝或啟動任何程式。",
    "2. 第一次使用時貼上 Supabase Project URL 與 Publishable Key。",
    "3. 使用管理員自己的 Email 與密碼登入。",
    "4. 到「媒體庫」即可拖曳或選擇圖片、MP4 或 WebM；圖片會自動轉成 WebP，影片會保留格式後上傳。",
    "5. 若 Windows 詢問開啟方式，選擇 Microsoft Edge 或 Google Chrome。",
    "",
    "注意：",
    "- 電腦必須能連上網路。",
    "- 不要把 Secret Key、service_role key 或資料庫密碼填入管理工具。",
    "- 每位同事應使用自己的 Supabase 管理帳號。",
    "- Supabase 必須先建立公開的 hls-site-assets Storage bucket，並執行最新版 schema.sql。",
  ].join("\r\n"),
  "utf8"
);

console.log(`Portable admin created: ${outputFile}`);
