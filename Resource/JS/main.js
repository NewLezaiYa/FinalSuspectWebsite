// 平滑滚动到锚点
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// 悬停效果增强
const sections = document.querySelectorAll('.section');
sections.forEach(section => {
    section.addEventListener('mouseenter', () => {
        section.style.transform = 'translateY(-10px)';
    });

    section.addEventListener('mouseleave', () => {
        section.style.transform = 'translateY(0)';
    });
});