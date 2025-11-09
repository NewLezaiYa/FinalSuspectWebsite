// 卡片动画效果
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.version-card');

    cards.forEach((card, index) => {
        // 设置延迟动画
        card.style.animationDelay = `${index * 0.1}s`;

        // 添加悬停效果
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 50px rgba(148, 163, 184, 0.3), 0 0 20px rgba(79, 109, 245, 0.4)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow-light), var(--tech-glow)';
        });
    });

    // 筛选按钮功能
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // 为当前按钮添加active类
            this.classList.add('active');

            // 这里可以添加实际的筛选逻辑
            console.log(`筛选: ${this.textContent}`);
        });
    });
});