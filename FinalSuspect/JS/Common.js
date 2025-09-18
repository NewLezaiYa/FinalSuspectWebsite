/**
 * 页面动画增强脚本
 * 功能：滚动视差、渐进加载、交互反馈动画
 * 依赖：现代浏览器（支持 Intersection Observer API）
 */

(function() {
    // ======================
    // 工具函数与配置
    // ======================
    const Config = {
        // 滚动触发动画的根边距（元素进入视口 50px 时触发）
        rootMargin: '0px 0px -50px 0px',
        // 滚动触发动画的可见阈值（10% 可见时触发）
        threshold: 0.1,
        // 默认动画配置
        defaultAnimations: {
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
        }
    };

    // ======================
    // 动画管理器核心类
    // ======================
    class AnimationManager {
        constructor() {
            this.triggeredElements = new Set(); // 记录已触发动画的元素
            this.observer = null; // 滚动观察者实例
            this.init();
        }

        // 初始化所有动画功能
        init() {
            this.setupObserver();       // 初始化滚动观察者
            this.initParallax();        // 初始化视差效果
            this.initInteractive();     // 初始化交互反馈
            this.bindCustomEvents();    // 绑定自定义事件
        }

        // 设置滚动触发动画的观察者
        setupObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.triggeredElements.has(entry.target)) {
                        this.triggerElementAnimation(entry.target);
                        this.triggeredElements.add(entry.target);
                    }
                });
            }, {
                rootMargin: Config.rootMargin,
                threshold: Config.threshold
            });

            // 观察所有需要滚动动画的元素（需配合 data-animate 属性）
            document.querySelectorAll('[data-animate]').forEach(el => {
                this.observer.observe(el);
            });
        }

        // 触发单个元素的动画
        triggerElementAnimation(element) {
            const animationType = element.dataset.animate || 'fade-in-up';
            const animationConfig = Config.defaultAnimations[animationType];
            
            if (!animationConfig) return;

            // 应用初始样式（强制重绘前设置）
            Object.assign(element.style, {
                opacity: 0,
                ...animationConfig.from,
                transition: `all ${animationConfig.duration}s cubic-bezier(0.25, 0.8, 0.25, 1)`
            });

            // 强制重绘触发过渡
            void element.offsetWidth; // 触发重绘的 hack

            // 应用结束样式
            requestAnimationFrame(() => {
                Object.assign(element.style, animationConfig.to);
            });
        }

        // 初始化视差滚动效果
        initParallax() {
            const parallaxElements = document.querySelectorAll('[data-parallax]');
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.3;
                    el.style.transform = `translateY(${scrollY * speed}px)`;
                });
            });
        }

        // 初始化交互反馈动画
        initInteractive() {
            // 图片悬停放大优化
            document.querySelectorAll('.guide-img, .image-wrapper').forEach(img => {
                img.addEventListener('mouseenter', () => {
                    img.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                });
                img.addEventListener('mouseleave', () => {
                    img.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
                });
            });

            // 返回按钮涟漪效果
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                backButton.addEventListener('click', this.createRippleEffect.bind(this));
            }
        }

        // 绑定自定义事件（可扩展）
        bindCustomEvents() {
            // 示例：视频容器点击全屏
            document.querySelectorAll('.video-container').forEach(videoEl => {
                videoEl.addEventListener('click', () => {
                    const iframe = videoEl.querySelector('iframe');
                    iframe.requestFullscreen().catch(err => {
                        console.error('全屏请求失败:', err);
                    });
                });
            });
        }

        // 创建涟漪效果（工具方法）
        createRippleEffect(e) {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            Object.assign(ripple.style, {
                width: `${size}px`,
                height: `${size}px`,
                left: `${e.clientX - rect.left - size/2}px`,
                top: `${e.clientY - rect.top - size/2}px`
            });

            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    }

    // ======================
    // 页面加载完成后启动
    // ======================
    window.addEventListener('DOMContentLoaded', () => {
        // 初始化动画管理器
        window.animationManager = new AnimationManager();

        // ======================
        // 示例：为页面元素绑定动画（需根据实际 HTML 调整）
        // ======================
        // 标题动画（上滑淡入）
        document.querySelector('h1')?.setAttribute('data-animate', 'fade-in-up');

        // 二级标题动画（左滑进入，依次延迟）
        document.querySelectorAll('h2').forEach((h2, index) => {
            h2.setAttribute('data-animate', 'slide-in-left');
            h2.style.transitionDelay = `${index * 0.1}s`;
        });

        // 文本块动画（右滑进入，依次延迟）
        document.querySelectorAll('text').forEach((text, index) => {
            text.setAttribute('data-animate', 'slide-in-right');
            text.style.transitionDelay = `${index * 0.15}s`;
        });

        // 图片容器动画（缩放进入，依次延迟）
        document.querySelectorAll('image-wrapper').forEach((img, index) => {
            img.setAttribute('data-animate', 'scale-in');
            img.style.transitionDelay = `${index * 0.2}s`;
        });

        // 示例：视差背景图（需添加 data-parallax 属性）
        // <div class="parallax-bg" data-parallax="0.2"></div>
    });
})();