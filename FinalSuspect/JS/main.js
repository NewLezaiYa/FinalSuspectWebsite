document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = sunIcon;
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = sunIcon;
            localStorage.setItem('theme', 'light');
        } else {
            themeToggle.innerHTML = moonIcon;
            localStorage.setItem('theme', 'dark');
        }
    });

    const allLangSections = document.querySelectorAll('[data-lang]');
    const desktopButtons = document.querySelectorAll('.language-switch button');
    const mobileSelect = document.getElementById('mobileLanguageSelect');

    const savedLang = localStorage.getItem('siteLang') || 'zh';
    switchLanguage(savedLang);

    function switchLanguage(lang) {
        allLangSections.forEach(section => {
            section.style.display = 'none';
        });

        document.querySelector(`[data-lang="${lang}"]`).style.display = 'block';

        desktopButtons.forEach(btn => btn.classList.remove('active'));
        mobileSelect.value = lang;

        if (lang === 'zh') {
            document.getElementById('cn-btn').classList.add('active');
        } else if (lang === 'en') {
            document.getElementById('en-btn').classList.add('active');
        } else if (lang === 'tw') {
            document.getElementById('tw-btn').classList.add('active');
        }

        localStorage.setItem('siteLang', lang);
    }

    desktopButtons.forEach((button, index) => {
        button.addEventListener('click', function () {
            const lang = index === 0 ? 'zh' : index === 1 ? 'en' : 'tw';
            switchLanguage(lang);
        });
    });

    mobileSelect.addEventListener('change', function () {
        switchLanguage(this.value);
    });
});