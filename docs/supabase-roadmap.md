# Supabase 串接規劃

目前網站以 `content.js` 作為版本化內容來源，UI 只透過 `HLSContentService.getSiteData()` 取得資料。這個邊界讓網站可以先部署，日後再把內容與詢價資料移到 Supabase。

## 建議資料表

| 資料表 | 用途 | 主要欄位 |
| --- | --- | --- |
| `product_categories` | 產品大分類 | `id`, `slug`, `name_zh`, `name_en`, `description_zh`, `description_en`, `sort_order`, `published` |
| `products` | 產品內容 | `id`, `category_id`, `slug`, `name_zh`, `name_en`, `summary_zh`, `summary_en`, `features`, `applications_zh`, `applications_en`, `specifications_zh`, `specifications_en`, `published` |
| `product_images` | 產品圖片及排序 | `id`, `product_id`, `storage_path`, `alt_zh`, `alt_en`, `is_spec`, `sort_order` |
| `news` | 歷史消息與新消息 | `id`, `slug`, `title_zh`, `title_en`, `summary_zh`, `summary_en`, `body_zh`, `body_en`, `published_at`, `source`, `published` |
| `locations` | 區域據點 | `id`, `region_zh`, `region_en`, `company_zh`, `company_en`, `address_zh`, `address_en`, `phone`, `fax`, `email`, `website`, `sort_order` |
| `inquiries` | 網站詢價 | `id`, `name`, `email`, `phone`, `message`, `created_at`, `status` |

圖片可搬到 Supabase Storage 的 `site-assets` bucket，前端資料仍回傳目前 `content.js` 使用的圖片網址陣列。

## 安全原則

- 前端只能使用 Supabase anon key，不可放入 service role key。
- 所有資料表開啟 Row Level Security。
- 匿名訪客只能讀取 `published = true` 的內容。
- `inquiries` 只允許匿名 `INSERT`，不允許匿名 `SELECT`、`UPDATE` 或 `DELETE`。
- 建議為詢價端點加上 CAPTCHA、速率限制與資料長度驗證。
- 後台編輯使用已登入管理者角色，並用獨立 policy 控制。

## 前端切換方式

在 `content-service.js` 內將本地回傳替換為 Supabase 查詢，最後整理成與 `window.HLS_DATA` 相同的結構。查詢失敗時可以回退到本地內容，確保企業網站仍可瀏覽。

