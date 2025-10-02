document.addEventListener('DOMContentLoaded', function () {
    // 昼夜模式切换功能
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = sunIcon;
    }

    // 切换主题
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = sunIcon;
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = moonIcon;
            localStorage.setItem('theme', 'light');
        }
    });
    const cnBtn = document.getElementById('cn-btn');
    const enBtn = document.getElementById('en-btn');
    const twBtn = document.getElementById('tw-btn');
    const modalCnBtn = document.getElementById('modalCnBtn');
    const modalEnBtn = document.getElementById('modalEnBtn');
    const modalTwBtn = document.getElementById('modalTwBtn');
    const languageModal = document.getElementById('languageModal');
    const allLangSections = document.querySelectorAll('[data-lang]');
    const logo = document.querySelector('.hero-logo');
    const getBrowserLang = () => {
        const lang = navigator.language || navigator.userLanguage;
        return lang ? lang.slice(0, 2).toLowerCase() : 'zh';
    };
    const currentLang = localStorage.getItem('siteLang') || getBrowserLang();
    function initLanguage(lang) {
        allLangSections.forEach((section) => {
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
        });
        setTimeout(() => {
            allLangSections.forEach((section) => {
                const shouldShow = section.dataset.lang === lang;
                section.style.display = shouldShow ? 'block' : 'none';
                section.style.opacity = shouldShow ? '1' : '0';
                section.style.visibility = shouldShow ? 'visible' : 'hidden';
            });
            cnBtn.classList.toggle('active', lang === 'zh');
            enBtn.classList.toggle('active', lang === 'en');
            twBtn.classList.toggle('active', lang === 'tw');
            localStorage.setItem('siteLang', lang);
        }, 200);
    }
    function switchLanguage(lang) {
        initLanguage(lang);
        languageModal.classList.remove('active');
    }
    cnBtn.addEventListener('click', () => switchLanguage('zh'));
    enBtn.addEventListener('click', () => switchLanguage('en'));
    twBtn.addEventListener('click', () => switchLanguage('tw'));
    modalCnBtn.addEventListener('click', () => switchLanguage('zh'));
    modalEnBtn.addEventListener('click', () => switchLanguage('en'));
    modalTwBtn.addEventListener('click', () => switchLanguage('tw'));
    if (!currentLang || !['zh', 'en', 'tw'].includes(currentLang)) {
        setTimeout(() => languageModal.classList.add('active'), 800);
    } else {
        initLanguage(currentLang);
    }
    logo.addEventListener('mouseenter', () => logo.classList.add('hover'));
    logo.addEventListener('mouseleave', () => logo.classList.remove('hover'));
});
