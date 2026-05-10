/* MAL XML → AnymeX — injects CSS + card HTML + handles logic */

(function injectMal() {
  /* CSS */
  const style = document.createElement('style');
  style.textContent = `
    :root{--mal:#2dd4bf;--mal-dim:rgba(45,212,191,0.12);--mal-glow:rgba(45,212,191,0.25);}
    .mal-card{border:1px solid rgba(45,212,191,0.3);background:linear-gradient(135deg,rgba(45,212,191,0.04) 0%,rgba(17,17,17,0.88) 60%);backdrop-filter:blur(6px);border-radius:var(--radius);overflow:hidden;transition:border-color 0.2s;animation:fadeUp 0.5s ease 0.25s both;margin-top:1rem;}
    .mal-card:hover{border-color:rgba(45,212,191,0.55);}
    .mal-trigger{display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;cursor:pointer;user-select:none;gap:1rem;}
    .mal-trigger-left{display:flex;align-items:center;gap:0.75rem;}
    .mal-label{font-family:var(--font-head);font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--mal);}
    .mal-sub{font-family:var(--font-mono);font-size:0.65rem;color:var(--muted);letter-spacing:0.08em;}
    .mal-chevron{font-size:0.75rem;color:var(--muted);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);flex-shrink:0;}
    .mal-card.open .mal-chevron{transform:rotate(180deg);}
    .mal-body{max-height:0;overflow:hidden;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1),padding 0.25s ease;padding:0 2rem;border-top:0px solid rgba(45,212,191,0.15);}
    .mal-card.open .mal-body{max-height:2400px;padding:0 2rem 2rem;border-top-width:1px;}
    .mal-note{font-family:var(--font-mono);font-size:0.72rem;line-height:1.6;color:var(--muted-hi);padding:0.75rem 1rem;border-left:2px solid var(--mal);background:var(--mal-dim);border-radius:0 var(--radius) var(--radius) 0;margin-bottom:1.25rem;}
    .mal-note code{color:var(--mal);}
    .mal-note a{color:var(--mal);}
    .mal-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin:1.25rem 0;}
    .mal-step{background:var(--surface-2);padding:1rem 1.25rem;}
    .mal-step-num{font-family:var(--font-mono);font-size:0.6rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--mal);margin-bottom:0.5rem;}
    .mal-step p{font-family:var(--font-mono);font-size:0.75rem;line-height:1.6;color:var(--muted-hi);}
    .mal-step code{background:rgba(45,212,191,0.1);color:var(--mal);padding:0.1em 0.35em;border-radius:2px;font-size:0.72rem;}
    .mal-step a{color:var(--mal);text-decoration:none;}
    .btn-mal{background:var(--mal);color:#000;border-color:var(--mal);}
    .btn-mal:hover:not(:disabled){background:#5eead4;box-shadow:0 0 20px var(--mal-glow);}
    .mal-progress-wrap{margin-top:1.5rem;display:none;}
    .mal-progress-label{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem;}
    .mal-progress-title{font-family:var(--font-mono);font-size:0.7rem;color:var(--muted-hi);}
    .mal-progress-pct{font-family:var(--font-mono);font-size:0.65rem;color:var(--muted);}
    .mal-progress-track{background:var(--surface-2);border:1px solid var(--border);border-radius:2px;height:4px;overflow:hidden;}
    .mal-progress-bar{height:100%;border-radius:2px;background:var(--mal);width:0%;transition:width 0.25s ease;box-shadow:0 0 8px var(--mal-glow);}
    .mal-progress-bar.ratelimit{background:var(--warn);animation:pulse 1s ease-in-out infinite;}
    .mal-pills{display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:1rem;}
  `;
  document.head.appendChild(style);

  /* HTML card — injected before </div> closing the .container */
  const card = document.createElement('div');
  card.id = 'malWrap';
  card.className = 'mal-card';
  card.innerHTML = `
    <div class="mal-trigger" onclick="toggleMal()">
      <div class="mal-trigger-left">
        <span style="font-size:1.1rem">📋</span>
        <div>
          <div class="mal-label">MAL Import</div>
          <div class="mal-sub">MyAnimeList XML → AnymeX · anime &amp; manga · no server</div>
        </div>
      </div>
      <span class="mal-chevron">&#9662;</span>
    </div>
    <div class="mal-body">
      <div class="mal-steps">
        <div class="mal-step"><div class="mal-step-num">Step 01</div><p>On MAL, go to <a href="https://myanimelist.net/panel.php?go=export" target="_blank">myanimelist.net/panel.php?go=export</a>, export your Anime or Manga list as <code>.xml.gz</code>, then extract the <code>.xml</code> file.</p></div>
        <div class="mal-step"><div class="mal-step-num">Step 02</div><p>Upload the <code>.xml</code> below. Both anime and manga exports are supported — the tool auto-detects which type it is.</p></div>
        <div class="mal-step"><div class="mal-step-num">Step 03</div><p>Click <strong>Fetch &amp; Build</strong>. AniList is queried by MAL ID for accurate matches. Your <code>.anymex</code> downloads automatically when done.</p></div>
      </div>
      <div class="mal-note">
        ⚡ Lookups use MAL IDs directly — much faster and more accurate than title search. Score, status, and read/watch progress are all preserved. <code>Notes</code> and <code>tags</code> are not supported by AnymeX.
      </div>
      <div class="field">
        <label for="malFile">MAL export <span>(.xml)</span></label>
        <input type="file" id="malFile" accept=".xml,text/xml,application/xml" onchange="handleMalFile(this)">
      </div>
      <div id="malStatus" class="status-box"></div>
      <div class="row2" style="margin-bottom:1.25rem;margin-top:1.25rem">
        <div>
          <label for="malListName">List name</label>
          <input type="text" id="malListName" value="MAL Import" placeholder="MAL Import">
        </div>
        <div>
          <label for="malDelay">Delay (ms)</label>
          <input type="number" id="malDelay" min="500" step="100" value="1200">
        </div>
      </div>
      <div class="field">
        <label for="malBaseFile">Base .anymex <span>(optional — merge into existing backup)</span></label>
        <input type="file" id="malBaseFile" accept=".anymex,.json,application/json">
      </div>
      <div class="btn-row">
        <button class="btn-mal" id="malFetchBtn" onclick="handleMalFetch()" disabled>⚡ Fetch &amp; Build</button>
        <button class="btn-secondary" id="malStopBtn" onclick="malStop=true" disabled>■ Stop</button>
      </div>
      <div class="mal-progress-wrap" id="malProgressWrap">
        <div class="mal-progress-label">
          <span class="mal-progress-title" id="malProgressTitle">Fetching…</span>
          <span class="mal-progress-pct" id="malProgressPct">0%</span>
        </div>
        <div class="mal-progress-track"><div class="mal-progress-bar" id="malProgressBar"></div></div>
      </div>
      <div class="mal-pills" id="malPills"></div>
      <div class="result-table-wrap" id="malResultWrap" style="display:none;margin-top:1.25rem">
        <table>
          <thead><tr><th>MAL Title</th><th>MAL ID</th><th>AniList Match</th><th>Status</th><th>Progress</th><th>Result</th></tr></thead>
          <tbody id="malResultBody"></tbody>
        </table>
      </div>
    </div>
  `;

  /* Insert before the reverse-card (or at end of container if not found) */
  const container = document.querySelector('.container');
  const reverseCard = document.getElementById('reverseWrap');
  if (container && reverseCard) {
    container.insertBefore(card, reverseCard);
  } else if (container) {
    container.appendChild(card);
  }
})();

