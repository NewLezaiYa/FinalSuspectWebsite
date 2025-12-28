// 图片预加载函数
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
    'Resource/images/FinalSuspect-Logo-2.0.png',
    'Resource/images/Cursor.png',
    'Resource/images/FastBoot.png',
    'Resource/images/FinalSuspect-BG-EmergencyMeeting-Preview.png',
    'Resource/images/FinalSuspect-BG-MiraHQ.png',
    'Resource/images/FinalSuspect-BG-MiraStudio-Preview.png',
    'Resource/images/FinalSuspect-BG-NewYear-Preview.png',
    'Resource/images/FinalSuspect-BG-Security-Preview.png',
    'Resource/images/FinalSuspect-BG-XtremeWave-Preview.png',
    'Resource/images/OpenAmongUsWithSteam.png',
    'Resource/images/ShowPlayerInfo.png',
    'Resource/images/SpamDenyWord.png',
    'Resource/images/SteamUnzip.png',
    'Resource/images/UnlockFPS.png',
];

// 页面加载完成后处理
document.addEventListener('DOMContentLoaded', function () {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.querySelector('.loading-text');
    const loadingProgressBar = document.getElementById('loadingProgressBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const loadingStatus = document.getElementById('loadingStatus');

    if (!loadingOverlay) return;

    let totalProgress = 0;
    let imageProgress = 0;
    let domProgress = 0;
    let resourceProgress = 0;

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

        // 更新UI
        if (loadingProgressBar) {
            loadingProgressBar.style.width = totalProgress + '%';
        }

        if (loadingPercentage) {
            loadingPercentage.textContent = totalProgress + '%';
        }

        return totalProgress;
    }

    // 更新加载状态文本
    function updateStatusText(phase, detail) {
        if (!loadingStatus) return;

        const statusMap = {
            'init': '正在初始化...',
            'dom': '正在加载页面结构...',
            'images': `正在加载图片 (${detail || '0/14'})...`,
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

    // 监听DOM状态变化
    document.onreadystatechange = updateDOMProgress;
    updateDOMProgress(); // 初始调用

    // 开始预加载图片
    updateStatusText('images', '0/14' + imagesToPreload.length);
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
            }, 500);
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
                loadingOverlay.style.display = 'none';
            }, 500);
        });
});