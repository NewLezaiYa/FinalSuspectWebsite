/* ============================================================
   FinalSuspect Website - Common JavaScript
   合并自: BackToTop.js + Time.js + h1.js + h2.js + h3.js
           + Image.js + Errorcode.js + Copy.js + Version.js
   ============================================================ */

(function() {
    'use strict';

    // Shared color palette for particle effects
    var PARTICLE_COLORS = ['#00d2ff', '#7158e2', '#ff4757', '#ffd43b', '#09bb07'];

    /* ==========================================
       1. BACK TO TOP BUTTON (from BackToTop.js)
       ========================================== */
    function initBackToTop() {
        var btn = document.querySelector('.back-to-top');
        if (!btn) {
            // Create the button if it doesn't exist
            btn = document.createElement('div');
            btn.className = 'back-to-top';
            btn.innerHTML = '&#9650;';
            btn.title = 'Back to Top';
            document.body.appendChild(btn);
        }

        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ==========================================
       2. TIME UPDATE (from Time.js)
       ========================================== */
    function initTimeUpdate() {
        var timeEl = document.querySelector('.edit-time time');
        if (!timeEl) return;

        function updateTime() {
            var now = new Date();
            var pad = function(n) { return n < 10 ? '0' + n : n; };
            timeEl.textContent = now.getFullYear() + '-' +
                pad(now.getMonth() + 1) + '-' +
                pad(now.getDate()) + ' ' +
                pad(now.getHours()) + ':' +
                pad(now.getMinutes()) + ':' +
                pad(now.getSeconds());
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    /* ==========================================
       3. TITLE PARTICLES (from h1.js)
       ========================================== */
    function initTitleParticles() {
        var titles = document.querySelectorAll('h1');
        titles.forEach(function(title) {
            if (title.dataset.particlesInit) return;
            title.dataset.particlesInit = 'true';

            title.addEventListener('mouseenter', function() {
                createParticlesForTarget(title);
            });
            title.addEventListener('mouseleave', function() {
                removeParticlesForTarget(title);
            });
        });
    }

    function createParticlesForTarget(el) {
        var particles = document.createElement('div');
        particles.className = 'h1-particles';
        particles.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
        el.style.position = 'relative';

        for (var i = 0; i < 15; i++) {
            var particle = document.createElement('span');
            var size = Math.random() * 4 + 2;
            var color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
            var delay = Math.random() * 1.5;
            var duration = Math.random() * 1 + 0.5;

            particle.style.cssText =
                'position:absolute;display:block;width:' + size + 'px;height:' + size + 'px;' +
                'background:' + color + ';border-radius:50%;' +
                'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;' +
                'animation:particleFloat ' + duration + 's ease-in-out ' + delay + 's infinite;' +
                'box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';';

            particles.appendChild(particle);
        }

        el.appendChild(particles);
    }

    function removeParticlesForTarget(el) {
        var particles = el.querySelector('.h1-particles');
        if (particles) {
            particles.remove();
        }
    }

    // Inject particle animation keyframes
    if (!document.getElementById('h1-particle-style')) {
        var style = document.createElement('style');
        style.id = 'h1-particle-style';
        style.textContent =
            '@keyframes particleFloat {' +
            '0%,100%{transform:translate(0,0) scale(1);opacity:0.8}' +
            '25%{transform:translate(5px,-5px) scale(1.5);opacity:1}' +
            '50%{transform:translate(-5px,-10px) scale(0.8);opacity:0.6}' +
            '75%{transform:translate(3px,-3px) scale(1.2);opacity:0.9}' +
            '}';
        document.head.appendChild(style);
    }

    /* ==========================================
       4. IMAGE PREVIEW (from Image.js)
       ========================================== */
    function initImagePreview() {
        var imgs = document.querySelectorAll('.image-container img');

        imgs.forEach(function(img) {
            if (img.dataset.previewInit) return;
            img.dataset.previewInit = 'true';

            img.addEventListener('click', function() {
                var overlay = document.createElement('div');
                overlay.className = 'preview-overlay';

                var cloned = document.createElement('img');
                cloned.src = img.src;
                cloned.alt = img.alt;

                overlay.appendChild(cloned);
                document.body.appendChild(overlay);

                requestAnimationFrame(function() {
                    overlay.classList.add('active');
                });

                overlay.addEventListener('click', function() {
                    overlay.classList.remove('active');
                    setTimeout(function() {
                        overlay.remove();
                    }, 300);
                });
            });
        });
    }

    /* ==========================================
       5. ERROR CODE COPY (from Errorcode.js)
       ========================================== */
    function initErrorCodeCopy() {
        var codes = document.querySelectorAll('.error-code');
        codes.forEach(function(code) {
            if (code.dataset.copyInit) return;
            code.dataset.copyInit = 'true';

            code.addEventListener('click', function() {
                var text = code.textContent.trim();
                copyToClipboard(text);
            });
        });
    }

    /* ==========================================
       6. CODE BLOCK COPY (from Copy.js)
       ========================================== */
    function initCodeBlockCopy() {
        var blocks = document.querySelectorAll('pre code');
        blocks.forEach(function(block) {
            var pre = block.parentElement;
            if (pre.querySelector('.copy-btn')) return;

            var btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.textContent = 'Copy';

            pre.style.position = 'relative';
            pre.appendChild(btn);

            btn.addEventListener('click', function() {
                var text = block.textContent;
                copyToClipboard(text);
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(function() {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    /* ==========================================
       7. VERSION NAVIGATION (from Version.js)
       ========================================== */
    function initVersionNavigation() {
        var nav = document.querySelector('.version-nav');
        if (!nav) return;

        var toggle = nav.querySelector('.nav-toggle-btn');
        var hide = nav.querySelector('.nav-hide-btn');
        var showBtn = document.querySelector('.nav-show-btn');
        var restoreTip = document.querySelector('.nav-restore-tip');
        var items = nav.querySelectorAll('.nav-item');

        if (toggle) {
            toggle.addEventListener('click', function() {
                nav.classList.toggle('collapsed');
            });
        }

        if (hide) {
            hide.addEventListener('click', function() {
                nav.classList.add('hidden');
                if (showBtn) {
                    showBtn.classList.add('visible', 'pulsing');
                }
                if (restoreTip) {
                    restoreTip.classList.add('visible');
                    setTimeout(function() {
                        restoreTip.classList.remove('visible');
                    }, 5000);
                }
            });
        }

        if (showBtn) {
            showBtn.addEventListener('click', function() {
                nav.classList.remove('hidden');
                showBtn.classList.remove('visible', 'pulsing');
            });
        }

        var restoreBtn = document.querySelector('.restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', function() {
                nav.classList.remove('hidden');
                if (showBtn) showBtn.classList.remove('visible', 'pulsing');
                if (restoreTip) restoreTip.classList.remove('visible');
            });
        }

        // Current version indicator
        var indicator = document.querySelector('.current-version-indicator');
        if (indicator) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 200) {
                    indicator.classList.add('show');
                } else {
                    indicator.classList.remove('show');
                }
            });
        }

        // Scroll spy for nav items
        if (items.length > 0) {
            window.addEventListener('scroll', function() {
                var currentId = null;
                items.forEach(function(item) {
                    var href = item.getAttribute('href');
                    if (!href || !href.startsWith('#')) return;
                    var target = document.querySelector(href);
                    if (!target) return;
                    var rect = target.getBoundingClientRect();
                    if (rect.top <= 100) {
                        currentId = href;
                    }
                });
                items.forEach(function(item) {
                    item.classList.toggle('active', item.getAttribute('href') === currentId);
                });
            });
        }
    }

    /* ==========================================
       UTILITY: Copy to Clipboard
       ========================================== */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (e) {
            // Fallback failed
        }
        document.body.removeChild(textarea);
    }

    /* ==========================================
       INITIALIZATION
       ========================================== */
    function init() {
        initBackToTop();
        initTimeUpdate();
        initTitleParticles();
        initImagePreview();
        initErrorCodeCopy();
        initCodeBlockCopy();
        initVersionNavigation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
