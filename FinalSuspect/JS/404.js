// 动态生成粒子
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.classList.add('particle');

        // 随机属性
        const size = Math.random() * 100 + 20;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = 10 + Math.random() * 20;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        particlesContainer.appendChild(particle);
    }
}

// 动态生成浮动形状
function createShapes() {
    const shapesContainer = document.getElementById('shapes');
    const shapeCount = 6;

    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        shape.classList.add('shape');

        // 随机属性
        const width = 50 + Math.random() * 200;
        const height = width;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = 20 + Math.random() * 30;

        shape.style.width = `${width}px`;
        shape.style.height = `${height}px`;
        shape.style.top = `${top}%`;
        shape.style.left = `${left}%`;
        shape.style.animationDelay = `-${delay}s`;
        shape.style.animationDuration = `${duration}s`;

        shapesContainer.appendChild(shape);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createShapes();
});