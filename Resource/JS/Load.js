// 图片预加载
function preloadImages(imageUrls, progressCallback) {
    const totalImages = imageUrls.length;
    let loadedImages = 0;

    const promises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedImages++;
                if (progressCallback) {
                    progressCallback(loadedImages, totalImages, 'image');
                }
                console.log(`已预加载: ${url}`);
                resolve({ url, status: 'success' });
            };
            img.onerror = () => {
                loadedImages++;
                if (progressCallback) {
                    progressCallback(loadedImages, totalImages, 'image');
                }
                console.warn(`预加载失败: ${url}`);
                resolve({ url, status: 'error' });
            };
        });
    });
    return Promise.all(promises);
}

// 需要预加载的图片列表
const imagesToPreload = [
    '/Resource/images/FinalSuspect-Logo-2.0.png',
    '/Resource/images/Cursor.png',
    '/Resource/images/FastBoot.png',
    '/Resource/images/FinalSuspect-BG-EmergencyMeeting-Preview.png',
    '/Resource/images/FinalSuspect-BG-MiraHQ.png',
    '/Resource/images/FinalSuspect-BG-MiraStudio-Preview.png',
    '/Resource/images/FinalSuspect-BG-NewYear-Preview.png',
    '/Resource/images/FinalSuspect-BG-Security-Preview.png',
    '/Resource/images/FinalSuspect-BG-XtremeWave-Preview.png',
    '/Resource/images/OpenAmongUsWithSteam.png',
    '/Resource/images/ShowPlayerInfo.png',
    '/Resource/images/SpamDenyWord.png',
    '/Resource/images/SteamUnzip.png',
    '/Resource/images/UnlockFPS.png',
    '/Resource/images/LogoWithTeam.png',
];

