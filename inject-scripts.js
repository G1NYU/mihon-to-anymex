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
