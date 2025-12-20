// 为代码块添加复制按钮功能
document.querySelectorAll('pre').forEach(preBlock => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '复制代码';

    // 如果pre已经有复制按钮，跳过
    if (!preBlock.querySelector('.copy-btn')) {
        preBlock.appendChild(copyBtn);
    }

    copyBtn.addEventListener('click', async () => {
        const code = preBlock.querySelector('code')?.textContent || preBlock.textContent;

        try {
            await navigator.clipboard.writeText(code);
            copyBtn.textContent = '已复制!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.textContent = '复制代码';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            copyBtn.textContent = '复制失败';
            setTimeout(() => {
                copyBtn.textContent = '复制代码';
            }, 2000);
        }
    });
});