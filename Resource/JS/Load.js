// 页面加载完成后隐藏加载动画
document.addEventListener('DOMContentLoaded', function () {
    // 确保资源加载完成后隐藏
    window.addEventListener('load', function () {
        // 添加一点延迟，确保动画显示充分
        setTimeout(function () {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');

                // 动画完成后移除元素
                setTimeout(function () {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }, 1000); // 至少显示1秒
    });

    // 如果加载时间过长，5秒后强制隐藏
    setTimeout(function () {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay && loadingOverlay.style.display !== 'none') {
            loadingOverlay.classList.add('hidden');
            setTimeout(function () {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 5000);
});