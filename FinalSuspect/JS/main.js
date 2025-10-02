document.addEventListener('DOMContentLoaded', function () {
    // 语言切换
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // 初始化主题
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? sunIcon : moonIcon;
    });

    // 语言切换
    const cnBtn = document.getElementById('cn-btn');
    const enBtn = document.getElementById('en-btn');
    const twBtn = document.getElementById('tw-btn');
    const languageModal = document.getElementById('languageModal');
    const allLangSections = document.querySelectorAll('[data-lang]');
    const logo = document.querySelector('.hero-logo');

    const currentLang = localStorage.getItem('siteLang') || getBrowserLang();

    function getBrowserLang() {
        return navigator.languages ? navigator.languages[0].slice(0, 2).toLowerCase() : 'zh';
    }

    const switchLanguage = (lang) => {
        allLangSections.forEach(section => {
            section.style.display = section.dataset.lang === lang ? 'block' : 'none';
        });

        cnBtn.classList.toggle('active', lang === 'zh');
        enBtn.classList.toggle('active', lang === 'en');
        twBtn.classList.toggle('active', lang === 'tw');

        localStorage.setItem('siteLang', lang);
        languageModal.classList.remove('active');
    };

    // 初始化语言
    if (!currentLang) {
        setTimeout(() => languageModal.classList.add('active'), 1000);
    } else {
        switchLanguage(currentLang);
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.lang-btn')) {
            const lang = e.target.closest('.lang-btn').dataset.lang;
            switchLanguage(lang);
        }
    });

    const images = document.querySelectorAll('img[data-src]');
    const loadImages = () => {
        images.forEach(img => {
            if (img.getBoundingClientRect().top < window.innerHeight) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    };
    window.addEventListener('scroll', loadImages);
    loadImages();

    particlesContainer.addEventListener('mouseover', () => cancelAnimationFrame(animationFrameId));
    particlesContainer.addEventListener('mouseout', animateParticles);

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => languageModal.classList.remove('active'));
    });

    logo.addEventListener('mouseenter', () => logo.classList.add('hover'));
    logo.addEventListener('mouseleave', () => logo.classList.remove('hover'));

    const style = document.createElement('style');
    style.textContent = `
        [data-lang] { opacity: 0; transition: opacity 0.3s; }
        [data-lang].active { opacity: 1; }
        .hover { transform: scale(1.05); }
    `;
    document.head.appendChild(style);
});