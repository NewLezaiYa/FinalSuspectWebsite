// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面动画
    initPageAnimations();
    
    // 为返回按钮添加额外交互
    initBackButtonAnimation();
});

function initPageAnimations() {
    const container = document.querySelector('.container');
    const headerTitle = document.querySelector('.header h1');
    const jumpButtons = document.querySelectorAll('.jump-btn');

    // 容器整体淡入向上动画
    setTimeout(() => {
        container.classList.add('animate');
    }, 100);

    // 标题延迟滑动动画
    if (headerTitle) {
        setTimeout(() => {
            headerTitle.classList.add('animate');
        }, 300);
    }

    // 功能按钮依次滑入动画（带延迟间隔）
    jumpButtons.forEach((btn, index) => {
        setTimeout(() => {
            btn.classList.add('animate');
        }, 300 + index * 80); // 每个按钮间隔 80ms
    });
}

function initBackButtonAnimation() {
    const backButton = document.querySelector('.back-button');
    if (!backButton) return;

    // 初始隐藏按钮（移动端会隐藏，PC 端需要入场动画）
    if (window.innerWidth > 768) {
        backButton.style.opacity = '0';
        backButton.style.transform = 'translateY(-50%) translateX(20px)';
        
        setTimeout(() => {
            backButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            backButton.style.opacity = '1';
            backButton.style.transform = 'translateY(-50%) translateX(0)';
        }, 500);
    }

    // 添加点击涟漪效果
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
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}