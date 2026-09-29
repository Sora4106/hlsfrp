# 建立獨立 Supabase 官網專案

這個官網不搬遷舊共用資料庫資料，直接以目前 Git 內的官網內容建立新的獨立專案。

## 名稱與範圍

- **Supabase Project 名稱**：`hlsfrp-official-site`
- **資料庫名稱**：使用 Supabase 預設的 `postgres`，不用額外建立資料庫。
- **圖片 bucket**：`hls-site-assets`，由 `schema.sql` 自動建立。
- **官網資料表**：`hls_admins`、`hls_product_categories`、`hls_products`、`hls_news`、`hls_locations`、`hls_inquiries`、`hls_media`。

所有網站資料表均使用 `hls_` 前綴。`hls_inquiries` 僅保留作為舊功能相容資料表；目前官網不會蒐集或寫入訪客資料。

## 直接建立步驟

1. 在 Supabase 建立 Project，名稱填 `hlsfrp-official-site`；資料庫名稱保持 `postgres`。
2. 開啟新專案的 **SQL Editor**。
3. 先開啟並完整貼上 `supabase/schema.sql`，按 **Run**。
   - 建立所有 `hls_` 資料表、RLS 權限、公開內容函式與 `hls-site-assets` 圖片 bucket。
4. 再完整貼上 `supabase/seed.sql`，按 **Run**。
   - 建立目前官網的產品分類、產品、消息、台灣與泰國據點；不含廈門據點。
5. 到 **Authentication → Users** 建立管理帳號，接著在 SQL Editor 執行：

```sql
insert into public.hls_admins (user_id)
select id from auth.users where email = 'your-admin@example.com'
on conflict (user_id) do nothing;
```

6. 到 **Project Settings → API** 複製新專案的 Project URL 與 Publishable key，填入 `supabase-config.js`：

```js
window.HLS_SUPABASE = Object.freeze({
  url: "https://YOUR_NEW_PROJECT.supabase.co",
  anonKey: "YOUR_NEW_PUBLISHABLE_KEY",
});
```

7. 推送 GitHub 後，使用 `admin.html` 測試登入、發布內容、上傳圖片與 YouTube 影片連結。

## 圖片與影片規則

- 後台圖片：上傳一般圖片後會轉成 WebP，寫入新專案的 `hls-site-assets`。
- GitHub 圖片：WebP 放進 `public/assets/optimized/` 後推送，內容欄填 `public/assets/optimized/檔名.webp`。
- 產品影片：先上傳到 YouTube，後台每行貼一個分享網址；Supabase 不儲存影片檔。

不要將 `service_role`、Secret key 或資料庫密碼填進 `supabase-config.js` 或管理後台。
