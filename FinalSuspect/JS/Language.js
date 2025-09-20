document.addEventListener('DOMContentLoaded', () => {
    const cnBtn = document.getElementById('cn-btn');
    const enBtn = document.getElementById('en-btn');
    const modalCnBtn = document.getElementById('modalCnBtn');
    const modalEnBtn = document.getElementById('modalEnBtn');
    const languageModal = document.getElementById('languageModal');
    const allLangSections = document.querySelectorAll('[data-lang]');
    const logo = document.querySelector('.hero-logo');

    // 修复1：更健壮的语言检测逻辑（处理 navigator.language 为 null 的情况）
    const getBrowserLang = () => {
        const lang = navigator.language || navigator.userLanguage; // 兼容旧版 IE
        return lang ? lang.slice(0, 2).toLowerCase() : 'zh'; // 确保小写（如 "ZH" 转 "zh"）
    };

    const currentLang = localStorage.getItem('siteLang') || getBrowserLang();

    // 修复2：优化初始化语言函数（添加淡入淡出效果）
    function initLanguage(lang) {
        // 先隐藏所有语言内容（带过渡）
        allLangSections.forEach(section => {
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
        });

        // 延迟显示目标语言内容（等待过渡完成）
        setTimeout(() => {
            allLangSections.forEach(section => {
                const shouldShow = section.dataset.lang === lang;
                section.style.display = shouldShow ? 'block' : 'none';
                section.style.opacity = shouldShow ? '1' : '0';
                section.style.visibility = shouldShow ? 'visible' : 'hidden';
            });

            // 更新按钮状态
            cnBtn.classList.toggle('active', lang === 'zh');
            enBtn.classList.toggle('active', lang === 'en');

            // 存储语言设置
            localStorage.setItem('siteLang', lang);
        }, 200); // 与 CSS 动画时间一致
    }

    // 修复3：简化切换函数（移除冗余的模态框透明度动画）
    function switchLanguage(lang) {
        initLanguage(lang);
        languageModal.classList.remove('active');
    }

    // 绑定事件（保持不变）
    cnBtn.addEventListener('click', () => switchLanguage('zh'));
    enBtn.addEventListener('click', () => switchLanguage('en'));
    modalCnBtn.addEventListener('click', () => switchLanguage('zh'));
    modalEnBtn.addEventListener('click', () => switchLanguage('en'));

    // 初始加载逻辑（修复1后更健壮）
    if (!currentLang || !['zh', 'en'].includes(currentLang)) {
        setTimeout(() => languageModal.classList.add('active'), 800);
    } else {
        initLanguage(currentLang);
    }

    // logo 悬停动画（保持不变）
    if (logo) {
        logo.addEventListener('mouseenter', () => logo.style.transform = 'scale(1.03)');
        logo.addEventListener('mouseleave', () => logo.style.transform = 'scale(1)');
    }
});