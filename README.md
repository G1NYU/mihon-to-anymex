# Mihon / Mangayomi → AnymeX

A **browser-based** migration tool. No Python, no installs, no server.
Convert your manga/anime library to AnymeX format — complete with AniList metadata, covers, ratings and genres.

> Created by [G1NYU](https://github.com/G1NYU) with the help of Perplexity AI.

🔗 **Live tool:** [g1nyu.github.io/mihon-to-anymex](https://g1nyu.github.io/mihon-to-anymex/)

---

## Features

| Feature | Description |
|---|---|
| **Mihon Import** | Upload a Mihon backup JSON (via backup.mihon.tools) |
| **Mangayomi Import** | Upload a `.backup` file directly — no conversion needed |
| **CSV Import** | Paste or upload a plain CSV list of titles |
| **Batch Add** | Paste titles one per line, fetch AniList, get `.anymex` instantly |
| **Share List** | Generate a compressed URL to share your list with others |
| **Reverse Migrate** | Convert an AnymeX backup back to Mihon JSON |
| **Lists Tab** | Upload your `.anymex` and generate a shareable cover grid |
| **EN / JP UI** | Toggle interface language between English and Japanese |

---

## How to Use

### Mihon → AnymeX

1. In Mihon → **More → Backup & restore → Create backup** → save the `.mihon` file
2. Go to [backup.mihon.tools](https://backup.mihon.tools), load the file, click **Download → JSON**
3. Upload that JSON in **Card 01 — Upload backup**
4. Optionally upload an AnymeX template in **Card 02 — Options**
5. Click **▶ Fetch AniList** → wait for results → **↓ Build .anymex**
6. In AnymeX → **Data Management → Restore Data** → select the file

### Mangayomi → AnymeX

1. In Mangayomi → **More → Settings → Backup & restore → Create backup** → save the `.backup` file
2. Upload it directly in **Card 01 — Upload backup** (no conversion needed)
3. Follow steps 4–6 above

### CSV → AnymeX

- Format: one title per row, columns: `Title, Status, ChaptersRead, ListName`
- Only `Title` is required — the rest default to `PLANNING / 0 / Migrated`
- Valid status values: `CURRENT` `PLANNING` `COMPLETED` `DROPPED` `PAUSED` `REPEATING`

### Batch Add

1. Paste titles one per line in the **Batch Add** card
2. Pick media type (Manga / Anime) and status
3. Optionally drop an existing `.anymex` as a base to merge into
4. Click **⚡ Fetch & Build** — file downloads automatically
5. Use **↑ Share List** to generate a URL others can open to auto-fill the same titles

### Reverse Migrate (AnymeX → Mihon)

1. In AnymeX → **Data Management → Backup Data** → export your `.anymex`
2. Upload it in the **Reverse Migrate** card
3. Click **↓ Convert & Download .json**
4. Go to [backup.mihon.tools](https://backup.mihon.tools) → **Upload JSON → Export .mihon**
5. Restore in Mihon → **More → Backup & restore → Restore backup**

> ⚠️ Only manga entries are converted. Anime entries are skipped. Read progress and status are preserved.

### Lists Tab

1. Click the **Lists** tab at the top of the page
2. Upload your `.anymex` file
3. Select which list to share and enter a display name
4. A compressed shareable link is generated — share it on Reddit or Discord
5. Viewers can browse your cover grid and import it directly to AnymeX

---

## Privacy

All processing happens **entirely in your browser**. No data is sent to any server except the [AniList public API](https://anilist.gitbook.io/anilist-apiv2-docs/) for title lookups.

---

## File Structure

```
index.html          — main app UI
apply-tabs.js       — injects Convert / Lists tab nav
lists.js            — Lists tab logic (share, viewer)
mal.js              — MAL import logic
lz-string.min.js    — URL compression for share links
inject-scripts.js   — sequential script loader
mangayomi-to-csv.html — standalone Mangayomi helper
anilist_fetch.py    — legacy Python fetcher
build_anymex.py     — legacy Python builder
```

---

## License

MIT — free to use, modify and share.
