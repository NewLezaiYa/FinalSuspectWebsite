// 为错误代码添加点击复制功能
document.querySelectorAll('.error-code').forEach(errorCode => {
    errorCode.style.cursor = 'pointer';
    errorCode.title = '点击复制错误代码';

    errorCode.addEventListener('click', async function () {
        const text = this.textContent;

        try {
            await navigator.clipboard.writeText(text);

            // 添加反馈效果
            const originalText = this.textContent;
            const originalBg = this.style.background;
            const originalColor = this.style.color;

            this.textContent = '已复制!';
            this.style.background = 'linear-gradient(145deg, rgba(9, 187, 7, 0.2) 0%, rgba(10, 10, 26, 0.9) 100%)';
            this.style.color = '#09bb07';
            this.style.borderColor = 'rgba(9, 187, 7, 0.4)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(9, 187, 7, 0.3)';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = originalBg;
                this.style.color = originalColor;
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }, 1500);

        } catch (err) {
            console.error('复制失败:', err);
            this.textContent = '复制失败';
            this.style.color = '#ff5555';

            setTimeout(() => {
                this.textContent = text;
                this.style.color = '';
            }, 1500);
        }
    });
});

// 为链接添加悬停效果增强
document.querySelectorAll('a').forEach(link => {
    // 添加波纹效果
    link.addEventListener('mouseenter', function (e) {
        // 创建波纹元素
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(0, 210, 255, 0.2)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '0';

        // 获取链接位置
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        // 移除波纹
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// 添加波纹动画
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 为外链添加图标
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    // 确保已经添加了 ↗ 符号
    if (!link.innerHTML.includes('↗')) {
        link.innerHTML += ' <span style="font-size:0.9rem;opacity:0.7;">↗</span>';
    }
});