// 微信支付模态框功能
const wechatModal = document.getElementById('wechat-modal');
const wechatOption = document.querySelector('.appreciate-option[data-type="wechat"]');
const modalClose = document.querySelector('.modal-close');
const appreciateBtn = document.querySelector('.appreciate-btn');

wechatOption.addEventListener('click', () => {
    wechatModal.classList.add('active');
});

modalClose.addEventListener('click', () => {
    wechatModal.classList.remove('active');
});

wechatModal.addEventListener('click', (e) => {
    if (e.target === wechatModal) {
        wechatModal.classList.remove('active');
    }
});