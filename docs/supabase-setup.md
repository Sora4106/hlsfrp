# Supabase 啟用步驟

## 1. 建立網站專用資料表

在既有 Supabase 專案的 SQL Editor 依序執行：

1. `supabase/schema.sql`
2. `supabase/seed.sql`

第二個檔案會匯入目前網站的 4 個產品分類、11 項產品、11 篇消息，以及台灣與泰國 2 個服務據點。廈門據點不會被匯入。

如果先前已執行過舊版 `schema.sql`，請再執行一次最新版；它會新增 `hls_media` 圖片索引表與 Storage 權限，不會刪除既有內容。

## 2. 建立圖片儲存空間

到 Supabase Dashboard 的 **Storage** 建立一個 bucket：

- Name：`hls-site-assets`
- Public bucket：開啟
- Allowed MIME types：`image/webp`
- File size limit：`10 MB`

管理工具會在使用者電腦的瀏覽器中，將 JPG、PNG、WebP、GIF、BMP 或 AVIF 自動縮放至最長邊 2400px、轉成 WebP，再上傳至這個 bucket。檔案本體由 Supabase Storage 保存，`hls_media` 資料表則保存公開網址、儲存路徑、原始檔名、尺寸及檔案大小，供網站與管理工具取用。

## 3. 建立管理者

在 Supabase 的 Authentication > Users 建立管理帳號。為避免陌生人自行註冊，建議關閉公開 Email sign-up。

接著在 SQL Editor 執行下列內容，將電子郵件改成實際管理者帳號：

```sql
insert into public.hls_admins (user_id)
select id from auth.users where email = 'your-admin@example.com'
on conflict (user_id) do nothing;
```

## 4. 填入公開連線資訊

在 Supabase Project Settings > API 複製 Project URL 與 publishable key（舊專案可能顯示為 anon key），填入 `supabase-config.js`：

```js
window.HLS_SUPABASE = Object.freeze({
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY",
});
```

publishable／anon key 本來就是前端公開金鑰，安全邊界由 `schema.sql` 的 RLS 控制。請勿把 `service_role`、secret key 或資料庫密碼放進網站檔案。

## 5. 測試

- 開啟 `admin.html`，登入後確認可編輯產品、產品分類、消息與服務據點。
- 在「圖片庫」上傳一張 JPG 或 PNG，確認可預覽、複製網址，並可在產品的圖片欄位直接選圖上傳。
- 從前台聯絡頁送出測試詢價，再到「詢價紀錄」確認資料並更新處理狀態。
- 取消勾選「顯示於網站前台」的內容不會出現在公開網站。

如果 Supabase 暫時無法連線，前台仍會使用 `content.js` 的內建內容；管理頁則會顯示連線錯誤，不會把秘密權限移到瀏覽器端。

## 6. 私下提供管理工具給同事

在專案資料夾執行：

```powershell
node scripts/build-portable-admin.js
```

把產生的 `portable-admin` 資料夾壓縮後私下傳給同事。同事解壓縮後直接雙擊「好利生網站內容管理.html」即可，不需要 Python、localhost 或安裝網站伺服器。

第一次開啟時，同事需填入 Project URL 與 Publishable Key，之後以自己的 Supabase 管理員 Email 和密碼登入。這些公開連線設定只保存在該電腦的瀏覽器；請勿輸入 Secret Key 或 `service_role`。

管理頁已從 GitHub Pages 的發布流程排除，`portable-admin` 產出資料夾也不會加入 Git。

## GPT 批次內容流程

登入管理工具後：

1. 選擇「最新消息」、「產品」、「產品分類」或「服務據點」。
2. 按「下載新增範本」，或按「匯出目前資料」修改既有內容。
3. 將 JSON 檔交給 GPT，附上希望撰寫或修改的內容。
4. 請 GPT 依檔案內的 `gptPrompt` 與 `rules` 工作，只回傳完整 JSON。
5. 將 GPT 回傳內容存成 `.json` 並拖回管理頁，或直接貼入文字框。
6. 管理頁通過格式檢查後會顯示筆數與公開筆數，確認後才寫入 Supabase。

匯入只會新增或更新資料，不會刪除內容；新範本預設為 `published: false`，方便人工檢查後再發布。
