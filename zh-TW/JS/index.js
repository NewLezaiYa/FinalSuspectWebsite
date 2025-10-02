// 粒子背景生成
document.addEventListener('DOMContentLoaded', function () {
    const particlesContainer = document.querySelector('.particles');
    const particlesCount = 15;

    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('span');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 30 + 10 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particlesContainer.appendChild(particle);
    }

    // 按钮悬停效果增强
    const buttons = document.querySelectorAll('.jump-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
    // 昼夜模式切换功能
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = sunIcon;
    }

    // 切换主题
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = sunIcon;
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = moonIcon;
            localStorage.setItem('theme', 'light');
        }
    });
});