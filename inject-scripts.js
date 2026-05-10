(function() {
  var scripts = ['lz-string.min.js', 'apply-tabs.js', 'lists.js', 'mal.js'];
  scripts.forEach(function(src) {
    var s = document.createElement('script');
    s.src = src;
    document.body.appendChild(s);
  });
})();
