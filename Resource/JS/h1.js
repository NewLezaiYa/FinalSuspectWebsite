// 为h1标题添加粒子效果
function createParticlesForTitle() {
    const h1Elements = document.querySelectorAll('h1');

    h1Elements.forEach(h1 => {
        // 创建粒子
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('span');
            particle.className = 'particle';

            // 随机位置
            const left = Math.random() * 100;
            const delay = Math.random() * 4;
            const duration = 2 + Math.random() * 3;

            particle.style.left = `${left}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;

            // 随机颜色
            const colors = ['#ff4757', '#ff6b81', '#00d2ff', '#7158e2'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 10px ${color}`;

            h1.appendChild(particle);
        }

        // 鼠标悬停时增加粒子效果
        h1.addEventListener('mouseenter', function () {
            // 创建额外的粒子
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('span');
                particle.className = 'particle';

                // 从标题中心向外扩散
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 50;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                particle.style.left = `calc(50% + ${x}px)`;
                particle.style.top = `calc(50% + ${y}px)`;
                particle.style.animationDelay = '0s';
                particle.style.animationDuration = `${1 + Math.random()}s`;

                // 使用随机颜色
                const colors = ['#ff4757', '#00d2ff'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.background = color;
                particle.style.boxShadow = `0 0 15px ${color}`;

                h1.appendChild(particle);

                // 移除粒子
                setTimeout(() => {
                    particle.remove();
                }, 2000);
            }

            // 增强标题发光效果
            h1.style.textShadow =
                '0 0 20px rgba(0, 210, 255, 0.8), ' +
                '0 0 30px rgba(0, 210, 255, 0.6), ' +
                '0 0 40px rgba(113, 88, 226, 0.4), ' +
                '0 0 50px rgba(255, 71, 87, 0.3)';

            // 增加动画速度
            h1.style.animationDuration = '3s';
        });

        h1.addEventListener('mouseleave', function () {
            // 恢复原来的阴影
            h1.style.textShadow =
                '0 0 10px rgba(0, 210, 255, 0.5), ' +
                '0 0 20px rgba(0, 210, 255, 0.3), ' +
                '0 0 30px rgba(113, 88, 226, 0.2), ' +
                '0 2px 10px rgba(0, 0, 0, 0.5)';

            // 恢复动画速度
            h1.style.animationDuration = '6s';
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    createParticlesForTitle();

    // 为动态标题添加特殊效果
    const dynamicTitle = document.getElementById('dynamic-title');
    if (dynamicTitle) {
        let isAnimating = false;

        dynamicTitle.addEventListener('click', function () {
            if (isAnimating) return;

            isAnimating = true;

            // 创建爆炸效果
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('span');
                particle.className = 'particle';
                particle.style.position = 'absolute';

                const angle = Math.random() * Math.PI * 2;
                const velocity = 100 + Math.random() * 150;
                const x = Math.cos(angle) * velocity;
                const y = Math.sin(angle) * velocity;

                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.animation = `explode 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`;

                // 动态设置关键帧
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes explode {
                        0% {
                            transform: translate(-50%, -50%) scale(0);
                            opacity: 1;
                        }
                        100% {
                            transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);

                // 随机颜色
                const colors = ['#ff4757', '#ff6b81', '#00d2ff', '#7158e2'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.background = color;
                particle.style.boxShadow = `0 0 15px ${color}`;
                particle.style.width = `${4 + Math.random() * 6}px`;
                particle.style.height = particle.style.width;

                dynamicTitle.appendChild(particle);

                // 移除粒子和样式
                setTimeout(() => {
                    particle.remove();
                    style.remove();
                }, 800);
            }

            // 恢复状态
            setTimeout(() => {
                isAnimating = false;
            }, 1000);
        });
    }
});