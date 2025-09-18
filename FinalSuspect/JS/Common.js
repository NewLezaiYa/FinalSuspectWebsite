// 页面加载完成后执行动画
window.addEventListener('DOMContentLoaded', () => {
    // 初始化观察器
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`;
                observer.unobserve(entry.target); // 动画完成后停止观察
            }
        });
    }, {
        rootMargin: '0px 0px -50px 0px', // 提前50px触发
        threshold: 0.1
    });

    // 处理按钮动画（单独延迟）
    const backButton = document.querySelector('.back-button');
    backButton.style.animation = 'slideInLeft 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s forwards';

    // 处理标题动画（单独延迟）
    const title = document.querySelector('h1#clear-auto-logs');
    title.style.animation = 'scaleIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.4s forwards';

    // 观察文本内容区域
    const textSections = document.querySelectorAll('.text');
    textSections.forEach(section => {
        observer.observe(section);
    });

    // 添加按钮点击波纹效果
    backButton.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        // 移除波纹元素
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 添加动态样式（用于波纹效果）
const style = document.createElement('style');
style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }

            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);