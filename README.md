# Mihon → AnymeX Migration Tool

Convert your **Mihon** or **Komikku** manga library to **AnymeX** format, complete with AniList metadata, covers, ratings and genres.

> Created by [G1NYU](https://github.com/G1NYU) with the help of Perplexity AI.

---

## Why This Exists

AnymeX cannot directly import Mihon `.proto.gz` or Komikku backups. Its `.anymex` restore format requires:
- A valid **AniList numeric ID** on every entry (null IDs are silently skipped)
- `readChapters` and `watchedEpisodes` as **lists**, not integers
- All entry IDs referenced inside **`mangaCustomLists`** or the library appears empty

This toolset solves all of that automatically.

---

## What You Need

- A PC with **Python 3** installed → [python.org](https://python.org) *(check "Add Python to PATH" during install)*
- Your Mihon library exported as a **CSV** (title, author, artist columns — no header row)
- Your own `.anymex` backup file from AnymeX (even with just 1 manga added manually)

---

## Setup

```bash
pip install requests pandas
```

Clone or download this repo and put these files on your Desktop alongside:
- `mihon_library.csv` — your Mihon CSV export
- `your_backup.anymex` — your AnymeX backup template

---

## Step 1 — Fetch AniList Metadata

```bash
python anilist_fetch.py
```

This queries the AniList API for every title in your CSV and saves results to `anilist_results.json`.

- Takes ~20 minutes for 600 titles (rate limited to 30 req/min)
- **Auto-saves every 20 entries** — safe to interrupt and resume
- Typically matches ~75–80% of titles

---

## Step 2 — Build the .anymex File

Open `build_anymex.py` and update these two lines at the top:

```python
CSV_PATH = r'C:\Users\YOURUSERNAME\Desktop\mihon_library.csv'
BACKUP_PATH = 'your_backup.anymex'
```

Then run:

```bash
python build_anymex.py
```

This produces `mihon_to_anymex.anymex` in the same folder.

---

## Step 3 — Restore in AnymeX

1. Transfer `mihon_to_anymex.anymex` to your Android device
2. Open AnymeX → **Data Management → Restore Data**
3. Select the file

---

## Notes

- Titles not matched on AniList (~20–25%) are skipped. You can add them manually in AnymeX.
- Read progress is not carried over (Mihon CSV doesn't include it)
- The `.anymex` file is plain JSON — you can open and inspect it in any text editor

---

## Roadmap

- [ ] Web app / GUI version (no Python needed)
- [ ] Support for Mihon `.proto.gz` direct import
- [ ] Resume support for interrupted AniList fetch
- [ ] Progress data mapping if available

---

## License

MIT — free to use, modify and share.
