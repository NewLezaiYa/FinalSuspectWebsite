// ======================
// 1. 元素入场动画（页面加载时触发）
// ======================
function initEntranceAnimations() {
    // 选择所有需要动画的元素（根据你的类名调整）
    const fadeElements = document.querySelectorAll('.animate-fade-in');
    const cardElements = document.querySelectorAll('.animate-card');

    // 延迟触发入场动画（模拟「依次出现」效果）
    fadeElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });

    cardElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.15 + 0.2}s`; // 比标题稍晚
    });
}

// ======================
// 2. 卡片悬停弹性动画（增强交互反馈）
// ======================
function enhanceCardHover() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // 添加弹性缩放类（配合 CSS 过渡）
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            // 恢复原始状态
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ======================
// 3. 按钮弹性点击动画（物理反馈感）
// ======================
function addBtnSpringEffect() {
    const btn = document.getElementById('interactiveBtn');

    btn.addEventListener('click', (e) => {
        // 记录原始位置
        const originalTransform = btn.style.transform;

        // 添加弹性形变（缩放 + 位移）
        btn.style.transform = 'scale(0.95) translateY(1px)';

        // 0.1s 后恢复，模拟弹簧回弹
        setTimeout(() => {
            btn.style.transform = originalTransform;
        }, 100);
    });
}

// ======================
// 4. 鼠标跟随光效（可选，提升质感）
// ======================
function initCursorLight() {
    const cursorLight = document.querySelector('.cursor-light');

    document.addEventListener('mousemove', (e) => {
        // 延迟跟随（更自然）
        requestAnimationFrame(() => {
            cursorLight.style.left = `${e.clientX}px`;
            cursorLight.style.top = `${e.clientY}px`;
            cursorLight.style.opacity = '1';
        });
    });

    // 鼠标离开窗口时隐藏光效
    document.addEventListener('mouseleave', () => {
        cursorLight.style.opacity = '0';
    });
}

// ======================
// 初始化所有动画
// ======================
window.addEventListener('load', () => {
    initEntranceAnimations();
    enhanceCardHover();
    addBtnSpringEffect();
    initCursorLight();
});