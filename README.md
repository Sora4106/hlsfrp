# 好利生實業官方網站

好利生實業股份有限公司的多語系靜態網站，內容涵蓋公司沿革、四大產品分類、11 項產品、歷史消息、台灣與泰國服務據點，以及專案詢價。

## 本機預覽

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

開啟 `http://127.0.0.1:4173/?skipWelcome=1#/home`。

## 內容與程式結構

- `content.js`：未連線 Supabase 時使用的內建內容與多語資料
- `content-service.js`：Supabase 讀寫、登入、圖片儲存及內建內容回退
- `supabase-config.js`：Supabase Project URL 與公開金鑰
- `admin.html`、`admin.js`、`admin.css`：內容管理頁面
- `scripts/build-portable-admin.js`：產生可直接雙擊的單檔管理工具
- `supabase/schema.sql`：全部以 `hls_` 開頭的資料表、RLS、圖片權限與公開內容函式
- `supabase/seed.sql`：由目前網站內容產生的初始資料
- `public/assets/legacy/`：舊站原始素材
- `public/assets/optimized/`：網站使用的 WebP 圖片

Supabase 的完整啟用步驟請見 [docs/supabase-setup.md](docs/supabase-setup.md)。未設定或暫時無法連線時，前台會自動使用 `content.js`，不會顯示空白網站。

## 圖片管理

管理頁的「圖片庫」可批次拖曳一般圖片，產品、分類與據點編輯表單也可直接選圖。瀏覽器會先將圖片最長邊縮至 2400px 並轉成 WebP，再把檔案存入公開的 Supabase Storage bucket `hls-site-assets`；`hls_media` 資料表保存圖片索引與公開網址。仍被內容引用的圖片不允許刪除。

## 發布

推送到 `main` 後，`.github/workflows/deploy-pages.yml` 會自動發布至 GitHub Pages。請先在 GitHub Repository Settings 的 Pages 將 Source 設為 **GitHub Actions**。

## 驗證

```powershell
python scripts/dom-smoke-test.py
node --check app.js
node --check admin.js
node --check content-service.js
node scripts/admin-save-smoke-test.js
node scripts/media-smoke-test.js
node scripts/portable-admin-smoke-test.js
```

若更新 `content.js` 的預設內容，請重新產生種子資料：

```powershell
node scripts/generate-supabase-seed.js
```

若要把不公開的管理工具交給同事，請產生單檔版本：

```powershell
node scripts/build-portable-admin.js
```

將 `portable-admin` 資料夾私下傳給同事即可。此資料夾已排除於 Git，GitHub Pages 也不會發布管理頁。
