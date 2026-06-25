---
name: lazybot-plugin-dev
description: >
  Skill untuk membantu membuat, mengedit, dan mengembangkan plugin modular
  untuk LazyBot WhatsApp Bot. Aktif ketika user meminta membuat plugin,
  command, event, middleware, migration, atau fitur apapun untuk bot WhatsApp
  berbasis LazyBot. Juga aktif saat vibekoding: user minta fitur atau plugin
  baru untuk LazyBot.
---

# LazyBot Plugin Developer Skill

Kamu sedang bekerja di project **LazyBot** — WhatsApp bot modular berbasis Node.js + Baileys.
Baca `AGENTS.md` di folder `.agents/` untuk panduan lengkap arsitektur dan konvensi.

## Referensi Type & API (Baca Ini)

Project ini didistribusikan sebagai **compiled build** — tidak ada TypeScript source.
Gunakan file `.d.ts` berikut sebagai referensi type (baca dengan `view_file`):

| File | Isi |
|------|-----|
| `core/types/plugin.d.ts` | **Sumber utama** — semua interface: `SerializedMessage`, `CommandContext`, `MiddlewareContext`, `EventContext`, `Command`, `Middleware`, `Event` |
| `core/utils/http.d.ts` | `Http`, `PendingRequest`, `HttpResponse` class |
| `core/utils/storage.d.ts` | `Storage` class |
| `core/utils/helpers.d.ts` | Semua helper functions |
| `core/utils/converter.d.ts` | `imageToWebp`, `videoToWebp`, `toMp3`, dll. |
| `core/utils/debug.d.ts` | `dump()` function |
| `core/stubs/` | Template file stub untuk membuat komponen plugin |

> Selalu baca `.d.ts` dengan `view_file` sebelum menulis kode — type definitions adalah sumber kebenaran.

## Aturan Dasar

- Plugin ditulis dalam **JavaScript (.js)**, BUKAN TypeScript
- Semua file plugin ada di `workspace/<nama-plugin>/` (area developer)
- Nama plugin format: `@namespace/nama` (hanya huruf kecil + angka + tanda hubung)
- Gunakan `defineCommand`, `defineEvent`, `defineMiddleware` dari `@lazy/core/types/plugin`
- AI tidak bisa akses CLI — buat file manual pakai template dari `core/stubs/`

## Alur Membuat Plugin Baru

### Step 1: Buat struktur folder di workspace/
```
workspace/<nama-plugin>/
├── package.json          <- WAJIB, baca core/stubs/package.json.stub untuk template
├── commands/<nama>.js    <- baca core/stubs/command.js.stub
├── events/<nama>.js      <- baca core/stubs/event.js.stub
├── middlewares/<nama>.js <- baca core/stubs/middleware.js.stub
├── migrations/<nama>.js  <- baca core/stubs/migration.js.stub
└── configs/<nama>.json   <- baca core/stubs/config.json.stub
```

Baca isi stub terlebih dahulu dari `core/stubs/` sebelum membuat file!

### Step 2: package.json (dari stub)
```json
{
  "name": "@<username>/<plugin-name>",
  "type": "module",
  "version": "1.0.0",
  "description": "...",
  "author": "<username>",
  "keywords": [],
  "pluginDependencies": {},
  "dependencies": {}
}
```
> `<username>` diisi sesuai `global.AUTH_USER.username` yang login.

### Step 3: Command (commands/nama.js)
```js
import { defineCommand } from '@lazy/core/types/plugin';

export default defineCommand({
  name: 'nama-command',
  description: 'Deskripsi',
  aliases: ['alias1'],
  async execute(ctx) {
    // ctx: CommandContext — lihat core/types/plugin.d.ts untuk type lengkap
    const { msg, sock, db, cache, config, t, logger } = ctx;
    await msg.reply('teks balasan');
  },
});
```

### Step 4: Event (events/nama.js)
```js
import { defineEvent } from '@lazy/core/types/plugin';

export default defineEvent({
  event: 'messages.upsert', // nama event Baileys
  priority: 0,
  async execute(ctx) {
    // ctx: EventContext<'messages.upsert'> — lihat core/types/plugin.d.ts
    const { sock, db, eventData, cache, logger } = ctx;
  },
});
```

### Step 5: Middleware (middlewares/nama.js)
```js
import { defineMiddleware } from '@lazy/core/types/plugin';

export default defineMiddleware({
  event: 'command',  // 'command' atau event Baileys
  priority: -1,      // negatif = jalan lebih awal
  async handler(ctx) {
    // ctx: MiddlewareContext<'command'> — lihat core/types/plugin.d.ts
    const { payload, next, abort } = ctx;
    // return next()         → lanjutkan
    // return false          → stop chain
    // return abort('alasan')→ stop + log warning
    return next();
  },
});
```

## Context — Cara Baca Type yang Benar

Daripada menghafalkan semua property, **baca langsung dari `.d.ts`**:

