/* ============================================================
   FinalSuspect Website - 404 Error Page
   ============================================================ */

(function() {
    'use strict';

    // Pre-inject shared keyframe animations once
    function injectKeyframes() {
        var style = document.createElement('style');
        style.textContent =
            '@keyframes error-float {' +
            '0% { transform: translateY(0) rotate(0deg); opacity: 1; }' +
            '100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }' +
            '}' +
            '@keyframes rippleExpand {' +
            '0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }' +
            '100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }' +
            '}' +
            '@keyframes sparkExplode {' +
            '0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }' +
            '100% { transform: translate(calc(-50% + var(--sx)), calc(-50% + var(--sy))) scale(1); opacity: 0; }' +
            '}';
        document.head.appendChild(style);
    }

    // Create decorative error particles
    function createErrorParticles() {
        var header = document.querySelector('header');
        if (!header) return;

        for (var i = 0; i < 30; i++) {
            var particle = document.createElement('div');
            particle.className = 'error-particle';

            var left = Math.random() * 100;
            var top = Math.random() * 100;
            var size = 2 + Math.random() * 4;
            var delay = Math.random() * 3;
            var duration = 3 + Math.random() * 4;
            var opacity = 0.2 + Math.random() * 0.3;

            particle.style.cssText =
                'position:absolute;' +
                'left:' + left + '%;' +
                'top:' + top + '%;' +
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'background:' + (Math.random() > 0.5 ? '#00d2ff' : '#ff4757') + ';' +
                'border-radius:50%;' +
                'opacity:' + opacity + ';' +
                'filter:blur(' + (1 + Math.random()) + 'px);' +
                'animation:error-float ' + duration + 's linear ' + delay + 's infinite;' +
                'pointer-events:none;' +
                'z-index:1;';

            header.appendChild(particle);
        }
    }

    // Set up error code interactions
    function setupErrorCodeInteraction() {
        var errorCode = document.querySelector('.error-code');
        if (!errorCode) return;

        errorCode.addEventListener('mouseenter', function() {
            this.style.animationDuration = '2s';
            this.style.filter = 'drop-shadow(0 0 30px rgba(0, 210, 255, 0.8))';
            createRippleEffect(this);
        });

        errorCode.addEventListener('mouseleave', function() {
            this.style.animationDuration = '4s';
            this.style.filter = 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))';
        });

        errorCode.addEventListener('click', function() {
            for (var i = 0; i < 20; i++) {
                var spark = document.createElement('div');
                spark.className = 'error-spark';

                var angle = Math.random() * Math.PI * 2;
                var distance = 50 + Math.random() * 100;
                var x = Math.cos(angle) * distance;
                var y = Math.sin(angle) * distance;
                var color = Math.random() > 0.5 ? '#ff4757' : '#00d2ff';

                spark.style.cssText =
                    'position:absolute;' +
                    'left:50%;top:50%;' +
                    'width:' + (3 + Math.random() * 5) + 'px;' +
                    'height:' + (3 + Math.random() * 5) + 'px;' +
                    'background:' + color + ';' +
                    'border-radius:50%;' +
                    'box-shadow:0 0 15px ' + color + ';' +
                    '--sx:' + x + 'px;' +
                    '--sy:' + y + 'px;' +
                    'animation:sparkExplode 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;' +
                    'pointer-events:none;' +
                    'z-index:10;';

                errorCode.appendChild(spark);

                setTimeout(function() {
                    spark.remove();
                }, 800);
            }
        });
    }

    // Create ripple effect on hover
    function createRippleEffect(element) {
        var ripple = document.createElement('div');
        ripple.style.cssText =
            'position:absolute;' +
            'top:50%;left:50%;' +
            'width:100%;height:100%;' +
            'border:3px solid #00d2ff;' +
            'border-radius:50%;' +
            'transform:translate(-50%, -50%) scale(0);' +
            'opacity:0.5;' +
            'animation:rippleExpand 0.6s ease-out forwards;' +
            'pointer-events:none;' +
            'z-index:-1;';

        element.appendChild(ripple);

        setTimeout(function() {
            ripple.remove();
        }, 600);
    }

    // Initialize on DOM ready
    function init() {
        injectKeyframes();
        createErrorParticles();
        setupErrorCodeInteraction();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Redirect to homepage after 3 seconds
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.location.href = 'https://finalsuspect.pages.dev/';
        }, 3000);
    });

})();
