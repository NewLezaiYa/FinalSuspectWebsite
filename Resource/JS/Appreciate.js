// 赞赏按钮功能
const appreciateOptions = document.querySelectorAll('.appreciate-option');
const wechatModal = document.getElementById('wechat-modal');
const modalClose = document.querySelector('.modal-close');

appreciateOptions.forEach(option => {
    option.addEventListener('click', function () {
        const type = this.getAttribute('data-type');

        if (type === 'wechat') {
            // 显示微信支付模态框
            wechatModal.classList.add('active');
        } else {
            alert(message);
            console.log(`赞赏类型: ${type}`);
        }
    });
});

// 关闭模态框
modalClose.addEventListener('click', function () {
    wechatModal.classList.remove('active');
});

// 点击模态框外部关闭
wechatModal.addEventListener('click', function (e) {
    if (e.target === wechatModal) {
        wechatModal.classList.remove('active');
    }
});