document.addEventListener('DOMContentLoaded', () => {
    // 元素缓存（带空值检查）
    const elements = {
        cnBtn: document.getElementById('cn-btn'),
        enBtn: document.getElementById('en-btn'),
        modalCnBtn: document.getElementById('modalCnBtn'),
        modalEnBtn: document.getElementById('modalEnBtn'),
        languageModal: document.getElementById('languageModal'),
        allLangSections: document.querySelectorAll('[data-lang]'),
        logo: document.querySelector('.hero-logo')
    };

    // 语言配置
    const validLangs = ['zh', 'en'];
    const storedLang = localStorage.getItem('siteLang');
    const browserLang = (navigator.language || navigator.userLanguage)?.slice(0, 2)?.toLowerCase() || 'zh';

    // 确定当前语言（优先本地存储，其次浏览器语言）
    let currentLang;
    if (storedLang && validLangs.includes(storedLang)) {
        currentLang = storedLang;
    } else if (validLangs.includes(browserLang)) {
        currentLang = browserLang;
    } else {
        currentLang = 'zh'; // 默认中文
    }

    // 初始化语言显示
    function initLanguage(lang) {
        if (window.currentLang === lang) return; // 防止重复初始化
        window.currentLang = lang;

        // 显示/隐藏语言区块
        elements.allLangSections.forEach(section => {
            const sectionLang = section.dataset.lang?.toLowerCase();
            section.style.display = sectionLang === lang ? 'block' : 'none';
            section.style.opacity = '1'; // 强制显示（避免CSS过渡遮挡）
            section.style.transform = 'scale(1)';
        });

        // 更新按钮激活状态
        if (elements.cnBtn) elements.cnBtn.classList.toggle('active', lang === 'zh');
        if (elements.enBtn) elements.enBtn.classList.toggle('active', lang === 'en');

        // 存储到本地
        localStorage.setItem('siteLang', lang);
    }

    // 切换语言（带动画）
    let isSwitching = false;
    function switchLanguage(lang) {
        if (!validLangs.includes(lang) || isSwitching || window.currentLang === lang) return;
        isSwitching = true;

        // 关闭模态框并重置动画
        if (elements.languageModal) {
            elements.languageModal.classList.remove('active');
            const modalContent = elements.languageModal.querySelector('.modal-content');
            if (modalContent) modalContent.style.transform = 'translateY(20px) scale(0.95)';
        }

        // 初始化语言
        initLanguage(lang);

        // 页面透明度动画
        document.body.style.transition = 'opacity 0.2s ease';
        document.body.style.opacity = '0.8';

        setTimeout(() => {
            document.body.style.opacity = '1';
            isSwitching = false;
        }, 200);
    }

    // 绑定事件（仅元素存在时绑定）
    if (elements.cnBtn) elements.cnBtn.addEventListener('click', () => switchLanguage('zh'));
    if (elements.enBtn) elements.enBtn.addEventListener('click', () => switchLanguage('en'));
    if (elements.modalCnBtn) elements.modalCnBtn.addEventListener('click', () => switchLanguage('zh'));
    if (elements.modalEnBtn) elements.modalEnBtn.addEventListener('click', () => switchLanguage('en'));

    // 初始加载逻辑（首次访问显示模态框）
    if (!storedLang) {
        setTimeout(() => {
            if (elements.languageModal) elements.languageModal.classList.add('active');
        }, 800);
    } else {
        initLanguage(currentLang);
    }

    // Logo悬停动画
    if (elements.logo) {
        elements.logo.style.transition = 'transform 0.2s ease';
        elements.logo.addEventListener('mouseenter', () => {
            elements.logo.style.transform = 'scale(1.03)';
        });
        elements.logo.addEventListener('mouseleave', () => {
            elements.logo.style.transform = 'scale(1)';
        });
    }
});