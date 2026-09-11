# Supabase 串接設計

網站會先透過 `HLSContentService.getSiteData()` 讀取 Supabase；未設定、連線失敗或資料庫尚無任何內容時，會回退到版本化的 `content.js`。

## 資料表

所有新增表格均使用 `hls_` 前綴，避免與同一個 Supabase 專案內的其他系統混淆。

| 資料表 | 用途 |
| --- | --- |
| `hls_admins` | 可使用網站管理頁面的 Supabase Auth 使用者 |
| `hls_product_categories` | 產品大分類與排序 |
| `hls_products` | 產品、多語內容、圖片與發布狀態 |
| `hls_news` | 消息、多語內文、日期與發布狀態 |
| `hls_locations` | 台灣、泰國等服務據點 |
| `hls_inquiries` | 前台送出的網站詢價與處理狀態 |
| `hls_media` | Supabase Storage 圖片的網址、路徑、尺寸與檔案資訊 |

多語欄位使用 JSONB 保存繁中、簡中、英文與泰文。新上傳圖片會先在瀏覽器轉成 WebP，檔案本體保存於 `hls-site-assets` Storage bucket，並由 `hls_media` 建立可管理的索引；內容欄位記錄該圖片的公開網址。

## 安全設計

- 前端只使用 publishable／anon key，不使用 `service_role` 或其他秘密金鑰。
- 所有資料表均開啟 Row Level Security。
- 公開前台只能呼叫 `hls_get_site_content()`，只會取得 `published = true` 的內容。
- 匿名訪客只能新增 `hls_inquiries`，不能讀取詢價、草稿或管理者名單。
- 只有同時通過 Supabase Auth 且列於 `hls_admins` 的使用者可編輯內容及查看詢價。
- 只有管理者可新增或刪除 `hls-site-assets` 內的圖片；公開 bucket 只提供網站顯示圖片所需的讀取能力。
- 圖片刪除前會檢查產品、分類與據點是否仍在引用，避免前台產生失效圖片。
- 管理登入資訊只保存在瀏覽器分頁的 `sessionStorage`，關閉分頁後即失效。

正式對外大量投放廣告前，仍建議在詢價流程增加 CAPTCHA 或 Supabase Edge Function 的伺服器端速率限制。
