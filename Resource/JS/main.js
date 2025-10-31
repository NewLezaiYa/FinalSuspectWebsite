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

        // 添加随机颜色和脉冲效果
        const hue = 240 + Math.random() * 30; // 蓝色到紫色范围
        particle.style.background = `hsla(${hue}, 70%, 60%, 0.2)`;
        particle.style.boxShadow = `
            0 0 ${10 + size}px hsla(${hue}, 70%, 60%, 0.5),
            0 0 ${20 + size}px hsla(${hue}, 70%, 60%, 0.3),
            0 0 ${30 + size}px hsla(${hue}, 70%, 60%, 0.1)`;
    }
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

    // 添加切换动画
    const activeContent = document.querySelector(`[data-lang="${lang}"]`);
    activeContent.style.opacity = '0';
    activeContent.style.transform = 'translateY(20px)';
    activeContent.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        activeContent.style.opacity = '1';
        activeContent.style.transform = 'translateY(0)';
    }, 50);
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

// 添加悬停效果到功能区域
function setupSectionHoverEffects() {
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.classList.add('section-hover');
        });

        section.addEventListener('mouseleave', () => {
            section.classList.remove('section-hover');
        });
    });
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupScrollAnimations();
    setupLanguageSwitch();
    setupSectionHoverEffects();
});