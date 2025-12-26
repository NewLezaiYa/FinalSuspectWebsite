// 公告按钮交互
document.addEventListener('DOMContentLoaded', function () {
    const changelogBtn = document.querySelector('.changelog-btn');
    const changelogOptions = changelogBtn.querySelector('.changelog-options');
    const changelogMainBtn = changelogBtn.querySelector('.changelog-main-btn');

    // 点击公告主按钮跳转到更新日志
    changelogMainBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.location.href = 'FinalSuspect/Changelog';
    });

    // 点击更新日志选项
    const changelogOption = document.querySelector('.changelog-option[data-type="changelog"]');
    changelogOption.addEventListener('click', function (e) {
        e.stopPropagation();
        window.location.href = 'FinalSuspect/Changelog';
    });

    // 点击页面其他地方关闭选项菜单
    document.addEventListener('click', function (e) {
        if (!changelogBtn.contains(e.target)) {
            changelogOptions.style.opacity = '0';
            changelogOptions.style.visibility = 'hidden';
            changelogOptions.style.transform = 'translateY(20px)';
        }
    });
});