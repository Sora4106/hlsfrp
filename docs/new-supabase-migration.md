# 轉移至獨立 Supabase 專案

## 建議名稱與範圍

- **Supabase Project 名稱**：`hlsfrp-official-site`
- **Supabase 資料庫名稱**：保留 Supabase 預設的 `postgres`，不需要另建資料庫。
- **Storage bucket 名稱**：`hls-site-assets`
- **網站專用資料表**：`hls_admins`、`hls_product_categories`、`hls_products`、`hls_news`、`hls_locations`、`hls_inquiries`、`hls_media`

所有官網資料表已用 `hls_` 前綴，能與其他系統清楚區隔。

## 搬遷順序

### 1. 先備份舊專案

從舊 Supabase 匯出下列網站內容：

1. `hls_product_categories`
2. `hls_products`
3. `hls_news`
4. `hls_locations`

如有保留歷史詢問的業務或法定需求，再另外匯出 `hls_inquiries` 保存；前台已不再寫入此表，因此預設不必遷移到新官網資料庫。

不要直接匯入：

- `hls_admins`：其中是舊專案 Authentication 使用者 UUID，新專案會不同，必須重新建立帳號與授權。
- `hls_media`：其中 Storage 公開網址指向舊專案；請重新上傳圖片或改為 GitHub 靜態圖片路徑。

### 2. 建立新 Supabase Project

在 Supabase 建立 Project，名稱填 `hlsfrp-official-site`，選擇最接近主要管理人員的可用區域。資料庫名稱維持系統預設 `postgres` 即可。

### 3. 建立結構與圖片 bucket

1. 在新專案 SQL Editor 執行最新 `supabase/schema.sql`。
2. 在 Storage 新建 Public bucket `hls-site-assets`。
3. 開啟檔案大小限制，填 `10 MB`。
4. 開啟 MIME 類型限制，只填 `image/webp`。

接著依內容來源選一個方式：

- **以 Git 內現有內容作為起點**：執行 `supabase/seed.sql`。
- **以舊資料庫最新內容作為起點**：匯入先前備份的四張內容表；順序必須是分類、產品、消息、據點。這種方式通常不需再執行 `seed.sql`，避免把新資料覆蓋成範例內容。

### 4. 重新建立後台帳號

在新專案 **Authentication → Users** 建立每位同事的 Email／密碼帳號，再於 SQL Editor 對每個管理者執行：

```sql
insert into public.hls_admins (user_id)
select id from auth.users where email = 'colleague@example.com'
on conflict (user_id) do nothing;
```

### 5. 處理圖片與影片

- **既有圖片**：重新從後台上傳會自動轉成 WebP 並寫入新 bucket；或者將 WebP 放入 `public/assets/optimized/`、推送 GitHub，然後把欄位更新為 `public/assets/optimized/檔名.webp`。
- **YouTube 影片**：先上傳至公司的 YouTube 頻道，再把影片分享網址貼進產品的「產品影片」欄位。每行一個網址；後台保存 URL，Supabase 不保存影片檔。
- **舊 MP4／WebM 連結**：不會在新前台播放，請改成對應的 YouTube 分享網址。

### 6. 切換網站連線

在新專案 **Project Settings → API** 取得：

- Project URL
- Publishable key（或舊介面顯示的 anon key）

填入 `supabase-config.js`：

```js
window.HLS_SUPABASE = Object.freeze({
  url: "https://YOUR_NEW_PROJECT.supabase.co",
  anonKey: "YOUR_NEW_PUBLISHABLE_KEY",
});
```

不要使用 `service_role`、Secret key 或資料庫密碼。這些連線資料完成後，再推送 GitHub。

### 7. 切換前檢查

在推送與 DNS／自訂網域切換前，使用新專案的帳號完成下列確認：

- 可登入 `admin.html`。
- 可建立、勾選發布並儲存一筆測試內容。
- 可上傳一張圖片、從圖片庫選取、並在前台看到圖片。
- 可貼上 YouTube 分享網址，並在已發布產品頁嵌入播放。
- 內容、分類、產品關聯與服務據點都正確，且沒有廈門據點。

舊共用專案請在新專案驗收後再保留作為備份或依原系統需求處理；不要在切換前刪除。
