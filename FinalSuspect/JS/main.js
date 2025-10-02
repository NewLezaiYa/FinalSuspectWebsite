document.addEventListener('DOMContentLoaded', function () {
    // 粒子背景优化 - 使用requestAnimationFrame
    const particlesContainer = document.querySelector('.particles');
    const particlesCount = 30; // 减少粒子数量提升性能

    function createParticle() {
        const particle = document.createElement('span');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 20 + 8 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = Math.random() * 15 + 10 + 's';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.opacity = Math.random() * 0.4 + 0.2;
        particlesContainer.appendChild(particle);
        return particle;
    }

    // 使用requestAnimationFrame优化动画性能
    let animationFrameId;
    function animateParticles() {
        for (let i = 0; i < particlesCount; i++) {
            const particle = createParticle();
            setTimeout(() => particle.remove(), 20000); // 自动移除旧粒子
        }
        animationFrameId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 浮动图标优化 - 使用CSS动画
    const floatingIconsContainer = document.querySelector('.floating-icons');
    const icons = ['fa-microchip', 'fa-atom', 'fa-code', 'fa-server', 'fa-network-wired'];
    const iconsCount = 10; // 减少图标数量

    for (let i = 0; i < iconsCount; i++) {
        const icon = document.createElement('i');
        icon.className = `floating-icon fas ${icons[Math.floor(Math.random() * icons.length)]}`;
        icon.style.left = Math.random() * 100 + '%';
        icon.style.top = Math.random() * 100 + '%';
        icon.style.fontSize = Math.random() * 1.5 + 1 + 'rem';
        floatingIconsContainer.appendChild(icon);
    }

    // 语言切换优化
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    // 使用CSS自定义属性存储主题状态
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

    // 语言切换优化
    const cnBtn = document.getElementById('cn-btn');
    const enBtn = document.getElementById('en-btn');
    const twBtn = document.getElementById('tw-btn');
    const languageModal = document.getElementById('languageModal');
    const allLangSections = document.querySelectorAll('[data-lang]');
    const logo = document.querySelector('.hero-logo');

    // 使用Intersection Observer优化显示

    const currentLang = localStorage.getItem('siteLang') || getBrowserLang();

    function getBrowserLang() {
        return navigator.languages ? navigator.languages[0].slice(0, 2).toLowerCase() : 'zh';
    }

    // 使用CSS过渡代替JS动画
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

    // 事件委托优化
    document.addEventListener('click', (e) => {
        if (e.target.closest('.lang-btn')) {
            const lang = e.target.closest('.lang-btn').dataset.lang;
            switchLanguage(lang);
        }
    });

    // 优化图片懒加载
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

    // 性能优化
    particlesContainer.addEventListener('mouseover', () => cancelAnimationFrame(animationFrameId));
    particlesContainer.addEventListener('mouseout', animateParticles);

    // 关闭模态框的通用处理
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => languageModal.classList.remove('active'));
    });

    // Logo hover效果优化
    logo.addEventListener('mouseenter', () => logo.classList.add('hover'));
    logo.addEventListener('mouseleave', () => logo.classList.remove('hover'));

    // CSS动画定义
    const style = document.createElement('style');
    style.textContent = `
        [data-lang] { opacity: 0; transition: opacity 0.3s; }
        [data-lang].active { opacity: 1; }
        .hover { transform: scale(1.05); }
    `;
    document.head.appendChild(style);
});