# Troubleshooting Guide

> Session log — May 10, 2026. Documents every issue hit and how it was resolved.

---

## ✦ Architecture Overview

The site is a **single `index.html`** on the `gh-pages` branch, with JS split into separate files loaded by a small sequential loader.

```
index.html
  └── <script src="inject-scripts.js">   ← last line before </body>
        ├── lz-string.min.js              ← URL compression
        ├── lists.js                      ← Lists tab logic
        ├── mal.js                        ← MAL import logic
        └── apply-tabs.js                 ← MUST load last — builds tab nav
```

**Critical rule:** `apply-tabs.js` must always be the **last** script in `inject-scripts.js`. It queries the DOM immediately on load — if it runs before the other scripts it will break the Lists tab.

---

## ✦ Backup Branches

| Branch | Commit | State |
|---|---|---|
| `backup-working-may10` | `7884077` | Clean working site, no tabs |
| `backup-working-may10-v2` | `25578a3` | inject-scripts.js added, tabs wired |
| `backup-working-may10-v3` | `dc619da` | **Full working site with tabs ✔** |

To restore from backup at any time:
```bash
git fetch origin
git reset --hard origin/backup-working-may10-v3
git push --force-with-lease
```

---

## ✦ Issues & Fixes

### 1. Lists tab click does nothing

**Cause:** `apply-tabs.js` loaded before `lists.js` / `mal.js`, so `switchMainTab` had no Lists pane to switch to.

**Fix:** Changed `inject-scripts.js` to load scripts **sequentially** using `onload` chaining, with `apply-tabs.js` last.

```js
// inject-scripts.js — correct order
var scripts = ['lz-string.min.js', 'lists.js', 'mal.js', 'apply-tabs.js'];
var i = 0;
function loadNext() {
  if (i >= scripts.length) return;
  var s = document.createElement('script');
  s.src = scripts[i++];
  s.onload = loadNext;
  document.body.appendChild(s);
}
loadNext();
```

---

### 2. Push rejected — remote contains work you do not have locally

**Cause:** A remote commit (from the API or another session) advanced the branch beyond your local HEAD.

**Fix:**
```bash
git pull --rebase origin gh-pages
git push
```

If the remote is broken and you want to overwrite it:
```bash
git push --force-with-lease
```

---

### 3. index.html got truncated / site broken after API push

**Cause:** The GitHub API has a payload size limit. Pushing a 70KB+ file via the API truncates it silently.

**Fix:** Never push `index.html` via the API. Always edit it locally in Codespaces and push via git.

To add a script tag safely:
```bash
sed -i 's|</body>|<script src="inject-scripts.js"></script>\n</body>|' index.html
git add index.html && git commit -m "feat: wire inject-scripts" && git push
```

---

### 4. inject-scripts.js missing after force reset

**Cause:** `git reset --hard origin/backup-working-mayXX` wiped commits that added `inject-scripts.js`.

**Fix:** Recreate it manually:
```bash
cat > inject-scripts.js << 'EOF'
(function() {
  var scripts = ['lz-string.min.js', 'lists.js', 'mal.js', 'apply-tabs.js'];
  var i = 0;
  function loadNext() {
    if (i >= scripts.length) return;
    var s = document.createElement('script');
    s.src = scripts[i++];
    s.onload = loadNext;
    document.body.appendChild(s);
  }
  loadNext();
})();
EOF
git add inject-scripts.js && git commit -m "feat: add inject-scripts.js loader" && git push
```

---

### 5. Site looks fine but JS features missing (tabs, share, etc.)

**Check 1** — Is the script tag in `index.html`?
```bash
grep -n "inject-scripts" index.html
```
Expected: `1127:<script src="inject-scripts.js"></script>`

**Check 2** — Does `inject-scripts.js` exist?
```bash
ls inject-scripts.js
```

**Check 3** — Is `switchMainTab` defined? Run in browser console:
```js
typeof switchMainTab
```
Expected: `"function"`. If `"undefined"` — `apply-tabs.js` didn't load.

**Check 4** — What's actually live on the remote?
```bash
git fetch origin && git log origin/gh-pages --oneline -5
```

---

### 6. GitHub Pages not updating after push

- Wait 1–2 minutes after push
- Hard refresh: `Ctrl + Shift + R`
- Check Actions tab on GitHub for deployment status
- If stuck: make a trivial commit (e.g. add a space to README) to trigger redeploy

---

## ✦ Useful Commands

```bash
# Check what's live on remote
git fetch origin && git log origin/gh-pages --oneline -8

# Check local vs remote diff
git status

# Verify script tag is in index.html
grep -n "inject-scripts" index.html

# Verify all JS files exist
ls inject-scripts.js apply-tabs.js lists.js mal.js lz-string.min.js

# Create a backup branch
git push origin gh-pages:backup-YYYY-MM-DD

# Restore from backup
git reset --hard origin/backup-working-may10-v3
git push --force-with-lease
```

---

## ✦ Golden Rules

1. **Always back up before touching `index.html`**
2. **Never push `index.html` via the GitHub API** — use git in Codespaces
3. **`apply-tabs.js` must always load last** in `inject-scripts.js`
4. **Use `--force-with-lease` not `--force`** when force-pushing
5. **Hard refresh** (`Ctrl+Shift+R`) after every deploy before declaring it broken
