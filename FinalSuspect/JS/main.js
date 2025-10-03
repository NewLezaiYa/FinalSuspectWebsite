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

    // 语言切换功能
    const allLangSections = document.querySelectorAll('[data-lang]');
    const desktopButtons = document.querySelectorAll('.language-switch button');
    const mobileSelect = document.getElementById('mobileLanguageSelect');

    // 初始化语言
    const savedLang = localStorage.getItem('siteLang') || 'zh';
    switchLanguage(savedLang);

    function switchLanguage(lang) {
        // 隐藏所有语言部分
        allLangSections.forEach(section => {
            section.style.display = 'none';
        });

        // 显示选中的语言部分
        document.querySelector(`[data-lang="${lang}"]`).style.display = 'block';

        // 更新活动状态
        desktopButtons.forEach(btn => btn.classList.remove('active'));
        mobileSelect.value = lang;

        // 根据语言代码设置活动状态
        if (lang === 'zh') {
            document.getElementById('cn-btn').classList.add('active');
        } else if (lang === 'en') {
            document.getElementById('en-btn').classList.add('active');
        } else if (lang === 'tw') {
            document.getElementById('tw-btn').classList.add('active');
        }

        // 保存语言选择
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

    // 粒子效果
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    function createParticles() {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('span');
            const size = Math.random() * 20 + 10;
            const posX = Math.random() * 100;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 5;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;

            particlesContainer.appendChild(particle);
        }
    }

    createParticles();
});