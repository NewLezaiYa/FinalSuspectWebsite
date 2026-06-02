// 为h2标题添加交互效果
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('h2').forEach(h2 => {
        // 添加点击滚动效果
        h2.addEventListener('click', function () {
            // 添加点击反馈动画
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';

            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 300);

            // 平滑滚动到下一个元素
            const nextElement = this.nextElementSibling;
            if (nextElement && nextElement.scrollIntoView) {
                nextElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});