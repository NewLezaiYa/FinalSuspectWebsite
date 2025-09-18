// ClearAutoLogs.js
document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有动画元素
    initAnimations();
    
    // 绑定返回按钮交互
    bindBackButton();
});

function initAnimations() {
    // 获取所有需要动画的元素（明确选择器）
    const backButton = document.querySelector('.back-button');
    const title = document.getElementById('clear-auto-logs');
    const textContainer = document.querySelector('.text');
    const textParagraphs = textContainer.querySelectorAll('p'); // 直接选择 p 标签

    // 返回按钮动画（延迟 100ms 启动）
    setTimeout(() => {
        backButton.classList.remove('hidden');
        backButton.classList.add('animate-slideInTop');
    }, 100);

    // 主标题动画（延迟 200ms 启动）
    setTimeout(() => {
        if (title) { // 确保元素存在
            title.classList.remove('hidden');
            title.classList.add('animate-fadeInUp');
        }
    }, 200);

    // 文本内容逐段动画（延迟 300ms 起，每段间隔 100ms）
    if (textParagraphs.length > 0) { // 确保段落存在
        textParagraphs.forEach((p, index) => {
            setTimeout(() => {
                p.classList.remove('hidden'); // 移除隐藏类
                p.classList.add('animate-fadeIn'); // 添加动画类
            }, 300 + index * 100);
        });
    } else {
        console.error('未找到文本内容段落！'); // 调试用提示
    }
}

function bindBackButton() {
    const backButton = document.querySelector('.back-button');
    if (!backButton) return;

    // 点击涟漪效果
    backButton.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // 移动端触摸反馈
    backButton.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
    });

    backButton.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
    });
}