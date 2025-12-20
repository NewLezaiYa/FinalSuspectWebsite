// 全屏预览功能
function openPreview(element) {
    const imgSrc = element.querySelector('img').src;
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewImg = document.createElement('img');

    // 移除现有图片
    const existingImg = previewOverlay.querySelector('img');
    if (existingImg) {
        existingImg.remove();
    }

    // 添加新图片
    previewImg.src = imgSrc;
    previewOverlay.appendChild(previewImg);
    previewOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止滚动
}

function closePreview() {
    const previewOverlay = document.querySelector('.preview-overlay');
    previewOverlay.classList.remove('active');
    document.body.style.overflow = 'auto'; // 恢复滚动
}

// 点击背景关闭预览
document.querySelector('.preview-overlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closePreview();
    }
});

// ESC键关闭预览
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closePreview();
    }
});