```
core/types/plugin.d.ts   ← baca ini untuk SerializedMessage, CommandContext, dll.
```

Property paling sering dipakai dari `SerializedMessage` (`msg`):
```js
// Navigasi pesan
msg.chat, msg.fromMe, msg.flags.isGroup, msg.flags.isMedia

// Pengirim
msg.sender.id, msg.sender.pushName, msg.sender.pn

// Permissions grup
msg.permissions.sender.admin, msg.permissions.sender.superAdmin

// Body
msg.body.rawText, msg.body.command, msg.body.args, msg.body.argsText

// Quoted (cek undefined dulu!)
msg.quoted?.msg.rawText
msg.quoted?.downloadMedia()  // -> Buffer

// Actions
msg.reply(text)
msg.sendImage(buffer | { url }, caption?)
msg.sendVideo(buffer | { url }, caption?)
msg.sendAudio(buffer | { url }, ptt?)
msg.sendDocument(buffer | { url }, options?)
msg.sendSticker(buffer | { url })
msg.react(emoji)
msg.delete()
msg.downloadMedia()  // -> Buffer
```

## Utility (baca `core/utils/*.d.ts` untuk type lengkap)

```js
// HTTP — lihat core/utils/http.d.ts
import { Http } from '@lazy/core/utils/http';
const res = await Http.get(url);
const json = await res.json();
const file = await Http.getFromUrl(url); // { buffer, mime, ext, size, filename } | null
await Http.withToken(token).post(url, data);
await Http.timeout(5000).get(url);

// Storage — lihat core/utils/storage.d.ts
import { Storage } from '@lazy/core/utils/storage';
await Storage.save(buffer, { filename, subDir });
await Storage.saveTmp(buffer, { filename, ttlMs }); // auto-delete, default 5 menit
await Storage.getBuffer(filepath);
await Storage.exists(filepath);
await Storage.delete(filepath);

// Converter FFmpeg — lihat core/utils/converter.d.ts
import { imageToWebp, videoToWebp, toMp3 } from '@lazy/core/utils/converter';
await imageToWebp(buffer);   // -> Buffer WebP
await videoToWebp(buffer);   // -> Buffer WebP animasi (stiker)
await toMp3(buffer);         // -> Buffer MP3

// Helpers — lihat core/utils/helpers.d.ts
import { delay, retry, getRandomItem, shuffleArray, chunkArray,
         toSlug, truncateText, formatCurrency, formatFileSize } from '@lazy/core/utils/helpers';

// Cache — via ctx.cache (lihat core/types/plugin.d.ts untuk CacheService)
await cache.set(key, value, ttlSeconds);
await cache.get(key);
await cache.del(key);
await cache.has(key);
await cache.remember(key, ttl, async () => fetchData()); // cache-or-fetch

// Debug — lihat core/utils/debug.d.ts
import { dump } from '@lazy/core/utils/debug';
dump(anyValue); // print ke terminal
```

## Database (Knex) — via ctx.db

> **Penting:** Gunakan database Knex & file migration hanya jika data yang dikelola berukuran besar atau kompleks/relasional. Untuk data sederhana, gunakan `configs/*.json` (Config) saja.

```js
// ctx.db adalah Knex instance
const rows = await db('tabel').where({ col: val }).select();
const row  = await db('tabel').where({ id }).first();
await db('tabel').insert({ col: val });
await db('tabel').where({ id }).update({ col: val });
await db('tabel').where({ id }).delete();
```

## Config & Lang

```js
// Config — baca/tulis configs/*.json
const val = config.get('nama-file');           // seluruh file
const val = config.get('nama-file.key.nested');// nested key
await config.set('nama-file.key', newValue);   // auto-save ke file

// Lang — terjemahan dari lang/*.json
t('key.langsung')
t('greeting', { name: 'User' }) // template {name} -> interpolasi
```

## Middleware Priority & Return Values

- Priority **negatif** → jalan lebih awal (auth guard, rate limiter, permission check)
- Priority **positif** → jalan belakangan (logging, cleanup)
- `return next()` atau `return true` → lanjutkan chain
- `return false` → stop chain (command tidak jalan)
- `return abort('alasan')` → stop chain + catat log warning

## Tips Vibekoding

1. **Cek type dulu** — baca `core/types/plugin.d.ts` untuk context lengkap
2. **Pakai stubs** — baca `core/stubs/*.stub` sebelum buat file, jangan tulis dari nol
3. `cache.remember()` untuk data API yang sering di-fetch
4. Penyimpanan Data: Secara default, gunakan `configs/*.json` (via `config.get()`/`config.set()`) untuk data sederhana. Tawarkan Knex database dengan migrasi hanya jika data berukuran besar atau kompleks/relasional.
5. Pengaturan yang bisa diubah user / konfigurasi default → `configs/*.json` + `config.get()`/`config.set()`
6. Boot logic plugin → buat `index.js` dengan `export default function({ pluginKey, pluginPath, manager })`
7. Selalu `try/catch` operasi async + `logger.error()` saat error
