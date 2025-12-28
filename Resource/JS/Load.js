// 图片预加载函数
function preloadImages(imageUrls) {
    const promises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                console.log(`已预加载: ${url}`);
                resolve(url);
            };
            img.onerror = () => {
                console.warn(`预加载失败: ${url}`);
                resolve(url); // 即使失败也继续
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

    if (!loadingOverlay) return;

    // 开始预加载图片
    const preloadPromise = preloadImages(imagesToPreload);

    // 监听页面所有资源加载
    const pageLoadPromise = new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });

    // 确保至少显示1秒，同时等待预加载和页面加载
    const minDisplayPromise = new Promise(resolve => setTimeout(resolve, 1000));

    // 同时等待预加载、页面加载和最小显示时间
    Promise.all([preloadPromise, pageLoadPromise, minDisplayPromise])
        .then(() => {
            // 更新加载文本
            if (loadingText) {
                loadingText.textContent = '加载完成！';
                loadingText.style.color = '#00ff00'; // 绿色表示完成
            }

            // 短暂显示"加载完成"信息
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
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        });

    // 如果加载时间过长，5秒后强制隐藏
    setTimeout(() => {
        if (loadingOverlay && loadingOverlay.style.display !== 'none') {
            console.warn('加载超时，强制隐藏加载动画');
            if (loadingText) {
                loadingText.textContent = '加载超时，继续显示页面...';
                loadingText.style.color = '#ff9900'; // 橙色表示超时
            }

            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 5000);
});

// 可选：在加载过程中显示加载进度
function updateLoadingProgress(loaded, total) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        const percentage = Math.round((loaded / total) * 100);
        loadingText.textContent = `正在加载... ${percentage}%`;
    }
}