/* ── State ── */
let malParsed  = [];
let malStop    = false;
let malResults = [];

function toggleMal() {
  document.getElementById('malWrap').classList.toggle('open');
}

function malStatusToAniList(type, status) {
  const manga = {'Reading':'CURRENT','Completed':'COMPLETED','On-Hold':'PAUSED','Dropped':'DROPPED','Plan to Read':'PLANNING'};
  const anime = {'Watching':'CURRENT','Completed':'COMPLETED','On-Hold':'PAUSED','Dropped':'DROPPED','Plan to Watch':'PLANNING'};
  return ((type==='manga') ? manga : anime)[status] || 'PLANNING';
}

function handleMalFile(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(e.target.result, 'application/xml');
      if (xml.querySelector('parsererror')) throw new Error('Invalid XML');
      const exportType = xml.querySelector('user_export_type')?.textContent?.trim();
      const type = (exportType === '2') ? 'manga' : 'anime';
      const nodes = [...xml.querySelectorAll(type === 'manga' ? 'manga' : 'anime')];
      if (!nodes.length) throw new Error('No entries found.');
      malParsed = [];
      nodes.forEach(el => {
        const get = tag => el.querySelector(tag)?.textContent?.trim() || '';
        const malId    = parseInt(get(type==='manga' ? 'manga_mangadb_id' : 'series_animedb_id')) || 0;
        const title    = get(type==='manga' ? 'manga_title' : 'series_title');
        const rawSt    = get('my_status');
        const progress = parseInt(get(type==='manga' ? 'my_read_chapters' : 'my_watched_episodes')) || 0;
        const score    = parseFloat(get('my_score')) || 0;
        if (!malId || !title) return;
        malParsed.push({malId, title, type, status: malStatusToAniList(type, rawSt), progress, score});
      });
      if (!malParsed.length) throw new Error('No valid entries parsed.');
      showMalStatus('success', `✔ Parsed ${malParsed.length} ${type} entries.`);
      document.getElementById('malFetchBtn').disabled = false;
    } catch(err) {
      showMalStatus('error', 'Failed: ' + err.message);
      document.getElementById('malFetchBtn').disabled = true;
    }
  };
  reader.readAsText(file);
}

