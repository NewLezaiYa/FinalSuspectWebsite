// 为h2标题添加交互效果
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

    // 为带数字的h2初始化计数器
    if (h2.classList.contains('with-number')) {
        const container = h2.closest('.container, .content-section') || document.body;
        const sectionCounter = container.querySelectorAll('h2.with-number').length;

        // 可以为每个数字添加特殊效果
        const numberElement = document.createElement('span');
        numberElement.className = 'number-glow';
        numberElement.style.cssText = `
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            font-size: 2rem;
            font-weight: bold;
            color: rgba(0, 210, 255, 0.3);
            z-index: 0;
        `;
    }
});