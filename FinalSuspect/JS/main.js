// 创建粒子背景
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100 + 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 15;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
    }
}

// 主题切换功能
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // 检查本地存储或系统偏好
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        body.classList.add('dark-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });
}

// 滚动动画
function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// 语言切换功能
function setupLanguageSwitch() {
    const cnBtn = document.getElementById('cn-btn');
    const enBtn = document.getElementById('en-btn');
    const twBtn = document.getElementById('tw-btn');
    const mobileSelect = document.getElementById('mobileLanguageSelect');

    // 桌面端语言切换
    cnBtn.addEventListener('click', () => switchLanguage('zh'));
    enBtn.addEventListener('click', () => switchLanguage('en'));
    twBtn.addEventListener('click', () => switchLanguage('tw'));

    // 移动端语言切换
    mobileSelect.addEventListener('change', (e) => {
        switchLanguage(e.target.value);
    });
}

function switchLanguage(lang) {
    // 更新桌面端按钮状态
    document.querySelectorAll('.language-switch button').forEach(btn => {
        btn.classList.remove('active');
    });

    if (lang === 'zh') document.getElementById('cn-btn').classList.add('active');
    if (lang === 'en') document.getElementById('en-btn').classList.add('active');
    if (lang === 'tw') document.getElementById('tw-btn').classList.add('active');

    // 更新移动端选择器
    document.getElementById('mobileLanguageSelect').value = lang;

    // 显示/隐藏内容
    document.querySelectorAll('[data-lang]').forEach(content => {
        content.style.display = 'none';
    });
    document.querySelector(`[data-lang="${lang}"]`).style.display = 'block';
}

// 导航平滑滚动
function setupSmoothScroll() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 修改初始化函数（保持不变）
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupThemeToggle();
    setupScrollAnimations();
    setupLanguageSwitch();
    setupSmoothScroll();
});