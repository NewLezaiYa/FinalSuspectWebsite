
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED) return;

  var DURATION = 340;
  var HARD_LIMIT = 620;
  var PANELS = 7;


  if (!window.requestAnimationFrame || !document.addEventListener) return;

  var host = null;
  var navigating = false;

  function build() {
    if (host) return host;
    host = document.createElement('div');
    host.className = 'pt';
    host.setAttribute('aria-hidden', 'true');
    var panels = '';
    for (var i = 0; i < PANELS; i++) {
      panels += '<i style="--i:' + i + '"></i>';
    }
    host.innerHTML =
      '<div class="pt__panels">' + panels + '</div>' +
      '<div class="pt__core">' +
        '<svg viewBox="0 0 100 100">' +
          '<circle class="pt__ring" cx="50" cy="50" r="38" fill="none"' +
            ' stroke="rgba(0,240,255,.7)" stroke-width="2" stroke-dasharray="10 7"/>' +
          '<circle class="pt__ring pt__ring--rev" cx="50" cy="50" r="26" fill="none"' +
            ' stroke="rgba(255,45,149,.5)" stroke-width="1.5" stroke-dasharray="4 9"/>' +
        '</svg>' +
        '<span class="pt__label">LOADING</span>' +
      '</div>' +
      '<span class="pt__scan"></span>';
    document.body.appendChild(host);
    return host;
  }

  function run(url) {
    if (navigating) return;
    navigating = true;
    var el = build();

    void el.offsetWidth;
    el.classList.add('is-run');

    var done = false;
    var go = function () {
      if (done) return;
      done = true;
      location.href = url;
    };
    setTimeout(go, DURATION);
    setTimeout(go, HARD_LIMIT);
  }


  var TRIGGER_SELECTOR = '.topnav__link, .nav-row';

  function shouldIntercept(e, a) {
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;


    if (!a.matches(TRIGGER_SELECTOR)) return false;

    var raw = a.getAttribute('href');
    if (!raw) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(raw)) return false;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return false; }
    if (url.origin !== location.origin) return false;

    if (url.pathname === location.pathname && url.search === location.search) return false;

    if (!/\.html?$/i.test(url.pathname) && !/\/$/.test(url.pathname)) return false;

    return url.href;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var url = shouldIntercept(e, a);
    if (!url) return;
    e.preventDefault();
    run(url);
  }, true);


  window.addEventListener('pageshow', function (e) {
    navigating = false;
    if (host) host.classList.remove('is-run');
    if (e.persisted && host) host.remove();
  });
})();
