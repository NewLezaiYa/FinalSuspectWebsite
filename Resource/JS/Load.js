// 图片预加载（保留给其它页面/工具使用）
function preloadImages(imageUrls, progressCallback) {
    const totalImages = imageUrls.length;
    let loadedImages = 0;

    const promises = imageUrls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedImages++;
                if (progressCallback) {
                    progressCallback(loadedImages, totalImages);
                }
                resolve({ url, status: 'success' });
            };
            img.onerror = () => {
                loadedImages++;
                if (progressCallback) {
                    progressCallback(loadedImages, totalImages);
                }
                console.warn(`预加载失败: ${url}`);
                resolve({ url, status: 'error' });
            };
        });
    });
    return Promise.all(promises);
}

// 需要预加载的图片列表（SplashIntro 的"下载阶段"会逐张展示）
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
    '/Resource/images/HavenGlow-LOGO.png',
];

// 页面加载完成后启动 FinalSuspect 启动动画
document.addEventListener('DOMContentLoaded', function () {
    if (typeof SplashIntro === 'undefined' || !document.getElementById('loadingOverlay')) return;

    // 从后退/前进导航进入页面时跳过开场动画（返回上一页时页面会重新加载，
    // 避免每次都重播整段开场动画，造成"返回即重新加载"的观感）
    const navType = (performance.getEntriesByType('navigation')[0] || {}).type;
    if (navType === 'back_forward') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
        return;
    }

    SplashIntro.start({
        images: imagesToPreload,
        onComplete: function () {
            // 动画全部结束（落幕黑幕），淡出覆盖层露出网站
            const overlay = document.getElementById('loadingOverlay');
            if (!overlay) return;
            overlay.classList.add('hidden');
            setTimeout(function () {
                overlay.style.display = 'none';
            }, 1000);
        },
    });
});
