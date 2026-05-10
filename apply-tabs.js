/* apply-tabs.js — runs once on DOMContentLoaded, wires tab structure */
(function() {
  /* 1. Inject tab nav before .site-header */
  const header = document.querySelector('.site-header');
  if (!header) return;

  const nav = document.createElement('nav');
  nav.style.cssText = 'width:100%;max-width:900px;padding:0 2rem;display:flex;gap:0;border-bottom:2px solid #222;margin-bottom:0;position:relative;z-index:1;';
  nav.innerHTML = `
    <button id="tabBtnConvert" onclick="switchMainTab('convert')" style="font-family:'Syne',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.9rem 2rem;background:transparent;border:none;border-bottom:2px solid #c8f53a;margin-bottom:-2px;color:#c8f53a;cursor:pointer;">Convert</button>
    <button id="tabBtnLists" onclick="switchMainTab('lists')" style="font-family:'Syne',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.9rem 2rem;background:transparent;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;color:#666;cursor:pointer;">Lists</button>
  `;
  header.parentNode.insertBefore(nav, header);

  /* 2. Wrap header + .container + .site-footer in pane-convert */
  const body = document.body;
  const paneConvert = document.createElement('div');
  paneConvert.id = 'pane-convert';
  paneConvert.style.display = 'contents'; /* invisible wrapper */

  /* 3. Build pane-lists */
  const paneLists = document.createElement('div');
  paneLists.id = 'pane-lists';
  paneLists.style.cssText = 'display:none;width:100%;max-width:900px;padding:2rem 2rem 6rem;position:relative;z-index:1;';
  paneLists.innerHTML = `
    <div id="ownerSection">
      <p style="font-family:'Space Mono',monospace;font-size:.75rem;color:#999;line-height:1.7;margin-bottom:1.25rem">
        Upload your <code style="color:#c8f53a;background:rgba(200,245,58,.1);padding:.1em .35em;border-radius:2px">.anymex</code> to generate a compressed shareable link. Viewers get a cover grid and can import to their own AnymeX.
      </p>
      <div style="margin-bottom:1rem">
        <label style="display:block;font-family:'Space Mono',monospace;font-size:.65rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#666;margin-bottom:.5rem">Your .anymex backup</label>
        <input type="file" id="listsAnymexFile" accept=".anymex,.json,application/json" onchange="handleListsFile(this)">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
        <div>
          <label style="display:block;font-family:'Space Mono',monospace;font-size:.65rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#666;margin-bottom:.5rem">List to share</label>
          <select id="listsListSelect" disabled onchange="handleListsPreview()"><option>— upload file first —</option></select>
        </div>
        <div>
          <label style="display:block;font-family:'Space Mono',monospace;font-size:.65rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#666;margin-bottom:.5rem">Your display name</label>
          <input type="text" id="listsDisplayName" placeholder="e.g. My Manga List">
        </div>
      </div>
      <div id="listsStatus" class="status-box"></div>
      <div id="listsPreviewGrid" class="cover-grid" style="margin:1rem 0"></div>
      <div id="listsPreviewSection" style="display:none">
        <div id="listsShareSection" style="display:none;margin-top:1rem">
          <div class="share-block show">
            <div class="share-block-title">🔗 Shareable Link</div>
            <div class="share-url-wrap">
              <input class="share-url-input" id="listsShareUrl" type="text" readonly>
              <button class="btn-share" onclick="copyListsUrl()">Copy</button>
            </div>
            <p class="share-hint">Share on Reddit or Discord. Viewers can browse your list and import it directly to AnymeX.</p>
            <p class="og-pill" id="listsOgHint"></p>
          </div>
        </div>
      </div>
    </div>
    <div id="viewerSection" style="display:none"></div>
  `;
  body.appendChild(paneLists);

  /* 4. Tab switcher */
  window.switchMainTab = function(tab) {
    const isConvert = tab === 'convert';
    /* toggle visibility */
    ['site-header', 'container', 'site-footer'].forEach(cls => {
      document.querySelectorAll('.' + cls).forEach(el => el.style.display = isConvert ? '' : 'none');
    });
    paneLists.style.display = isConvert ? 'none' : 'block';
    document.getElementById('tabBtnConvert').style.cssText = isConvert
      ? 'font-family:\'Syne\',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.9rem 2rem;background:transparent;border:none;border-bottom:2px solid #c8f53a;margin-bottom:-2px;color:#c8f53a;cursor:pointer;'
      : 'font-family:\'Syne\',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.9rem 2rem;background:transparent;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;color:#666;cursor:pointer;';
    document.getElementById('tabBtnLists').style.cssText = isConvert
      ? 'font-family:\'Syne\',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.9rem 2rem;background:transparent;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;color:#666;cursor:pointer;'
      : 'font-family:\'Syne\',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.9rem 2rem;background:transparent;border:none;border-bottom:2px solid #c8f53a;margin-bottom:-2px;color:#c8f53a;cursor:pointer;';
  };

  /* 5. Auto-detect ?list= param */
  const listParam = new URLSearchParams(window.location.search).get('list');
  if (listParam) {
    document.addEventListener('DOMContentLoaded', () => switchMainTab('lists'));
  }
})();