async function queryAniListByMalId(malId, type) {
  const mediaType = type==='manga' ? 'MANGA' : 'ANIME';
  const gql = `query($id:Int,$t:MediaType){Media(idMal:$id,type:$t){id idMal title{romaji english}coverImage{large}bannerImage format chapters episodes genres averageScore popularity}}`;
  let attempt = 0;
  while (attempt <= 4) {
    if (malStop) return null;
    try {
      const res = await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:gql,variables:{id:malId,t:mediaType}})});
      if (res.status===429) { if (attempt>=4) return null; await malCountdownWait(parseInt(res.headers.get('Retry-After')||'60')); attempt++; continue; }
      if (!res.ok) return null;
      const json = await res.json();
      return (json.data && json.data.Media) ? json.data.Media : null;
    } catch(e) { return null; }
  }
  return null;
}

async function malCountdownWait(seconds) {
  const bar = document.getElementById('malProgressBar');
  const ttl = document.getElementById('malProgressTitle');
  if (bar) bar.classList.add('ratelimit');
  for (let s=seconds;s>0;s--) { if (malStop) break; if (ttl) ttl.textContent=`⏸ Rate limited — resuming in ${s}s…`; await new Promise(r=>setTimeout(r,1000)); }
  if (bar) bar.classList.remove('ratelimit');
}

function malSleep(ms) {
  return new Promise(resolve => { const step=100,end=Date.now()+ms; const tick=()=>{if(Date.now()>=end||malStop)resolve();else setTimeout(tick,step);}; setTimeout(tick,step); });
}

