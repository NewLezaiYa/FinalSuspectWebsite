// 创建更多的装饰性粒子
function createErrorParticles() {
    const header = document.querySelector('header');
    
    // 创建背景粒子
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'error-particle';
        
        // 随机位置和大小
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = 2 + Math.random() * 4;
        const delay = Math.random() * 3;
        const duration = 3 + Math.random() * 4;
        
        particle.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            background: ${Math.random() > 0.5 ? '#00d2ff' : '#ff4757'};
            border-radius: 50%;
            opacity: ${0.2 + Math.random() * 0.3};
            filter: blur(${1 + Math.random()}px);
            animation: float ${duration}s linear ${delay}s infinite;
            pointer-events: none;
            z-index: 1;
        `;
        
        header.appendChild(particle);
    }
    
    // 添加浮动动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: ${0.2 + Math.random() * 0.3};
            }
            100% {
                transform: translateY(-100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 为错误代码添加交互效果
function setupErrorCodeInteraction() {
    const errorCode = document.querySelector('.error-code');
    
    // 鼠标悬停效果
    errorCode.addEventListener('mouseenter', function() {
        // 增强发光效果
        this.style.animationDuration = '2s';
        this.style.filter = 'drop-shadow(0 0 30px rgba(0, 210, 255, 0.8))';
        
        // 创建点击扩散效果
        createClickEffect(this);
    });
    
    errorCode.addEventListener('mouseleave', function() {
        // 恢复原状
        this.style.animationDuration = '4s';
        this.style.filter = 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))';
    });
    
    // 点击效果
    errorCode.addEventListener('click', function() {
        // 创建爆炸效果
        for (let i = 0; i < 20; i++) {
            const spark = document.createElement('div');
            spark.className = 'error-spark';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            spark.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: ${3 + Math.random() * 5}px;
                height: ${3 + Math.random() * 5}px;
                background: ${Math.random() > 0.5 ? '#ff4757' : '#00d2ff'};
                border-radius: 50%;
                box-shadow: 0 0 15px ${Math.random() > 0.5 ? '#ff4757' : '#00d2ff'};
                animation: sparkExplode 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                pointer-events: none;
                z-index: 10;
            `;
            
            // 动态设置关键帧
            const sparkStyle = document.createElement('style');
            sparkStyle.textContent = `
                @keyframes sparkExplode {
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
            document.head.appendChild(sparkStyle);
            
            errorCode.appendChild(spark);
            
            // 移除元素
            setTimeout(() => {
                spark.remove();
                sparkStyle.remove();
            }, 800);
        }
    });
}

// 创建点击效果
function createClickEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        border: 3px solid #00d2ff;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0.5;
        animation: rippleExpand 0.6s ease-out forwards;
        pointer-events: none;
        z-index: -1;
    `;
    
    element.appendChild(ripple);
    
    // 添加动画
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleExpand {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0.5;
            }
            100% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // 移除元素
    setTimeout(() => {
        ripple.remove();
        rippleStyle.remove();
    }, 600);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    createErrorParticles();
    setupErrorCodeInteraction();
});

window.onload = function () {
    setTimeout(function () {
        window.location.href = 'https://finalsuspect.pages.dev/';
    }, 3000);
}