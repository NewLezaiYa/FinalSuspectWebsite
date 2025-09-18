document.addEventListener('DOMContentLoaded', () => {
    // 确保元素存在（添加空值检查）
    const cnBtn = document.getElementById('cn-btn');
    const enBtn = document.getElementById('en-btn');
    const modalCnBtn = document.getElementById('modalCnBtn');
    const modalEnBtn = document.getElementById('modalEnBtn');
    const languageModal = document.getElementById('languageModal');
    const allLangSections = document.querySelectorAll('[data-lang]');
    const logo = document.querySelector('.hero-logo');

    // 从本地存储获取语言设置（限制为有效语言）
    const storedLang = localStorage.getItem('siteLang');
    const browserLang = navigator.language?.slice(0, 2)?.toLowerCase() || 'zh';
    const validLangs = ['zh', 'en'];
    const currentLang = storedLang && validLangs.includes(storedLang) 
        ? storedLang 
        : validLangs.includes(browserLang) 
            ? browserLang 
            : 'zh';

    // 初始化语言函数（添加调试日志）
    function initLanguage(lang) {
        console.log(`初始化语言: ${lang}`);
        allLangSections.forEach(section => {
            const sectionLang = section.dataset.lang?.toLowerCase();
            console.log(`检查区块: data-lang="${sectionLang}", 当前语言="${lang}"`);
            section.style.display = sectionLang === lang ? 'block' : 'none';
        });
        // 更新按钮状态（确保按钮存在时操作）
        if (cnBtn) cnBtn.classList.toggle('active', lang === 'zh');
        if (enBtn) enBtn.classList.toggle('active', lang === 'en');
        // 存储有效语言
        localStorage.setItem('siteLang', lang);
    }

    // 切换语言（添加动画和模态框关闭）
    function switchLanguage(lang) {
        if (!validLangs.includes(lang)) return; // 过滤无效语言
        initLanguage(lang);
        if (languageModal) languageModal.classList.remove('active');
        // 动画（确保body存在）
        document.body.style.transition = 'opacity 0.2s';
        document.body.style.opacity = 0.8;
        setTimeout(() => {
            document.body.style.opacity = 1;
        }, 200);
    }

    // 绑定事件（仅当按钮存在时绑定）
    if (cnBtn) cnBtn.addEventListener('click', () => switchLanguage('zh'));
    if (enBtn) enBtn.addEventListener('click', () => switchLanguage('en'));
    if (modalCnBtn) modalCnBtn.addEventListener('click', () => switchLanguage('zh'));
    if (modalEnBtn) modalEnBtn.addEventListener('click', () => switchLanguage('en'));

    // 初始加载逻辑
    if (!storedLang) { // 仅当本地无存储时检查是否显示模态框
        if (!validLangs.includes(browserLang)) {
            setTimeout(() => {
                if (languageModal) languageModal.classList.add('active');
            }, 800);
        } else {
            initLanguage(browserLang); // 浏览器语言有效时直接初始化
        }
    } else {
        initLanguage(currentLang);
    }

    // logo 悬停动画（确保logo存在时绑定）
    if (logo) {
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'scale(1.03)';
            logo.style.transition = 'transform 0.2s'; // 添加过渡更平滑
        });
        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'scale(1)';
        });
    }
});