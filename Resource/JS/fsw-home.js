/* ============================================================
   FinalSuspect Website - Homepage JavaScript
   合并自: Load.js + main.js + Wechat.js + Appreciate.js
   ============================================================ */

(function() {
    'use strict';

    // Shared color constants (mirror CSS variables)
    var ACCENT_BORDER = '2px solid rgba(0,210,255,0.5)';

    /* ==========================================
       1. LOADING SEQUENCE (from Load.js)
       ========================================== */
    function initLoading() {
        var loaderSection = document.querySelector('.loader-section');
        var wrapper = document.querySelector('.wrapper');
        var loadPercentage = document.querySelector('.load-percentage');
        var consoleLine = document.querySelector('.console-line');

        if (!loaderSection) return;

        // Sync with CSS --loadbar-duration (3s default)
        var duration = 3000;
        var interval = 30;
        var steps = duration / interval;
        var current = 0;

        var loadInterval = setInterval(function() {
            current += 100 / steps;
            if (current >= 100) {
                current = 100;
                clearInterval(loadInterval);

                if (wrapper) {
                    wrapper.classList.add('is-loaded');
                }

                setTimeout(function() {
                    if (loaderSection) {
                        loaderSection.style.display = 'none';
                    }
                    document.body.style.overflow = '';
                }, 400);
            }

            if (loadPercentage) {
                loadPercentage.textContent = Math.min(Math.floor(current), 100) + '%';
            }

            // Show console messages based on progress
            if (consoleLine) {
                if (current > 20 && !consoleLine.classList.contains('visible')) {
                    consoleLine.textContent = '> Initializing system components...';
                    consoleLine.classList.add('visible');
                }
                if (current > 60) {
                    consoleLine.textContent = '> Loading assets... [' + Math.floor(current) + '%]';
                }
                if (current > 85) {
                    consoleLine.textContent = '> Finalizing setup...';
                }
                if (current >= 100) {
                    consoleLine.textContent = '> System ready. Welcome.';
                }
            }
        }, interval);

        document.body.style.overflow = 'hidden';
    }

    /* ==========================================
       2. MAIN PAGE SCRIPTS (from main.js)
       ========================================== */

    function initHomeNavigation() {
        // Navigation bar shadow on scroll
        var header = document.querySelector('.site-header');
        if (!header) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    /* ==========================================
       3. WECHAT POPUP (from Wechat.js)
       ========================================== */
    function initWechatPopup() {
        var wechatCard = document.querySelector('.wechat-card');
        if (!wechatCard) return;

        wechatCard.addEventListener('click', function() {
            var overlay = document.createElement('div');
            overlay.style.cssText =
                'position:fixed;top:0;left:0;width:100%;height:100%;' +
                'background:rgba(0,0,0,0.9);z-index:10000;' +
                'display:flex;align-items:center;justify-content:center;cursor:pointer;';

            var img = document.createElement('img');
            var qrImg = wechatCard.querySelector('img');
            if (qrImg) {
                img.src = qrImg.src;
            }
            img.style.cssText = 'max-width:80%;max-height:80%;border-radius:12px;' +
                'border:' + ACCENT_BORDER + ';';

            overlay.appendChild(img);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function() {
                overlay.remove();
            });
        });
    }

    /* ==========================================
       4. APPRECIATE POPUP (from Appreciate.js)
       ========================================== */
    function initAppreciatePopup() {
        var cards = document.querySelectorAll('.appreciate-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var overlay = document.createElement('div');
                overlay.style.cssText =
                    'position:fixed;top:0;left:0;width:100%;height:100%;' +
                    'background:rgba(0,0,0,0.9);z-index:10000;' +
                    'display:flex;align-items:center;justify-content:center;cursor:pointer;';

                var img = document.createElement('img');
                var payImg = card.querySelector('img');
                if (payImg) {
                    img.src = payImg.src;
                }
                img.style.cssText = 'max-width:80%;max-height:80%;border-radius:12px;' +
                    'border:' + ACCENT_BORDER + ';';

                overlay.appendChild(img);
                document.body.appendChild(overlay);

                overlay.addEventListener('click', function() {
                    overlay.remove();
                });
            });
        });
    }

    /* ==========================================
       INITIALIZATION
       ========================================== */
    function init() {
        initLoading();
        initHomeNavigation();
        initWechatPopup();
        initAppreciatePopup();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
