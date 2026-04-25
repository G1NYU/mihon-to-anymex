# Mihon → AnymeX Migration Tool

Convert your **Mihon** manga library to **AnymeX** format — complete with AniList metadata, covers, ratings and genres.

> Created by [G1NYU](https://github.com/G1NYU)

---

## 🚀 Use It Now — No Install Needed

> ### 👉 [**g1nyu.github.io/mihon-to-anymex**](https://g1nyu.github.io/mihon-to-anymex/)
>
> Open the link above in any browser — works on PC, Mac, Android.  
> **No Python. No terminal. No install. Just drag & drop your files.**

---

## How to Migrate from Mihon

### Option A — Mihon Backup JSON *(recommended, preserves reading status)*

1. In Mihon: **More → Backup & restore → Create backup** → save the `.tachibk` file
2. Go to [backup.mihon.tools](https://backup.mihon.tools), load the `.tachibk`, click **Download → JSON**
3. In AnymeX: **Data Management → Backup Data** → save the `.anymex` template file
4. Open [the web app](https://g1nyu.github.io/mihon-to-anymex/), upload both files, click **Parse → Fetch → Build**
5. Restore `mihon_to_anymex.anymex` in AnymeX → **Data Management → Restore Data**

### Option B — CSV export

1. Export your Mihon library as CSV (title, author, artist — no header row)
2. Follow steps 3–5 above using the CSV instead

---

## Why This Exists

AnymeX cannot directly import Mihon `.tachibk` backups. Its `.anymex` format requires:
- A valid **AniList numeric ID** on every entry
- `readChapters` as a **list**, not an integer
- All IDs referenced inside **`mangaCustomLists`**

This tool handles all of that automatically in your browser.

---

## What the Web App Does

- Accepts a **Mihon backup JSON** (recommended) or a plain **CSV**
- Preserves **per-title reading status** (Reading, Completed, Dropped, etc.) from the backup
- Carries over **chapters read** count
- Fetches **AniList metadata** (covers, ratings, genres, descriptions) directly in the browser
- Downloads a ready-to-restore `.anymex` file instantly
- Resume support — safe to stop and continue later

---

## Bonus — Export AniList → MAL

Open the [anilist-to-mal tool](https://g1nyu.github.io/mihon-to-anymex/anilist-to-mal/). Paste your AniList token, choose list status, click **Export XML**. Downloads a MAL-compatible XML — no Python needed.

Get your token at [anilist.co/settings/developer](https://anilist.co/settings/developer).

---

## Python Scripts (Advanced / Optional)

The repo also contains `anilist_fetch.py` and `build_anymex.py` for power users who prefer the command line.

Requirements:
```bash
pip install requests pandas
```

See the script files for usage. The web app is recommended for most users.

---

## Notes

- Titles not found on AniList (~20–25%) are skipped — you can add them manually in AnymeX
- The `.anymex` file is plain JSON — inspect it in any text editor
- AniList fetch is rate-limited (~2s per title); a 300-title library takes ~10 min

---

## Roadmap

- [x] Web app — no Python needed
- [x] Mihon backup JSON support (per-title reading status)
- [x] Resume interrupted sessions
- [x] Chapters read carry-over
- [ ] Direct `.tachibk` import (currently needs conversion via backup.mihon.tools)

---

## License

MIT — free to use, modify and share.
