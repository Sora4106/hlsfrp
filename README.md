# 好利生實業新版網站

好利生實業股份有限公司的企業網站，整合公司介紹、產品分類、產品說明、歷史消息、三地聯絡資料與圖片，支援桌機與手機瀏覽。

## 網站內容

- 繁中、簡中、英文與泰文介面
- 首次依瀏覽器語言顯示對應語系，並可手動切換
- 4 大產品分類、11 個產品詳情頁
- 11 篇歷史消息
- 台灣、泰國、廈門聯絡資訊
- 64 個本地圖片資產
- 可放大產品圖、手機選單、響應式排版
- 詢價表單目前以 Email 寄送，資料層已預留 Supabase 接入點

## 本機預覽

網站沒有套件依賴。在專案目錄執行：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

開啟 `http://127.0.0.1:4173/#/home`。

## 部署

`.github/workflows/deploy-pages.yml` 會在推送到 `main` 後部署 GitHub Pages。GitHub Repository Settings → Pages → Build and deployment 的 Source 請選擇 **GitHub Actions**。

## 內容維護

- 公司、產品、聯絡與消息資料：[content.js](content.js)
- 頁面組版與互動：[app.js](app.js)
- 視覺樣式：[styles.css](styles.css)
- 原始圖片：`public/assets/legacy/`
- 網站載入用 WebP 與縮圖：`public/assets/optimized/`
- 語系偵測與翻譯工具：[localization.js](localization.js)
- 資料來源抽象層：[content-service.js](content-service.js)

每次正式推送前須遞增根目錄的 `VERSION`，並建立相同版本的 Git 標籤；版本號不會顯示在網站畫面。

日後接 Supabase 時，保留 `HLSContentService.getSiteData()` 的回傳格式即可，不需要改寫畫面。建議資料表與安全設定請見 [docs/supabase-roadmap.md](docs/supabase-roadmap.md)。

## 維護與驗證工具

Windows PowerShell 可使用：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-site.ps1
python scripts/optimize-images.py
python scripts/dom-smoke-test.py
```

盤點與瀏覽器驗證輸出位於 `research/`，不會提交到 Git。
