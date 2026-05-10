/* lists.js — Share My List feature
   Owner: upload .anymex → compress mediaIds → share URL
   Viewer: ?list=... → decode → batch-fetch AniList → render grid → import
*/

/* ── CSS injection ── */
(function injectListsCSS() {
  const s = document.createElement('style');
  s.textContent = `
    .tab-nav{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:2.5rem;width:100%;max-width:900px;padding:0 2rem;position:relative;z-index:1;}
    .tab-nav-btn{font-family:var(--font-head);font-size:0.85rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.9rem 1.75rem;background:transparent;border:none;color:var(--muted);cursor:pointer;position:relative;transition:color 0.15s;border-bottom:2px solid transparent;margin-bottom:-2px;}
    .tab-nav-btn:hover{color:var(--text);}
    .tab-nav-btn.active{color:var(--lime);border-bottom-color:var(--lime);}
    .tab-pane{display:none;}
    .tab-pane.active{display:block;}

    /* lists tab */
    .lists-hero{text-align:center;padding:2rem 0 1.5rem;}
    .lists-hero-title{font-family:var(--font-head);font-size:1.6rem;font-weight:800;color:var(--text);letter-spacing:-0.01em;margin-bottom:0.5rem;}
    .lists-hero-sub{font-family:var(--font-mono);font-size:0.72rem;color:var(--muted-hi);line-height:1.7;}
    .lists-card{background:rgba(17,17,17,0.88);backdrop-filter:blur(6px);border:1px solid var(--border);border-radius:var(--radius);padding:2rem;margin-bottom:1rem;animation:fadeUp 0.4s ease both;}
    .lists-section-title{font-family:var(--font-head);font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--lime);margin-bottom:1.25rem;display:flex;align-items:center;gap:0.6rem;}
    .lists-section-title::after{content:'';flex:1;height:1px;background:var(--border);}

    /* cover grid */
    .cover-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:0.75rem;margin-top:1.25rem;}
    .cover-card{position:relative;border-radius:var(--radius);overflow:hidden;aspect-ratio:2/3;background:var(--surface-2);border:1px solid var(--border);transition:transform 0.15s,border-color 0.15s;cursor:default;}
    .cover-card:hover{transform:translateY(-3px);border-color:var(--lime);}
    .cover-card img{width:100%;height:100%;object-fit:cover;display:block;}
    .cover-card-overlay{position:absolute;bottom:0;left:0;right:0;padding:0.4rem 0.35rem 0.35rem;background:linear-gradient(transparent,rgba(0,0,0,0.92));}
    .cover-card-title{font-family:var(--font-mono);font-size:0.6rem;color:#fff;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:0.25rem;}
    .cover-card-badge{display:inline-block;font-family:var(--font-mono);font-size:0.5rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.1rem 0.35rem;border-radius:2px;}
    .cover-card-badge.CURRENT{background:rgba(58,245,160,0.2);color:var(--success);}
    .cover-card-badge.COMPLETED{background:rgba(200,245,58,0.2);color:var(--lime);}
    .cover-card-badge.PLANNING{background:rgba(102,102,102,0.3);color:var(--muted-hi);}
    .cover-card-badge.DROPPED{background:rgba(255,79,106,0.2);color:var(--error);}
    .cover-card-badge.PAUSED{background:rgba(245,166,35,0.2);color:var(--warn);}
    .cover-card-badge.REPEATING{background:rgba(167,139,250,0.2);color:var(--reverse);}
    .cover-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:var(--muted);}

    /* share URL box */
    .lists-url-wrap{display:flex;gap:0.5rem;margin-top:1rem;}
    .lists-url-input{flex:1;font-family:var(--font-mono);font-size:0.7rem;background:var(--surface-2);border:1px solid rgba(200,245,58,0.3);border-radius:var(--radius);color:var(--muted-hi);padding:0.65rem 0.9rem;outline:none;}
    .lists-hint{font-family:var(--font-mono);font-size:0.63rem;color:var(--muted);line-height:1.6;margin-top:0.5rem;}

    /* viewer header */
    .viewer-header{border:1px solid rgba(200,245,58,0.25);background:linear-gradient(135deg,rgba(200,245,58,0.04),rgba(17,17,17,0.9));border-radius:var(--radius);padding:1.5rem 2rem;margin-bottom:1.5rem;animation:fadeUp 0.4s ease both;}
    .viewer-list-name{font-family:var(--font-head);font-size:1.4rem;font-weight:800;color:var(--lime);letter-spacing:-0.01em;margin-bottom:0.3rem;}
    .viewer-meta{font-family:var(--font-mono);font-size:0.68rem;color:var(--muted-hi);}
    .viewer-import-row{display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-top:1.25rem;}
    .viewer-import-label{font-family:var(--font-mono);font-size:0.68rem;color:var(--muted);}
    input.viewer-listname-input{width:180px;font-size:0.72rem;padding:0.5rem 0.75rem;}
    select.viewer-status-select{width:160px;font-size:0.72rem;padding:0.5rem 0.75rem;}

    /* loading skeleton */
    .skeleton-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:0.75rem;margin-top:1.25rem;}
    .skeleton-card{aspect-ratio:2/3;border-radius:var(--radius);background:linear-gradient(90deg,var(--surface-2) 25%,var(--border) 50%,var(--surface-2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

    /* og meta preview pill */
    .og-pill{display:inline-flex;align-items:center;gap:0.4rem;font-family:var(--font-mono);font-size:0.62rem;color:var(--muted);background:var(--surface-2);border:1px solid var(--border);border-radius:2px;padding:0.25rem 0.6rem;margin-top:0.5rem;}
  `;
  document.head.appendChild(s);
})();

