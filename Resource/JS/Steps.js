// 为步骤列表添加交互效果
document.querySelectorAll('.update-steps li').forEach((step, index) => {
    // 添加点击完成效果
    step.addEventListener('click', function () {
        if (this.classList.contains('completed')) {
            this.classList.remove('completed');
            this.style.background = 'linear-gradient(135deg, rgba(17, 17, 46, 0.6) 0%, rgba(10, 10, 26, 0.8) 100%)';
            this.querySelector('.step-title').style.textDecoration = 'none';
        } else {
            this.classList.add('completed');
            this.style.background = 'linear-gradient(135deg, rgba(9, 187, 7, 0.1) 0%, rgba(10, 10, 26, 0.9) 100%)';
            this.style.borderColor = 'rgba(9, 187, 7, 0.4)';
            this.querySelector('.step-title').style.textDecoration = 'line-through';
            this.querySelector('.step-title').style.opacity = '0.8';

            // 为完成图标添加动画
            const checkmark = document.createElement('span');
            checkmark.className = 'step-checkmark';
            checkmark.innerHTML = '✓';
            checkmark.style.cssText = `
                position: absolute;
                top: 1rem;
                right: 1rem;
                color: #09bb07;
                font-size: 1.2rem;
                font-weight: bold;
                opacity: 0;
                transform: scale(0);
                animation: checkmarkAppear 0.5s ease-out forwards;
            `;

            this.appendChild(checkmark);

            // 添加动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes checkmarkAppear {
                    0% {
                        opacity: 0;
                        transform: scale(0) rotate(-90deg);
                    }
                    70% {
                        opacity: 1;
                        transform: scale(1.2) rotate(10deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }
            `;
            document.head.appendChild(style);

            setTimeout(() => {
                checkmark.style.animation = 'pulse 2s infinite';
                style.remove();
            }, 500);
        }
    });

    // 添加逐步显示动画
    setTimeout(() => {
        step.style.opacity = '0';
        step.style.transform = 'translateX(-20px)';
        step.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateX(0)';
        }, index * 150); // 交错动画
    }, 100);
});

// 添加步骤进度跟踪
function trackStepProgress() {
    const steps = document.querySelectorAll('.update-steps li');
    const progressContainer = document.createElement('div');
    progressContainer.className = 'step-progress';
    progressContainer.style.cssText = `
        margin: 2rem 0;
        padding: 1.5rem;
        background: rgba(17, 17, 46, 0.6);
        border-radius: 12px;
        border: 1px solid rgba(113, 88, 226, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;

    const progressText = document.createElement('span');
    progressText.style.cssText = `
        color: #b0b0d0;
        font-family: 'Orbitron', sans-serif;
        font-size: 1.1rem;
    `;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        flex-grow: 1;
        height: 6px;
        background: rgba(113, 88, 226, 0.2);
        border-radius: 3px;
        margin: 0 1.5rem;
        overflow: hidden;
        position: relative;
    `;

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, #ff4757, #00d2ff, #7158e2);
        border-radius: 3px;
        transition: width 0.5s ease;
        box-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
    `;

    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressText);
    progressContainer.appendChild(progressBar);

    const resetButton = document.createElement('button');
    resetButton.textContent = '重置进度';
    resetButton.style.cssText = `
        background: rgba(113, 88, 226, 0.3);
        color: #b0b0d0;
        border: 1px solid rgba(113, 88, 226, 0.5);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    `;

    resetButton.addEventListener('mouseenter', () => {
        resetButton.style.background = 'rgba(255, 71, 87, 0.3)';
        resetButton.style.color = '#ffffff';
        resetButton.style.borderColor = 'rgba(255, 71, 87, 0.6)';
    });

    resetButton.addEventListener('mouseleave', () => {
        resetButton.style.background = 'rgba(113, 88, 226, 0.3)';
        resetButton.style.color = '#b0b0d0';
        resetButton.style.borderColor = 'rgba(113, 88, 226, 0.5)';
    });

    resetButton.addEventListener('click', () => {
        document.querySelectorAll('.update-steps li.completed').forEach(step => {
            step.classList.remove('completed');
            step.style.background = '';
            step.style.borderColor = '';
            const title = step.querySelector('.step-title');
            if (title) {
                title.style.textDecoration = 'none';
                title.style.opacity = '1';
            }
            const checkmark = step.querySelector('.step-checkmark');
            if (checkmark) checkmark.remove();
        });
        updateProgress();
    });

    progressContainer.appendChild(resetButton);

    function updateProgress() {
        const completed = document.querySelectorAll('.update-steps li.completed').length;
        const total = steps.length;
        const percentage = (completed / total) * 100;

        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `进度: ${completed}/${total} (${Math.round(percentage)}%)`;
    }

    // 监听步骤完成状态变化
    const observer = new MutationObserver(updateProgress);
    steps.forEach(step => {
        observer.observe(step, { attributes: true, attributeFilter: ['class'] });
    });

    updateProgress();

    // 将进度条插入到步骤列表前
    const stepsList = document.querySelector('.update-steps');
    if (stepsList) {
        stepsList.parentNode.insertBefore(progressContainer, stepsList);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    trackStepProgress();
});