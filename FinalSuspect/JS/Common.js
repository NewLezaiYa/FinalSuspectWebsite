// ClearAutoLogs.js
document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有动画元素
    initAnimations();
    
    // 绑定返回按钮交互
    bindBackButton();
});

function initAnimations() {
    // 获取所有需要动画的元素
    const backButton = document.querySelector('.back-button');
    const title = document.getElementById('clear-auto-logs');
    const textContainer = document.querySelector('.text');
    const textParagraphs = textContainer.querySelectorAll('p');

    // 返回按钮动画（延迟 100ms 启动）
    setTimeout(() => {
        backButton.classList.remove('hidden');
        backButton.classList.add('animate-slideInTop');
    }, 100);

    // 主标题动画（延迟 200ms 启动）
    setTimeout(() => {
        title.classList.remove('hidden');
        title.classList.add('animate-fadeInUp');
    }, 200);

    // 文本内容逐段动画（延迟 300ms 起，每段间隔 100ms）
    textParagraphs.forEach((p, index) => {
        setTimeout(() => {
            p.classList.remove('hidden');
            p.classList.add('animate-fadeIn');
        }, 300 + index * 100);
    });
}

function bindBackButton() {
    const backButton = document.querySelector('.back-button');
    if (!backButton) return;

    // 点击涟漪效果
    backButton.addEventListener('click', function(e) {
        // 创建涟漪元素
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // 计算涟漪位置
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        // 设置涟漪样式
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // 添加并移除涟漪
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // 触摸反馈（移动端）
    backButton.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });

    backButton.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
}