async function handleMalFetch() {
  if (!malParsed.length) return;
  malStop=false; malResults=[];
  const delay    = parseInt(document.getElementById('malDelay').value)||1500;
  const listName = document.getElementById('malListName').value.trim()||'MAL Import';
  const baseFile = document.getElementById('malBaseFile').files[0];
  let base;
  if (baseFile) { try { base=JSON.parse(await baseFile.text()); } catch(e) { showMalStatus('error','Bad base file: '+e.message); return; } }
  else base={schemaVersion:2,animeLibrary:[],mangaLibrary:[],animeCustomLists:[],mangaCustomLists:[],animeCount:0,mangaCount:0};
  ['animeLibrary','mangaLibrary','animeCustomLists','mangaCustomLists'].forEach(k=>{if(!base[k])base[k]=[];});
  document.getElementById('malFetchBtn').disabled=true;
  document.getElementById('malStopBtn').disabled=false;
  document.getElementById('malProgressWrap').style.display='block';
  document.getElementById('malResultWrap').style.display='none';
  document.getElementById('malResultBody').innerHTML='';
  setMalPills(0,0,malParsed.length);
  showMalStatus('','');
  let ok=0,skip=0;
  for (let i=0;i<malParsed.length;i++) {
    if (malStop) break;
    const entry=malParsed[i];
    setMalProgress(i,malParsed.length,entry.title);
    const media=await queryAniListByMalId(entry.malId,entry.type);
    if (media) {
      const isAnime=entry.type==='anime';
      const lib=isAnime?base.animeLibrary:base.mangaLibrary;
      const lists=isAnime?base.animeCustomLists:base.mangaCustomLists;
      const libEntry={mediaId:media.id,title:media.title.english||media.title.romaji||entry.title,romajiTitle:media.title.romaji||'',coverImage:media.coverImage?.large||'',bannerImage:media.bannerImage||'',status:entry.status,progress:entry.progress,totalCount:isAnime?(media.episodes||0):(media.chapters||0),score:entry.score,isFavorite:false,startedAt:null,completedAt:null,notes:'',listName:listName,mediaType:isAnime?'ANIME':'MANGA',format:media.format||'',genres:media.genres||[],averageScore:media.averageScore||0,popularity:media.popularity||0,source:'ANILIST'};
      if (!lib.find(x=>x.mediaId===media.id)) { lib.push(libEntry); let lst=lists.find(l=>l.name===listName); if(!lst){lst={name:listName,mediaTypeIndex:isAnime?1:0,mediaIds:[]};lists.push(lst);} if(!lst.mediaIds.includes(media.id))lst.mediaIds.push(media.id); }
      malResults.push({entry,media}); ok++;
    } else { malResults.push({entry,media:null}); skip++; }
    setMalPills(ok,skip,malParsed.length);
    addMalTableRow(entry,media);
    if (i<malParsed.length-1) await malSleep(delay);
  }
  setMalProgress(malParsed.length,malParsed.length,malStop?'Stopped':'Done');
  document.getElementById('malResultWrap').style.display='block';
  base.mangaCount=base.mangaLibrary.length; base.animeCount=base.animeLibrary.length;
  if (!malStop&&ok>0) {
    const blob=new Blob([JSON.stringify(base,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='anymex_from_mal_'+Date.now()+'.anymex'; a.click();
    URL.revokeObjectURL(url);
    showMalStatus('success',`✔ Done — ${ok} matched, ${skip} skipped. .anymex downloaded!`);
    if (typeof showToast==='function') showToast('✔ MAL → .anymex downloaded!');
  } else if (malStop) { showMalStatus('warn',`Stopped — ${ok} matched so far.`); }
  else { showMalStatus('warn','No entries matched.'); }
  document.getElementById('malFetchBtn').disabled=false;
  document.getElementById('malStopBtn').disabled=true;
}

function setMalProgress(i,total,label) {
  const pct=total?Math.round((i/total)*100):0;
  document.getElementById('malProgressBar').style.width=pct+'%';
  document.getElementById('malProgressTitle').textContent=label+' ('+i+'/'+total+')';
  document.getElementById('malProgressPct').textContent=pct+'%';
}

let _malPillsInit=false;
function setMalPills(ok,skip,total) {
  const c=document.getElementById('malPills');
  if(!_malPillsInit){c.innerHTML=`<span id="malPillOk" class="pill"></span><span id="malPillSkip" class="pill"></span><span id="malPillTotal" class="pill"></span>`;_malPillsInit=true;}
  const po=document.getElementById('malPillOk'); const ps=document.getElementById('malPillSkip');
  po.className='pill '+(ok>0?'ok':''); po.textContent='✔ '+ok+' matched';
  ps.className='pill '+(skip>0?'skip':''); ps.textContent='✖ '+skip+' skipped';
  document.getElementById('malPillTotal').textContent=total+' total';
}

function addMalTableRow(entry,media) {
  const tbody=document.getElementById('malResultBody');
  const tr=document.createElement('tr');
  if (media) { const d=media.title.english||media.title.romaji||entry.title; tr.innerHTML=`<td style="color:var(--text)">${escHtml(entry.title)}</td><td style="color:var(--mal)">${entry.malId}</td><td>${escHtml(d)}</td><td>${escHtml(entry.status)}</td><td>${entry.progress}</td><td><span class="badge ok">matched</span></td>`; }
  else { tr.innerHTML=`<td style="color:var(--text)">${escHtml(entry.title)}</td><td style="color:var(--mal)">${entry.malId}</td><td>—</td><td>${escHtml(entry.status)}</td><td>${entry.progress}</td><td><span class="badge skip">skipped</span></td>`; }
  tbody.appendChild(tr);
}

function showMalStatus(type,msg) {
  const el=document.getElementById('malStatus');
  if(!msg){el.className='status-box';el.textContent='';return;}
  el.className='status-box show '+(type==='error'?'error':type==='success'?'success':type==='warn'?'warn':'');
  el.textContent=msg;
}

function escHtml(s) {
  if(typeof s!=='string')s=String(s||'');
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