/* ── State ── */
let listsAnymex = null;       // parsed .anymex
let listsEntries = [];        // flat array of lib entries for current list
let listsImporting = false;

/* ── Tab switching ── */
function switchMainTab(tab) {
  document.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + tab));
}

/* ── Owner: load .anymex ── */
function handleListsFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      listsAnymex = JSON.parse(e.target.result);
      const anime = listsAnymex.animeLibrary || [];
      const manga = listsAnymex.mangaLibrary || [];
      const total = anime.length + manga.length;
      if (!total) { listsShowStatus('warn', 'No entries found in this file.'); return; }

      // populate list selector
      const sel = document.getElementById('listsListSelect');
      sel.innerHTML = '';
      const allLists = new Set();
      const allCustom = [
        ...(listsAnymex.mangaCustomLists || []),
        ...(listsAnymex.animeCustomLists || [])
      ];
      allCustom.forEach(l => allLists.add(JSON.stringify({ name: l.name, type: l.mediaTypeIndex === 1 ? 'ANIME' : 'MANGA' })));
      if (!allLists.size) {
        // no custom lists — offer full library
        if (manga.length) { const o = document.createElement('option'); o.value = '__manga__'; o.textContent = 'Full Manga Library (' + manga.length + ')'; sel.appendChild(o); }
        if (anime.length) { const o = document.createElement('option'); o.value = '__anime__'; o.textContent = 'Full Anime Library (' + anime.length + ')'; sel.appendChild(o); }
      } else {
        allLists.forEach(j => {
          const { name, type } = JSON.parse(j);
          const lib = type === 'ANIME' ? listsAnymex.animeCustomLists : listsAnymex.mangaCustomLists;
          const lst = lib.find(l => l.name === name);
          const count = lst ? lst.mediaIds.length : 0;
          const o = document.createElement('option');
          o.value = j;
          o.textContent = name + ' · ' + type + ' (' + count + ')';
          sel.appendChild(o);
        });
      }
      document.getElementById('listsListSelect').disabled = false;
      document.getElementById('listsPreviewBtn').disabled = false;
      listsShowStatus('success', '✔ Loaded — ' + total + ' entries across ' + (allLists.size || 2) + ' list(s).');
    } catch (err) {
      listsShowStatus('error', 'Failed to parse: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ── Owner: preview + generate link ── */
async function handleListsPreview() {
  if (!listsAnymex) return;
  const selVal = document.getElementById('listsListSelect').value;
  let entries = [];

  if (selVal === '__manga__') {
    entries = listsAnymex.mangaLibrary || [];
  } else if (selVal === '__anime__') {
    entries = listsAnymex.animeLibrary || [];
  } else {
    const { name, type } = JSON.parse(selVal);
    const lib = type === 'ANIME' ? listsAnymex.animeCustomLists : listsAnymex.mangaCustomLists;
    const lst = lib.find(l => l.name === name);
    const fullLib = type === 'ANIME' ? listsAnymex.animeLibrary : listsAnymex.mangaLibrary;
    entries = lst ? lst.mediaIds.map(id => fullLib.find(e => e.mediaId === id)).filter(Boolean) : [];
  }

  if (!entries.length) { listsShowStatus('warn', 'No entries in selected list.'); return; }
  listsEntries = entries;

  // render preview grid
  renderCoverGrid(entries, 'listsPreviewGrid', false);
  document.getElementById('listsPreviewSection').style.display = 'block';

  // generate compressed URL
  const payload = JSON.stringify({
    n: document.getElementById('listsListSelect').options[document.getElementById('listsListSelect').selectedIndex].textContent.split(' · ')[0],
    t: selVal === '__anime__' ? 'ANIME' : 'MANGA',
    e: entries.map(en => ({
      id: en.mediaId,
      s: en.status,
      p: en.progress || 0,
      sc: en.score || 0
    }))
  });
  const compressed = LZString.compressToEncodedURIComponent(payload);
  const url = window.location.origin + window.location.pathname + '?list=' + compressed;
  document.getElementById('listsShareUrl').value = url;
  document.getElementById('listsShareSection').style.display = 'block';

  // og hint
  document.getElementById('listsOgHint').textContent = '🔗 ' + entries.length + ' entries · share on Reddit or Discord for a live embed preview';
}

function copyListsUrl() {
  const input = document.getElementById('listsShareUrl');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(input.value).then(() => showToast('Link copied!')).catch(() => { input.select(); document.execCommand('copy'); showToast('Copied!'); });
  else { input.select(); document.execCommand('copy'); showToast('Copied!'); }
}

/* ── Viewer: detect ?list= on load ── */
function checkListParam() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('list');
  if (!raw) return;

  // auto-switch to Lists tab
  switchMainTab('lists');

  let payload;
  try {
    const json = LZString.decompressFromEncodedURIComponent(raw);
    payload = JSON.parse(json);
  } catch (e) {
    document.getElementById('viewerSection').innerHTML = '<p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--error)">⚠ Invalid or corrupted list link.</p>';
    document.getElementById('viewerSection').style.display = 'block';
    return;
  }

  renderViewer(payload);
}

/* ── Viewer: render ── */
async function renderViewer(payload) {
  const section = document.getElementById('viewerSection');
  section.style.display = 'block';
  document.getElementById('ownerSection').style.display = 'none';

  const { n: listName, t: mediaType, e: entries } = payload;
  const total = entries.length;

  // header
  section.innerHTML = `
    <div class="viewer-header">
      <div class="viewer-list-name">${escHtmlL(listName)}</div>
      <div class="viewer-meta">${total} ${mediaType === 'ANIME' ? 'anime' : 'manga'} entries · fetching covers from AniList…</div>
      <div class="viewer-import-row" id="viewerImportRow" style="display:none">
        <span class="viewer-import-label">Import as:</span>
        <input class="viewer-listname-input" id="viewerImportName" type="text" value="${escHtmlL(listName)}" placeholder="List name">
        <select class="viewer-status-select" id="viewerImportStatus">
          <option value="keep">Keep original status</option>
          <option value="PLANNING">Plan to Read/Watch</option>
          <option value="CURRENT">Reading/Watching</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <button class="btn-primary" id="viewerImportBtn" onclick="handleViewerImport()" disabled>⬇ Import to AnymeX</button>
        <button class="btn-secondary" id="viewerImportStopBtn" onclick="viewerImportStop=true" style="display:none">■ Stop</button>
      </div>
    </div>
    <div class="skeleton-grid" id="viewerSkeleton">${Array(Math.min(total,24)).fill('<div class="skeleton-card"></div>').join('')}</div>
    <div class="cover-grid" id="viewerGrid" style="display:none"></div>
    <div class="status-box" id="viewerStatus" style="margin-top:1rem"></div>
  `;

  // batch fetch AniList (50 per request)
  const ids = entries.map(e => e.id);
  const mediaMap = {};
  const batchSize = 50;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const gql = `query($ids:[Int],$t:MediaType){Page(perPage:50){media(id_in:$ids,type:$t){id title{english romaji}coverImage{large}format chapters episodes}}}`;
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: gql, variables: { ids: batch, t: mediaType } })
      });
      if (res.ok) {
        const json = await res.json();
        (json.data?.Page?.media || []).forEach(m => { mediaMap[m.id] = m; });
      }
    } catch (e) { /* skip batch on network error */ }
    if (i + batchSize < ids.length) await new Promise(r => setTimeout(r, 600));
  }

  // render grid
  const grid = document.getElementById('viewerGrid');
  const skel = document.getElementById('viewerSkeleton');
  entries.forEach(en => {
    const media = mediaMap[en.id];
    const card = document.createElement('div');
    card.className = 'cover-card';
    const title = media ? (media.title.english || media.title.romaji || '?') : ('ID ' + en.id);
    const cover = media?.coverImage?.large || '';
    card.innerHTML = `
      ${cover ? `<img src="${cover}" alt="${escHtmlL(title)}" loading="lazy">` : '<div class="cover-placeholder">📖</div>'}
      <div class="cover-card-overlay">
        <div class="cover-card-title">${escHtmlL(title)}</div>
        <span class="cover-card-badge ${en.s}">${en.s}</span>
        ${en.p ? `<span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--muted-hi);margin-left:0.3rem">${en.p} ch</span>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });

  skel.style.display = 'none';
  grid.style.display = 'grid';

  // update meta
  const matched = Object.keys(mediaMap).length;
  document.querySelector('.viewer-meta').textContent = `${total} entries · ${matched} covers loaded`;
  document.getElementById('viewerImportRow').style.display = 'flex';
  document.getElementById('viewerImportBtn').disabled = false;

  // dynamic og tags for Discord/Reddit embed
  const firstCover = Object.values(mediaMap)[0]?.coverImage?.large || '';
  setOgTags(listName + ' — AnymeX list', `${total} ${mediaType.toLowerCase()} entries`, firstCover);
}

