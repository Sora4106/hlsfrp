# Supabase 啟用步驟

這份說明適用於新的獨立官網 Supabase 專案。若正從原本共用的專案搬遷，請先閱讀 [new-supabase-migration.md](new-supabase-migration.md)。

## 1. 建立官網資料表

在 Supabase Dashboard 的 **SQL Editor** 依序執行：

1. `supabase/schema.sql`
2. `supabase/seed.sql`（只在要匯入網站內建初始內容時執行）

`schema.sql` 會建立全部以 `hls_` 開頭的資料表、RLS 權限、公開前台內容函式與圖片管理權限。`seed.sql` 會匯入目前的 4 個產品分類、11 項產品、11 篇消息，以及台灣與泰國 2 個服務據點；不含廈門據點。

官網目前為「電子郵件自行聯絡」模式，前台不會蒐集或寫入詢問資料。若是舊專案升級，請另外執行 `supabase/disable-public-inquiry-storage.sql`，它只會停用匿名寫入，不會刪除原有歷史紀錄。

舊資料庫若尚未有產品影片欄位，可執行 `supabase/enable-youtube-video-links.sql`。這個欄位只儲存 YouTube 網址，不會把影片檔放進 Storage。

圖片重複判斷使用「原始檔名 + 原始檔案大小」。兩者都相同才會略過重複上傳；同名但大小不同的圖片仍可加入。

## 2. 圖片儲存空間

執行 `schema.sql` 時會自動建立公開的 `hls-site-assets` bucket，並設定為：

- File size limit：`10 MB`
- Allowed MIME types：`image/webp`

之後可在 Supabase Dashboard 的 **Storage** 查看這個 bucket；不需要手動建立。

後台接受 JPG、PNG、WebP、GIF、BMP、AVIF 等一般圖片；會先在使用者瀏覽器轉成最長邊 2400px 的 WebP，再上傳到 `hls-site-assets`。圖片本體放在 Storage，`hls_media` 只保存圖片索引、公開網址、尺寸與檔案資訊。

請不要為這個 bucket 開放 MP4 或 WebM：產品影片統一使用 YouTube。

## 3. 建立管理者

在 Supabase 的 **Authentication → Users** 建立管理帳號。建議關閉公開 Email sign-up，避免陌生人自行註冊。

接著在 SQL Editor 執行下列內容，將電子郵件改成實際管理者帳號：

```sql
insert into public.hls_admins (user_id)
select id from auth.users where email = 'your-admin@example.com'
on conflict (user_id) do nothing;
```

每一位可管理內容的同事，都要先有自己的 Authentication 使用者，再各自加入 `hls_admins`；不必共用密碼。

## 4. 填入公開連線資訊

在 Supabase **Project Settings → API** 複製 Project URL 與 Publishable key（舊介面可能顯示為 anon key），填入 `supabase-config.js`：

```js
window.HLS_SUPABASE = Object.freeze({
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY",
});
```

Publishable／anon key 是前端可公開的金鑰，實際存取邊界由 `schema.sql` 的 RLS 控制。絕對不要把 `service_role`、Secret key 或資料庫密碼放進網站或交給同事。

## 5. 圖片與影片操作

- **圖片**：在後台「圖片庫」上傳，或把已最佳化的 WebP 放到 GitHub 的 `public/assets/optimized/` 後推送；後者請在內容欄位填入 `public/assets/optimized/檔名.webp`。圖片庫只能瀏覽透過後台上傳至 Supabase 的圖片。
- **影片**：先上傳至公司的 YouTube 頻道，再到產品編輯頁的「產品影片（YouTube 網址）」貼上分享網址；一行一部，最多 12 部。後台支援一般觀看網址、`youtu.be` 短網址、Shorts、嵌入與直播網址，會轉成標準 YouTube 觀看連結。影片不會使用 Supabase Storage 容量。

## 6. 測試

- 開啟 `admin.html`，登入後確認可編輯產品、產品分類、消息與服務據點。
- 在「圖片庫」上傳一張 JPG 或 PNG，確認可預覽、複製網址，並可在產品、分類或據點的圖片欄位直接選圖。
- 再次上傳相同檔名與相同大小的圖片，確認該檔被略過；同批其他不同圖片仍正常上傳。
- 在產品貼上一個 YouTube 分享網址，勾選「顯示於網站前台」並儲存；確認公開產品頁可嵌入播放。
- 開啟前台聯絡頁，確認沒有姓名、信箱、電話或需求填寫欄位，且「開啟電子郵件」只會啟動使用者自己的郵件程式。
- 取消勾選「顯示於網站前台」的內容不會出現在公開網站。

如果 Supabase 暫時無法連線，前台仍會使用 `content.js` 的內建內容；管理頁會顯示連線錯誤，不會將秘密權限放進瀏覽器端。

## 7. 私下提供管理工具給同事

在專案資料夾執行：

```powershell
node scripts/build-portable-admin.js
```

把產生的 `portable-admin` 資料夾壓縮後私下傳給同事。同事解壓縮後直接雙擊「好利生網站內容管理.html」即可，不需要 Python、localhost 或安裝網站伺服器。

第一次開啟時，同事需填入 Project URL 與 Publishable Key，之後以自己的 Supabase 管理員 Email 和密碼登入。連線設定只保存在該電腦的瀏覽器；請勿輸入 Secret Key 或 `service_role`。

## GPT 批次內容流程

登入管理工具後：

1. 選擇「最新消息」、「產品」、「產品分類」或「服務據點」。
2. 按「下載新增範本」，或按「匯出目前資料」修改既有內容。
3. 將 JSON 檔交給 GPT，附上希望撰寫或修改的內容。
4. 請 GPT 依檔案內的 `gptPrompt` 與 `rules` 工作，只回傳完整 JSON。
5. 將 GPT 回傳內容存成 `.json` 並拖回管理頁，或直接貼入文字框。
6. 管理頁通過格式檢查後會顯示筆數與公開筆數，確認後才寫入 Supabase。

匯入只會新增或更新資料，不會刪除內容；新範本預設為 `published: false`，方便人工檢查後再發布。
