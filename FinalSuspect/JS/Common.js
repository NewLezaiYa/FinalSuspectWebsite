document.addEventListener('DOMContentLoaded', () => {
    // ======================
    // 工具函数：动画类管理器
    // ======================
    const AnimationManager = {
        // 存储已触发的元素（防止重复触发）
        triggeredElements: new Set(),

        // 初始化所有需要动画的元素
        init() {
            this.observeElements('.animate-on-scroll'); // 滚动动画元素
            this.observeElements('.parallax-element');   // 视差元素
            this.initInteractiveAnimations();           // 交互相关动画
        },

        // 视差滚动效果（适用于背景/大图）
        initParallax() {
            const parallaxElements = document.querySelectorAll('.parallax-element');
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.speed) || 0.3;
                    el.style.transform = `translateY(${scrollY * speed}px)`;
                });
            });
        },

        // 滚动触发动画（核心功能）
        observeElements(selector, options = {}) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.triggeredElements.has(entry.target)) {
                        this.triggeredElements.add(entry.target);
                        const target = entry.target;
                        
                        // 根据 data-animation 属性获取动画类型
                        const animationType = target.dataset.animation || 'fade-in-up';
                        this.playAnimation(target, animationType);

                        // 可选：动画完成后移除监听（适用于一次性动画）
                        if (options.once !== false) {
                            observer.unobserve(target);
                        }
                    }
                });
            }, {
                rootMargin: '0px 0px -50px 0px', // 元素进入视口50px时触发
                threshold: 0.1
            });

            document.querySelectorAll(selector).forEach(el => {
                observer.observe(el);
            });
        },

        // 播放具体动画
        playAnimation(element, animationType) {
            // 定义动画映射表（可根据需求扩展）
            const animations = {
                'fade-in-up': {
                    from: { opacity: 0, transform: 'translateY(30px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                    duration: 0.6
                },
                'slide-in-left': {
                    from: { opacity: 0, transform: 'translateX(-50px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                    duration: 0.5
                },
                'slide-in-right': {
                    from: { opacity: 0, transform: 'translateX(50px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                    duration: 0.5
                },
                'scale-in': {
                    from: { opacity: 0, transform: 'scale(0.9)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                    duration: 0.4
                }
            };

            const anim = animations[animationType];
            if (!anim) return;

            // 应用初始样式
            Object.assign(element.style, {
                opacity: 0,
                ...anim.from,
                transition: `all ${anim.duration}s cubic-bezier(0.25, 0.8, 0.25, 1)`
            });

            // 强制重绘触发过渡
            element.getBoundingClientRect();

            // 应用结束样式
            requestAnimationFrame(() => {
                Object.assign(element.style, anim.to);
            });
        },

        // 初始化交互相关动画（悬停/点击）
        initInteractiveAnimations() {
            // 图片悬停放大增强
            document.querySelectorAll('.guide-img, .image-wrapper').forEach(img => {
                img.addEventListener('mouseenter', () => {
                    img.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                });
                img.addEventListener('mouseleave', () => {
                    img.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                });
            });

            // 按钮点击涟漪效果
            document.querySelector('.back-button')?.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                Object.assign(ripple.style, {
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${e.clientX - rect.left - size/2}px`,
                    top: `${e.clientY - rect.top - size/2}px`
                });

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });

            // 文本块渐入增强
            document.querySelectorAll('.text').forEach(text => {
                text.addEventListener('mouseenter', () => {
                    text.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
                });
            });
        }
    };

    // ======================
    // 初始化配置
    // ======================
    // 为需要动画的元素添加 data 属性（示例）
    document.querySelector('h1').dataset.animation = 'fade-in-up';
    document.querySelectorAll('h2').forEach((h2, i) => {
        h2.dataset.animation = `slide-in-left`;
        h2.style.transitionDelay = `${i * 0.1}s`; // 依次延迟
    });
    document.querySelectorAll('.text').forEach((text, i) => {
        text.dataset.animation = `slide-in-right`;
        text.style.transitionDelay = `${i * 0.15}s`;
    });
    document.querySelectorAll('.image-wrapper').forEach((img, i) => {
        img.dataset.animation = `scale-in`;
        img.style.transitionDelay = `${i * 0.2}s`;
    });
    document.querySelector('.guide-img').dataset.animation = 'fade-in-up';

    // 启动动画系统
    AnimationManager.init();
    AnimationManager.initParallax(); // 如需视差效果启用此行
});