// 页面加载完成后处理
document.addEventListener('DOMContentLoaded', function () {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.querySelector('.loading-text');
    const loadingProgressBar = document.getElementById('loadingProgressBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const loadingStatus = document.getElementById('loadingStatus');

    const digitalStreamContainer = document.getElementById('digitalStreamContainer');
    const matrixRainContainer = document.getElementById('matrixRainContainer');
    const circuitContainer = document.getElementById('circuitContainer');
    const circuitGlow = document.getElementById('circuitGlow');
    const circuitNodes = document.querySelectorAll('.circuit-node');
    const mainContent = document.getElementById('mainContent');

    if (!loadingOverlay) return;

    let totalProgress = 0;
    let imageProgress = 0;
    let domProgress = 0;
    let resourceProgress = 0;

    let animationsTriggered = {
        digitalStream: false,
        matrixRain: false,
        circuitEffect: false
    };

    // 更新进度显示
    function updateProgress() {
        // 计算总进度（加权平均）
        totalProgress = Math.round(
            imageProgress * 0.8 +      // 图片预加载占80%
            domProgress * 0.1 +        // DOM加载占10%
            resourceProgress * 0.1      // 其他资源占10%
        );

        // 限制进度在0-100之间
        totalProgress = Math.min(100, totalProgress);

        if (loadingProgressBar) {
            loadingProgressBar.style.width = totalProgress + '%';
        }

        if (loadingPercentage) {
            loadingPercentage.textContent = totalProgress + '%';
        }

        triggerAnimationsByProgress(totalProgress);

        return totalProgress;
    }

    function triggerAnimationsByProgress(progress) {
        if (progress >= 0 && !animationsTriggered.digitalStream) {
            createDigitalStream();
            animationsTriggered.digitalStream = true;
        }

        if (progress >= 0 && !animationsTriggered.matrixRain) {
            createMatrixRain();
            animationsTriggered.matrixRain = true;
        }

        if (progress >= 0 && !animationsTriggered.circuitEffect) {
            createCircuitEffect();
            animationsTriggered.circuitEffect = true;
        }
    }

    // 更新加载状态文本
    function updateStatusText(phase, detail) {
        if (!loadingStatus) return;

        const statusMap = {
            'init': '正在初始化...',
            'dom': '正在加载页面结构...',
            'images': `正在加载图片 (${detail || '0/15'})...`,
            'resources': '正在加载其他资源...',
            'scripts': '正在初始化脚本...',
            'almost': '即将完成...',
            'complete': '加载完成！'
        };

        loadingStatus.textContent = statusMap[phase] || '正在加载...';
    }

    // 开始加载过程
    updateStatusText('init');
    updateProgress();

    // DOM加载进度
    function updateDOMProgress() {
        if (document.readyState === 'loading') {
            domProgress = 30;
        } else if (document.readyState === 'interactive') {
            domProgress = 70;
            updateStatusText('dom');
        } else if (document.readyState === 'complete') {
            domProgress = 100;
        }
        updateProgress();
    }

    document.onreadystatechange = updateDOMProgress;
    updateDOMProgress();

    // 开始预加载图片
    updateStatusText('images', '0/' + imagesToPreload.length);
    const preloadPromise = preloadImages(imagesToPreload, (loaded, total, type) => {
        imageProgress = Math.round((loaded / total) * 100);
        updateStatusText('images', `${loaded}/${total}`);
        updateProgress();
    });

    // 监听页面所有资源加载
    const pageLoadPromise = new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resourceProgress = 100;
            updateProgress();
            resolve();
        } else {
            window.addEventListener('load', () => {
                resourceProgress = 100;
                updateProgress();
                updateStatusText('scripts');
                resolve();
            });
        }
    });

    // 确保至少显示1.5秒，同时等待预加载和页面加载
    const minDisplayPromise = new Promise(resolve => {
        // 初始快速加载动画
        let fakeProgress = 0;
        const fakeInterval = setInterval(() => {
            if (fakeProgress < 20) {
                fakeProgress += 2;
                if (totalProgress < fakeProgress) {
                    totalProgress = fakeProgress;
                    updateProgress();
                }
            } else {
                clearInterval(fakeInterval);
            }
        }, 50);

        setTimeout(resolve, 1500);
    });

    // 同时等待预加载、页面加载和最小显示时间
    Promise.all([preloadPromise, pageLoadPromise, minDisplayPromise])
        .then((results) => {
            updateStatusText('almost');

            // 确保进度达到100%
            totalProgress = 100;
            updateProgress();

            // 短暂显示完成状态
            return new Promise(resolve => {
                setTimeout(() => {
                    updateStatusText('complete');
                    if (loadingText) {
                        loadingText.textContent = '加载完成！';
                        loadingText.style.color = '#00ff00';
                        loadingText.style.animation = 'none';
                    }
                    if (loadingPercentage) {
                        loadingPercentage.style.color = '#00ff00';
                    }
                    resolve();
                }, 300);
            });
        })
        .then(() => {
            // 再等待一点时间让用户看到完成状态
            return new Promise(resolve => setTimeout(resolve, 500));
        })
        .then(() => {
            // 隐藏加载动画
            loadingOverlay.classList.add('hidden');

            // 动画完成后移除元素
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 1000);
        })
        .catch(error => {
            console.error('加载过程中出现错误:', error);
            // 出错时也隐藏加载动画
            if (loadingStatus) {
                loadingStatus.textContent = '加载完成，部分资源可能不完整';
                loadingStatus.style.color = '#ff9900';
            }

            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                mainContent.classList.add('visible');
                loadingOverlay.style.display = 'none';
            }, 500);
        });

    function createDigitalStream() {
        digitalStreamContainer.classList.add('active');

        const streamCount = 15;

        for (let i = 0; i < streamCount; i++) {
            const stream = document.createElement('div');
            stream.className = 'digital-stream';

            let digitalString = '';
            const length = Math.floor(Math.random() * 30) + 20;
            for (let j = 0; j < length; j++) {
                digitalString += Math.random() > 0.5 ? '1' : '0';
            }

            stream.textContent = digitalString;

            const top = Math.random() * 100;
            const fontSize = Math.random() * 10 + 14;
            const speed = Math.random() * 20 + 10;
            const delay = Math.random() * 5;

            stream.style.top = `${top}%`;
            stream.style.fontSize = `${fontSize}px`;
            stream.style.animation = `digitalStream ${speed}s linear ${delay}s infinite`;
            stream.style.opacity = Math.random() * 0.5 + 0.3;

            digitalStreamContainer.appendChild(stream);
        }
    }

    function createMatrixRain() {
        matrixRainContainer.classList.add('active');

        const columnCount = 30;

        for (let i = 0; i < columnCount; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';

            const left = Math.random() * 100;
            column.style.left = `${left}%`;

            const charCount = Math.floor(Math.random() * 15) + 10;

            for (let j = 0; j < charCount; j++) {
                const char = document.createElement('div');
                char.className = 'matrix-char';

                const randomChar = String.fromCharCode(Math.floor(Math.random() * 94) + 33);
                char.textContent = randomChar;

                const delay = Math.random() * 2;
                const duration = Math.random() * 3 + 2;

                char.style.animation = `matrixRain ${duration}s linear ${delay}s forwards`;
                char.style.opacity = Math.random() * 0.7 + 0.3;

                column.appendChild(char);
            }

            matrixRainContainer.appendChild(column);
        }
    }

    function createCircuitEffect() {
        circuitContainer.classList.add('active');

        circuitGlow.style.animation = 'none';
        setTimeout(() => {
            circuitGlow.style.transition = 'stroke-dashoffset 3s ease-in-out';
            circuitGlow.style.strokeDashoffset = '0';
        }, 10);

        circuitNodes.forEach((node, index) => {
            setTimeout(() => {
                node.style.opacity = '1';
                node.style.animation = `circuitPulse 1.5s ease-in-out infinite ${index * 0.3}s`;
            }, index * 200);
        });
    }
});