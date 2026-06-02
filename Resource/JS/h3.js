// 为h3标题添加点击效果
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('h3').forEach(h3 => {
        h3.addEventListener('click', function () {
            // 添加点击反馈动画
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.2s ease';

            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);

            // 如果h3下面有内容，可以平滑滚动到内容
            const nextElement = this.nextElementSibling;
            if (nextElement) {
                nextElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});