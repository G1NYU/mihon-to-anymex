import json
import pandas as pd
import os

# ── CONFIG ──────────────────────────────────────────────────────────────────
CSV_PATH = r'mihon_library.csv'           # your Mihon CSV export
BACKUP_PATH = 'your_backup.anymex'       # your AnymeX backup template file
ANILIST_FILE = 'anilist_results.json'    # output from anilist_fetch.py
OUTPUT_FILE = 'mihon_to_anymex.anymex'  # final output
# ────────────────────────────────────────────────────────────────────────────

EMPTY_CHAPTER = {
    "link": None, "title": None, "releaseDate": None, "scanlator": None,
    "number": 1.0, "pageNumber": None, "totalPages": None,
    "lastReadTime": None, "currentOffset": None, "maxOffset": None,
    "sourceName": None, "localPath": None, "headerKeys": None, "headerValues": None
}

def load_files():
    with open(ANILIST_FILE, 'r', encoding='utf-8') as f:
        anilist = json.load(f)
    with open(BACKUP_PATH, 'rb') as f:
        template = json.loads(f.read().decode('utf-8'))
    df = pd.read_csv(CSV_PATH, header=None, names=['title', 'author', 'artist'])
    df = df.drop_duplicates(subset='title').reset_index(drop=True)
    titles = df['title'].str.strip().dropna().tolist()
    return anilist, template, titles

def format_date(date_dict):
    if not date_dict:
        return '?'
    y = date_dict.get('year')
    m = date_dict.get('month')
    if not y:
        return '?'
    return f"{y}-{str(m).zfill(2) if m else '?'}"

def build_entry(title, a):
    aired = format_date(a.get('startDate'))
    ended = format_date(a.get('endDate'))
    desc = (a.get('description') or '?')\
        .replace('<br>', '\n').replace('<i>', '').replace('</i>', '')
    english = a['title'].get('english') or a['title'].get('romaji') or title
    return {
        "id": str(a['id']),
        "jname": a['title'].get('native') or title,
        "name": english,
        "english": english,
        "japanese": a['title'].get('native') or title,
        "description": desc,
        "poster": (a.get('coverImage') or {}).get('large') or None,
        "cover": None,
        "totalEpisodes": "?",
        "type": "?",
        "season": "?",
        "premiered": "?",
        "duration": "?",
        "status": "ONGOING.. probably?",
        "rating": str(round((a.get('averageScore') or 0) / 10, 1)),
        "popularity": str(a.get('popularity') or '?'),
        "format": "?",
        "aired": f"{aired} to {ended}",
        "totalChapters": str(a.get('chapters') or '?'),
        "genres": a.get('genres') or [],
        "studios": None,
        "chapters": None,
        "episodes": None,
        "currentEpisode": None,
        "currentChapter": EMPTY_CHAPTER.copy(),
        "watchedEpisodes": [],
        "readChapters": [],
        "serviceIndex": 0,
        "mediaTypeIndex": 0
    }

def main():
    anilist, template, titles = load_files()

    manga_library = []
    skipped = []

    for title in titles:
        if title in anilist:
            manga_library.append(build_entry(title, anilist[title]))
        else:
            skipped.append(title)

    all_ids = [e['id'] for e in manga_library]

    backup = {
        "date": template["date"],
        "appVersion": template["appVersion"],
        "username": template["username"],
        "avatar": template["avatar"],
        "animeCount": 0,
        "mangaCount": len(manga_library),
        "novelCount": 0,
        "animeLibrary": [],
        "mangaLibrary": manga_library,
        "novelLibrary": [],
        "animeCustomLists": template.get("animeCustomLists", []),
        "mangaCustomLists": [
            {"listName": "new", "mediaIds": all_ids, "mediaTypeIndex": 0}
        ],
        "novelCustomLists": template.get("novelCustomLists", []),
        "settings": template.get("settings", [])
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(backup, f, ensure_ascii=False, indent=2)

    print(f"✅ Done!")
    print(f"   Imported : {len(manga_library)} entries")
    print(f"   Skipped  : {len(skipped)} titles (no AniList match)")
    print(f"   Output   : {OUTPUT_FILE}")
    if skipped:
        print(f"\nSkipped titles (add manually in AnymeX):")
        for t in skipped:
            print(f"   - {t}")

if __name__ == '__main__':
    main()