function setOgTags(title, desc, image) {
  const setMeta = (prop, val, attr = 'property') => {
    let el = document.querySelector(`meta[${attr}="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, prop); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };
  document.title = title + ' · mihon-to-anymex';
  setMeta('og:title', title);
  setMeta('og:description', desc);
  if (image) setMeta('og:image', image);
  setMeta('twitter:title', title);
  setMeta('twitter:description', desc);
  if (image) setMeta('twitter:image', image);
}

/* ── Viewer: import to AnymeX ── */
let viewerImportStop = false;
let _viewerPayload = null;

async function handleViewerImport() {
  const btn = document.getElementById('viewerImportBtn');
  const stopBtn = document.getElementById('viewerImportStopBtn');
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('list');
  let payload;
  try { payload = JSON.parse(LZString.decompressFromEncodedURIComponent(raw)); } catch (e) { return; }

  const { t: mediaType, e: entries, n: listName } = payload;
  const importName = document.getElementById('viewerImportName').value.trim() || listName;
  const statusOverride = document.getElementById('viewerImportStatus').value;

  viewerImportStop = false;
  btn.disabled = true;
  stopBtn.style.display = '';

  const base = { schemaVersion: 2, animeLibrary: [], mangaLibrary: [], animeCustomLists: [], mangaCustomLists: [], animeCount: 0, mangaCount: 0 };
  const lib = mediaType === 'ANIME' ? base.animeLibrary : base.mangaLibrary;
  const lists = mediaType === 'ANIME' ? base.animeCustomLists : base.mangaCustomLists;

  const statusEl = document.getElementById('viewerStatus');
  statusEl.className = 'status-box show';
  statusEl.textContent = 'Fetching from AniList…';

  let ok = 0, skip = 0;
  const batchSize = 50;
  const ids = entries.map(e => e.id);

  for (let i = 0; i < ids.length; i += batchSize) {
    if (viewerImportStop) break;
    const batch = ids.slice(i, i + batchSize);
    const gql = `query($ids:[Int],$t:MediaType){Page(perPage:50){media(id_in:$ids,type:$t){id title{english romaji}coverImage{large}bannerImage format chapters episodes genres averageScore popularity}}}`;
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: gql, variables: { ids: batch, t: mediaType } })
      });
      if (res.ok) {
        const json = await res.json();
        const medias = json.data?.Page?.media || [];
        medias.forEach(media => {
          const en = entries.find(e => e.id === media.id);
          if (!en) return;
          const status = statusOverride !== 'keep' ? statusOverride : (en.s || 'PLANNING');
          const isAnime = mediaType === 'ANIME';
          lib.push({
            mediaId: media.id,
            title: media.title.english || media.title.romaji || '',
            romajiTitle: media.title.romaji || '',
            coverImage: media.coverImage?.large || '',
            bannerImage: media.bannerImage || '',
            status,
            progress: en.p || 0,
            totalCount: isAnime ? (media.episodes || 0) : (media.chapters || 0),
            score: en.sc || 0,
            isFavorite: false,
            startedAt: null, completedAt: null, notes: '',
            listName: importName,
            mediaType,
            format: media.format || '',
            genres: media.genres || [],
            averageScore: media.averageScore || 0,
            popularity: media.popularity || 0,
            source: 'ANILIST'
          });
          ok++;
        });
        skip += (batch.length - medias.length);
      }
    } catch (e) { skip += batch.length; }
    statusEl.textContent = `Fetching… ${Math.min(i + batchSize, ids.length)} / ${ids.length}`;
    if (i + batchSize < ids.length) await new Promise(r => setTimeout(r, 700));
  }

  // build custom list index
  let lst = lists.find(l => l.name === importName);
  if (!lst) { lst = { name: importName, mediaTypeIndex: mediaType === 'ANIME' ? 1 : 0, mediaIds: [] }; lists.push(lst); }
  lib.forEach(en => { if (!lst.mediaIds.includes(en.mediaId)) lst.mediaIds.push(en.mediaId); });
  base.animeCount = base.animeLibrary.length;
  base.mangaCount = base.mangaLibrary.length;

  if (!viewerImportStop && ok > 0) {
    const blob = new Blob([JSON.stringify(base, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'anymex_list_' + Date.now() + '.anymex'; a.click();
    URL.revokeObjectURL(url);
    statusEl.className = 'status-box show success';
    statusEl.textContent = `✔ ${ok} entries imported. .anymex downloaded!`;
    if (typeof showToast === 'function') showToast('✔ .anymex downloaded!');
  } else if (viewerImportStop) {
    statusEl.textContent = 'Stopped — ' + ok + ' fetched so far.';
  } else {
    statusEl.className = 'status-box show warn';
    statusEl.textContent = 'No entries could be fetched.';
  }

  btn.disabled = false;
  stopBtn.style.display = 'none';
}

/* ── Helpers ── */
function listsShowStatus(type, msg) {
  const el = document.getElementById('listsStatus');
  if (!msg) { el.className = 'status-box'; el.textContent = ''; return; }
  el.className = 'status-box show ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warn' ? 'warn' : '');
  el.textContent = msg;
}

function renderCoverGrid(entries, targetId, viewer) {
  const grid = document.getElementById(targetId);
  grid.innerHTML = '';
  entries.forEach(en => {
    const card = document.createElement('div');
    card.className = 'cover-card';
    const title = en.title || en.romajiTitle || ('ID ' + en.mediaId);
    const cover = en.coverImage || '';
    card.innerHTML = `
      ${cover ? `<img src="${cover}" alt="${escHtmlL(title)}" loading="lazy">` : '<div class="cover-placeholder">📖</div>'}
      <div class="cover-card-overlay">
        <div class="cover-card-title">${escHtmlL(title)}</div>
        <span class="cover-card-badge ${en.status}">${en.status}</span>
        ${en.progress ? `<span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--muted-hi);margin-left:0.3rem">${en.progress} ch</span>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

function escHtmlL(s) {
  if (typeof s !== 'string') s = String(s || '');
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  checkListParam();
});
