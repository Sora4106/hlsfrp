"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ["localization.js", "content.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
}

const data = sandbox.window.HLS_DATA;
const sql = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const json = (value) => `${sql(JSON.stringify(value))}::jsonb`;
const texts = (items = []) => items.length ? `array[${items.map(sql).join(", ")}]::text[]` : "'{}'::text[]";
const bool = (value) => value ? "true" : "false";
const lines = [
  "-- Generated from content.js. Re-run node scripts/generate-supabase-seed.js after bundled content changes.",
  "begin;",
  "",
];

data.categories.forEach((item, index) => {
  lines.push(`insert into public.hls_product_categories (id, name, description, image, sort_order, published) values (${sql(item.id)}, ${json(item.name)}, ${json(item.description)}, ${sql(item.image)}, ${index}, ${bool(true)}) on conflict (id) do update set name = excluded.name, description = excluded.description, image = excluded.image, sort_order = excluded.sort_order;`);
});

lines.push("");
data.products.forEach((item, index) => {
  lines.push(`insert into public.hls_products (id, category_id, name, summary, features, applications, specifications, images, spec_images, videos, sort_order, published) values (${sql(item.id)}, ${sql(item.category)}, ${json(item.name)}, ${json(item.summary)}, ${json(item.features || [])}, ${json(item.applications)}, ${json(item.specifications)}, ${texts(item.images)}, ${texts(item.specImages)}, ${texts(item.videos || [])}, ${index}, ${bool(true)}) on conflict (id) do update set category_id = excluded.category_id, name = excluded.name, summary = excluded.summary, features = excluded.features, applications = excluded.applications, specifications = excluded.specifications, images = excluded.images, spec_images = excluded.spec_images, sort_order = excluded.sort_order;`);
});

lines.push("");
data.news.forEach((item, index) => {
  lines.push(`insert into public.hls_news (id, title, summary, body, source, author, views, published_at, sort_order, published) values (${Number(item.id)}, ${json(item.title)}, ${json(item.summary)}, ${json(item.body || [])}, ${json(item.source)}, ${sql(item.author)}, ${Number(item.views) || 0}, ${sql(item.date)}::date, ${index}, ${bool(true)}) on conflict (id) do update set title = excluded.title, summary = excluded.summary, body = excluded.body, source = excluded.source, author = excluded.author, views = excluded.views, published_at = excluded.published_at, sort_order = excluded.sort_order;`);
});

lines.push("");
data.contacts.forEach((item, index) => {
  lines.push(`insert into public.hls_locations (id, region, company, address, image, phone, fax, email, website, line, sort_order, published) values (${sql(item.id)}, ${json(item.region)}, ${json(item.company)}, ${json(item.address)}, ${sql(item.image)}, ${sql(item.phone)}, ${sql(item.fax)}, ${sql(item.email)}, ${sql(item.website)}, ${sql(item.line)}, ${index}, ${bool(true)}) on conflict (id) do update set region = excluded.region, company = excluded.company, address = excluded.address, image = excluded.image, phone = excluded.phone, fax = excluded.fax, email = excluded.email, website = excluded.website, line = excluded.line, sort_order = excluded.sort_order;`);
});

lines.push("", "select setval(pg_get_serial_sequence('public.hls_news', 'id'), greatest(coalesce((select max(id) from public.hls_news), 1), 1));", "", "commit;", "");
fs.mkdirSync(path.join(root, "supabase"), { recursive: true });
fs.writeFileSync(path.join(root, "supabase", "seed.sql"), lines.join("\n"), "utf8");
console.log(`Generated supabase/seed.sql with ${data.categories.length} categories, ${data.products.length} products, ${data.news.length} news articles and ${data.contacts.length} locations.`);
