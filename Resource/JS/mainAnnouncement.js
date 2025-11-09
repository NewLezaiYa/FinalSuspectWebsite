
// 模拟新更新通知
setTimeout(() => {
    const announcementBar = document.querySelector('.update-announcement');
    announcementBar.style.display = 'block';
    setTimeout(() => {
        announcementBar.style.transform = 'translateY(0)';
        announcementBar.style.opacity = '1';
    }, 100);
}, 5000);

// 更新公告关闭功能
document.querySelector('.update-close').addEventListener('click', function () {
    const announcementBar = document.querySelector('.update-announcement');
    announcementBar.style.transform = 'translateY(-100%)';
    announcementBar.style.opacity = '0';

    // 完全移除元素（可选）
    setTimeout(() => {
        announcementBar.style.display = 'none';
    }, 600);
});