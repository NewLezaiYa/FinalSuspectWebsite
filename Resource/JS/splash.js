
window.SplashIntro = (function () {
  'use strict';

  var CFG = {

    ringExpand: 0.4,
    scanSweep: 0.55,
    gearMesh: 0.4,
    logoAssemble: 0.6,
    logoHold: 0.25,
    logLines: 3,
    logLineGap: 95,
    progressDuration: 0.65,
    verifyHold: 0.2,
    clampDown: 0.32,
    diaOut: 0.42,


    gridSize: 42,
    scanThickness: 3,
    maxDebris: 260,
    ringCount: 2
  };

  var COLORS = {
    cyan: '0,240,255',
    teal: '20,224,200',
    amber: '255,176,32',
    pink: '255,45,149',
    green: '0,255,136'
  };

  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var clamp01 = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { t = clamp01(t); return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { t = clamp01(t); return t * t * (3 - 2 * t); };
  var rgba = function (c, a) { return 'rgba(' + c + ',' + (a == null ? 1 : a) + ')'; };


  function animate(duration, step) {
    return new Promise(function (resolve) {
      var elapsed = 0;
      var last = performance.now();
      function tick(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        elapsed += dt;
        step(clamp01(elapsed / duration), dt);
        if (elapsed < duration) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  function loadImage(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  }

  function isCached(url) {
    return new Promise(function (resolve) {
      fetch(url, { cache: 'only-if-cached', mode: 'same-origin' })
        .then(function (res) { resolve(res.ok); })
        .catch(function () { resolve(false); });
    });
  }


  function GridLayer(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.resize();
    this.offset = 0;
  }
  GridLayer.prototype.resize = function () {
    var w = this.c.clientWidth || window.innerWidth;
    var h = this.c.clientHeight || window.innerHeight;
    this.w = w; this.h = h;
    this.c.width = Math.floor(w * this.dpr);
    this.c.height = Math.floor(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };
  GridLayer.prototype.draw = function (dt, opts) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    var g = CFG.gridSize;
    this.offset = (this.offset + dt * 22) % g;


    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(' + COLORS.cyan + ',0.075)';
    ctx.beginPath();
    for (var x = -this.offset; x < this.w; x += g) {
      ctx.moveTo(Math.floor(x) + .5, 0);
      ctx.lineTo(Math.floor(x) + .5, this.h);
    }
    for (var y = -this.offset; y < this.h; y += g) {
      ctx.moveTo(0, Math.floor(y) + .5);
      ctx.lineTo(this.w, Math.floor(y) + .5);
    }
    ctx.stroke();


    ctx.strokeStyle = 'rgba(' + COLORS.cyan + ',0.13)';
    ctx.beginPath();
    for (var x2 = -this.offset; x2 < this.w; x2 += g * 5) {
      ctx.moveTo(Math.floor(x2) + .5, 0);
      ctx.lineTo(Math.floor(x2) + .5, this.h);
    }
    for (var y2 = -this.offset; y2 < this.h; y2 += g * 5) {
      ctx.moveTo(0, Math.floor(y2) + .5);
      ctx.lineTo(this.w, Math.floor(y2) + .5);
    }
    ctx.stroke();


    if (opts && opts.scan != null) {
      var sy = opts.scan * this.h;
      var grad = ctx.createLinearGradient(0, sy - 90, 0, sy + 30);
      grad.addColorStop(0, 'rgba(' + COLORS.cyan + ',0)');
      grad.addColorStop(0.72, 'rgba(' + COLORS.cyan + ',0.16)');
      grad.addColorStop(1, 'rgba(' + COLORS.cyan + ',0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sy - 90, this.w, 120);
      ctx.fillStyle = 'rgba(' + COLORS.cyan + ',0.75)';
      ctx.fillRect(0, sy, this.w, CFG.scanThickness);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(0, sy + 1, this.w, 1);
    }


    var m = 26, len = 54;
    ctx.strokeStyle = 'rgba(' + COLORS.cyan + ',0.5)';
    ctx.lineWidth = 2;
    [[m, m, 1, 1], [this.w - m, m, -1, 1], [m, this.h - m, 1, -1], [this.w - m, this.h - m, -1, -1]]
      .forEach(function (c) {
        ctx.beginPath();
        ctx.moveTo(c[0] + c[2] * len, c[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(c[0], c[1] + c[3] * len);
        ctx.stroke();
      });
  };


  function Engine(overlay) {
    this.overlay = overlay;
    this.pcbCanvas = overlay.querySelector('#splashPcbCanvas');
    this.fxCanvas = overlay.querySelector('#splashFxCanvas');
    this.particleCanvas = overlay.querySelector('#splashParticleCanvas');
    this.logBox = overlay.querySelector('#splashLog');
    this.loadText = overlay.querySelector('#loadText');
    this.processText = overlay.querySelector('#processText');
    this.hint = overlay.querySelector('#downloadHint');
    this.versionText = overlay.querySelector('#versionText');
    this.blackPanel = overlay.querySelector('#blackPanel');

    this.grid = new GridLayer(this.pcbCanvas);
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.debris = [];
    this.resize();
    var self = this;
    window.addEventListener('resize', function () { self.resize(); });
  }

  Engine.prototype.resize = function () {
    var w = window.innerWidth, h = window.innerHeight;
    this.w = w; this.h = h;
    [this.fxCanvas, this.particleCanvas].forEach(function (c) {
      c.width = Math.floor(w * Math.min(2, window.devicePixelRatio || 1));
      c.height = Math.floor(h * Math.min(2, window.devicePixelRatio || 1));
      c.getContext('2d').setTransform(
        Math.min(2, window.devicePixelRatio || 1), 0, 0, Math.min(2, window.devicePixelRatio || 1), 0, 0);
    });
    if (this.grid) this.grid.resize();
  };


  Engine.prototype.phaseBezel = function () {
    var bezel = document.createElement('div');
    bezel.className = 'sp-bezel';
    bezel.innerHTML =
      '<span class="sp-bezel__corner sp-bezel__corner--tl"></span>' +
      '<span class="sp-bezel__corner sp-bezel__corner--tr"></span>' +
      '<span class="sp-bezel__corner sp-bezel__corner--bl"></span>' +
      '<span class="sp-bezel__corner sp-bezel__corner--br"></span>' +
      '<span class="sp-bolt sp-bolt--tl"></span>' +
      '<span class="sp-bolt sp-bolt--tr"></span>' +
      '<span class="sp-bolt sp-bolt--bl"></span>' +
      '<span class="sp-bolt sp-bolt--br"></span>' +

      '<span class="sp-bezel__rule sp-bezel__rule--t"></span>' +
      '<span class="sp-bezel__rule sp-bezel__rule--b"></span>' +

      '<div class="sp-readout">' +
        '<div class="sp-readout__row"><span>SYS</span><b>FS-DOCS</b></div>' +
        '<div class="sp-readout__row"><span>MODE</span><b>MECHANICAL</b></div>' +
        '<div class="sp-readout__row"><span>BUILD</span><b>v3.0</b></div>' +
      '</div>' +

      '<span class="sp-bezel__gauge"></span>';
    this.overlay.appendChild(bezel);
    this.bezel = bezel;
  };


  Engine.prototype.phaseGears = async function () {
    this.phaseBezel();
    var host = document.createElement('div');
    host.className = 'sp-rings';
    var html = '';
    for (var i = 0; i < CFG.ringCount; i++) {
      html += '<i class="sp-ring" style="--i:' + i + '"></i>';
    }
    html +=
      '<svg class="sp-gear sp-gear--a" viewBox="0 0 100 100" aria-hidden="true">' +
        '<path d="M50 6 L58 6 L61 18 A33 33 0 0 1 71 23 L82 16 L88 22 L81 33 A33 33 0 0 1 86 43 L98 46 L98 54 L86 57 A33 33 0 0 1 81 67 L88 78 L82 84 L71 77 A33 33 0 0 1 61 82 L58 94 L50 94 L47 82 A33 33 0 0 1 37 77 L26 84 L20 78 L27 67 A33 33 0 0 1 22 57 L10 54 L10 46 L22 43 A33 33 0 0 1 27 33 L20 22 L26 16 L37 23 A33 33 0 0 1 47 18 Z" fill="none" stroke="rgba(0,240,255,.75)" stroke-width="2.5"/>' +
        '<circle cx="50" cy="50" r="14" fill="none" stroke="rgba(0,240,255,.5)" stroke-width="2"/>' +
      '</svg>' +
      '<svg class="sp-gear sp-gear--b" viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,45,149,.5)" stroke-width="2" stroke-dasharray="10 8"/>' +
        '<circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,45,149,.35)" stroke-width="2"/>' +
      '</svg>' +
      '<div class="sp-core"></div>';
    host.innerHTML = html;
    this.overlay.appendChild(host);
    this.gearHost = host;
    await wait(CFG.gearMesh * 1000 + 220);
  };


  Engine.prototype.phaseLogo = async function (logoImg) {
    var host = this.gearHost;
    if (host) {
      host.classList.add('sp-rings--out');
    }
    var box = document.createElement('div');
    box.className = 'sp-logo';
    var img = document.createElement('img');
    img.src = logoImg.src;
    img.alt = 'FinalSuspect';
    box.appendChild(img);

    box.insertAdjacentHTML('beforeend',
      '<span class="sp-logo__rail sp-logo__rail--t"></span>' +
      '<span class="sp-logo__rail sp-logo__rail--b"></span>' +
      '<span class="sp-logo__bolt sp-logo__bolt--l"></span>' +
      '<span class="sp-logo__bolt sp-logo__bolt--r"></span>');
    this.overlay.appendChild(box);
    this.logoBox = box;

    await animate(CFG.logoAssemble, function (t) {
      var p = easeOut(t) * 100;
      box.style.setProperty('--wipe', p.toFixed(1) + '%');
      box.style.setProperty('--o', String(clamp01(t * 1.6)));
    });
    box.style.setProperty('--wipe', '100%');
    box.style.setProperty('--o', '1');
    await wait(CFG.logoHold * 1000);
  };


  Engine.prototype.pushLog = async function (text, tone) {
    var line = document.createElement('div');
    line.className = 'sp-log__line' + (tone ? ' sp-log__line--' + tone : '');
    line.innerHTML = '<span class="sp-log__tag">' + (tone === 'ok' ? 'OK' : tone === 'warn' ? 'WARN' : 'SYS') + '</span><span class="sp-log__txt"></span>';
    this.logBox.appendChild(line);
    var out = line.querySelector('.sp-log__txt');
    for (var i = 0; i < text.length; i++) {
      out.textContent += text.charAt(i);
      await wait(11);
    }
    await wait(Math.max(0, CFG.logLineGap - text.length * 11));
  };

  Engine.prototype.phaseBoot = async function () {
    var lines = [
      ['MOUNTING MECHANICAL PANELS', 'sys'],
      ['LINKING GEAR TRAIN', 'sys'],
      ['CALIBRATING SENSORS', 'ok'],
      ['READING DOCUMENT INDEX', 'ok']
    ];
    for (var i = 0; i < Math.min(CFG.logLines, lines.length); i++) {
      await this.pushLog(lines[i][0], lines[i][1]);
    }
  };


  Engine.prototype.setHint = function (on) {
    if (this.hint) this.hint.classList.toggle('is-on', !!on);
  };

  Engine.prototype.phaseResources = async function (images) {
    var total = (images || []).length;
    if (!total) return;

    var flags = await Promise.all(images.map(isCached));
    var missing = flags.filter(function (f) { return !f; }).length;
    var downloading = missing > 0;

    this.loadText.textContent = downloading ? '= DOWNLOADING ASSETS =' : '= VERIFYING ASSETS =';
    this.loadText.classList.add('is-on');

    if (downloading) {
      await this.pushLog('FETCHING ' + missing + ' MISSING ASSET(S)', 'warn');
      this.setHint(true);
    } else {
      await this.pushLog('ALL ASSETS LOCAL', 'ok');
    }


    var bar = document.createElement('div');
    bar.className = 'sp-bar';
    bar.innerHTML = '<i></i>';
    this.processText.appendChild(bar);
    var fill = bar.querySelector('i');
    var label = document.createElement('span');
    label.className = 'sp-bar__label';
    this.processText.appendChild(label);

    var done = 0;
    var self = this;
    await animate(CFG.progressDuration, function (t, dt) {

      var target = Math.min(96, easeOut(t) * 96);
      fill.style.width = target.toFixed(1) + '%';
      label.textContent = '校验模块 ' + Math.round((target / 100) * total) + ' / ' + total;
      void dt;
    });

    for (var i = 0; i < total; i++) {
      await loadImage(images[i]);
      done++;
      var pct = ((done / total) * 100).toFixed(1);
      fill.style.width = pct + '%';
      label.textContent = '校验模块 ' + done + ' / ' + total;
      await wait(downloading ? 90 : 55);
    }
    fill.style.width = '100%';
    label.textContent = '全部就绪 ' + total + ' / ' + total;
    self.setHint(false);

    await this.pushLog('SYSTEM READY', 'ok');
    await wait(CFG.verifyHold * 1000);
  };


  Engine.prototype.phaseClamp = async function () {

    var top = document.createElement('div');
    var bottom = document.createElement('div');
    top.className = 'sp-clamp sp-clamp--t';
    bottom.className = 'sp-clamp sp-clamp--b';
    this.overlay.appendChild(top);
    this.overlay.appendChild(bottom);
    var h = this.h;
    await animate(CFG.clampDown, function (t) {
      var p = easeInOut(t) * 50;
      top.style.height = p + '%';
      bottom.style.height = p + '%';
      void h;
    });
    this.clamps = [top, bottom];
  };


  Engine.prototype.buildDebris = function () {
    var n = CFG.maxDebris;
    for (var i = 0; i < n; i++) {
      this.debris.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        s: 1 + Math.random() * 3,
        a: 1,
        tone: Math.random() < 0.72 ? COLORS.cyan : (Math.random() < 0.6 ? COLORS.amber : COLORS.pink)
      });
    }
  };

  Engine.prototype.phaseDisassemble = async function () {

    if (this.logoBox) {
      this.logoBox.style.transition = 'opacity .4s ease, transform .6s cubic-bezier(.16,1,.3,1)';
      this.logoBox.style.opacity = '0';
      this.logoBox.style.transform = 'scale(.94)';
    }
    if (this.gearHost) this.gearHost.classList.add('sp-rings--out');
    this.buildDebris();

    var ctx = this.particleCanvas.getContext('2d');
    var self = this;
    await animate(CFG.diaOut, function (t, dt) {
      ctx.clearRect(0, 0, self.w, self.h);
      for (var i = 0; i < self.debris.length; i++) {
        var d = self.debris[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 26 * dt;
        d.a = Math.max(0, 1 - t * 1.35);
        ctx.fillStyle = rgba(d.tone, d.a * 0.85);
        ctx.fillRect(d.x, d.y, d.s, d.s);
      }
    });
    ctx.clearRect(0, 0, this.w, this.h);


    var black = this.blackPanel;
    if (black) {
      black.style.opacity = '1';
    }
    await wait(120);
  };


  Engine.prototype.start = async function (options) {
    var opts = options || {};
    var images = opts.images || [];
    var onComplete = opts.onComplete;

    var html = document.documentElement;
    var body = document.body;
    var prevHtml = html.style.overflow;
    var prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';


    var self = this;
    var running = true;
    var lastT = performance.now();
    var scanProgress = 0;

    function loop() {
      if (!running) return;
      var now = performance.now();
      var dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      self.grid.draw(dt, { scan: scanProgress });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    try {
      this.versionText.textContent = 'FS-DOCS v3.0 · MECHANICAL BUILD';
      this.versionText.classList.add('is-on');

      var logoImg = await loadImage(this.logoImgSrc());
      if (!logoImg) { onComplete && onComplete(); return; }


      var scanDone = false;
      var scanP = animate(CFG.scanSweep, function (t) { scanProgress = easeInOut(t); })
        .then(function () { scanDone = true; scanProgress = null; });

      await this.phaseGears();
      await scanP;
      void scanDone;

      await this.phaseLogo(logoImg);
      await this.phaseBoot();
      await this.phaseResources(images);
      await this.phaseClamp();
      await this.phaseDisassemble();

      if (this.overlay) {
        this.overlay.classList.add('hidden');
        setTimeout(function () { self.overlay.style.display = 'none'; }, 700);
      }
    } finally {
      running = false;
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      onComplete && onComplete();
    }
  };


  Engine.prototype.logoImgSrc = function () {
    return location.protocol === 'file:'
      ? '../Resource/images/FinalSuspect-Logo-Splash.webp'
      : '/Resource/images/FinalSuspect-Logo-Splash.webp';
  };


  return {
    start: function (options) {
      var overlay = document.getElementById('loadingOverlay');
      if (!overlay) return Promise.resolve();
      if (!overlay.querySelector('#splashFxCanvas') || !overlay.querySelector('#splashPcbCanvas')) {
        options && options.onComplete && options.onComplete();
        return Promise.resolve();
      }
      return new Engine(overlay).start(options);
    }
  };
})();
