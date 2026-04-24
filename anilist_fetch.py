import requests
import time
import json
import pandas as pd
import os

# ── CONFIG ──────────────────────────────────────────────────────────────────
CSV_PATH = r'mihon_library.csv'  # path to your Mihon CSV export
OUTPUT_FILE = 'anilist_results.json'
# ────────────────────────────────────────────────────────────────────────────

QUERY = '''
query ($s: String) {
  Media(search: $s, type: MANGA) {
    id
    title { romaji english native }
    description(asHtml: false)
    coverImage { large }
    status
    chapters
    genres
    averageScore
    popularity
    format
    startDate { year month day }
    endDate { year month day }
  }
}
'''

def load_existing():
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save(results):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

def main():
    df = pd.read_csv(CSV_PATH, header=None, names=['title', 'author', 'artist'])
    df = df.drop_duplicates(subset='title').reset_index(drop=True)
    titles = df['title'].str.strip().dropna().tolist()

    results = load_existing()
    already_done = set(results.keys())
    remaining = [t for t in titles if t not in already_done]

    print(f"Total titles: {len(titles)}")
    print(f"Already fetched: {len(already_done)}")
    print(f"Remaining: {len(remaining)}")
    print()

    for i, title in enumerate(remaining):
        try:
            r = requests.post(
                'https://graphql.anilist.co',
                json={'query': QUERY, 'variables': {'s': title}},
                headers={'Content-Type': 'application/json'},
                timeout=8
            )
            d = r.json()
            if d.get('data') and d['data'].get('Media'):
                results[title] = d['data']['Media']
        except Exception:
            pass

        time.sleep(2.1)  # stay under AniList's 30 req/min rate limit

        if (i + 1) % 20 == 0:
            print(f"{i + 1}/{len(remaining)} — {len(results)} matched")
            save(results)

    save(results)
    print(f"\nDone! {len(results)}/{len(titles)} titles matched.")
    print(f"Results saved to: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
