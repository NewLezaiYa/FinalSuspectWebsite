document.addEventListener('DOMContentLoaded', function () {
    // 获取彩蛋触发点和模态框
    const secretSpots = document.querySelectorAll('.secret-spot');
    const easterEggModal = document.getElementById('easterEggModal');
    const closeEasterEgg = document.getElementById('closeEasterEgg');
    const heroLogo = document.querySelector('.hero-logo');
    const audioStatus = document.getElementById('audioStatus');

    // 使用本地MP3文件
    let eggAudio = null;
    let audioLoaded = false;

    // 预加载音频
    function preloadAudio() {
        if (eggAudio) return;

        eggAudio = new Audio();
        eggAudio.preload = 'auto';
        eggAudio.volume = 0.3;

        // 音频路径
        const audioPaths = [
            'Resource/MP3/FinalSuspect.wav',
        ];

        // 设置第一个路径
        eggAudio.src = audioPaths[0];

        // 添加加载事件监听
        eggAudio.addEventListener('canplaythrough', function () {
            audioLoaded = true;
            console.log('彩蛋音效加载成功');
            if (audioStatus) {
                audioStatus.innerHTML = '<i class="fas fa-volume-up"></i> 音效已加载';
                audioStatus.style.color = '#00ffcc';
            }
        });

        eggAudio.addEventListener('error', function (e) {
            console.log('音效加载失败，尝试备用路径:', e);
            audioLoaded = false;
            if (audioStatus) {
                audioStatus.innerHTML = '<i class="fas fa-volume-mute"></i> 音效未加载';
                audioStatus.style.color = '#ff3366';
            }

            // 尝试其他路径
            let currentIndex = audioPaths.indexOf(eggAudio.src);
            if (currentIndex < audioPaths.length - 1) {
                eggAudio.src = audioPaths[currentIndex + 1];
            }
        });

        // 开始加载音频
        eggAudio.load();
    }

    // 页面加载后预加载音频
    setTimeout(preloadAudio, 2000);

    // 彩蛋触发计数器
    let foundSpots = 0;
    const totalSpots = secretSpots.length;
    let easterEggShown = false;

    // 为每个触发点添加点击事件
    secretSpots.forEach(spot => {
        spot.addEventListener('click', function () {
            if (!easterEggShown) {
                // 确保音频已预加载
                if (!eggAudio) {
                    preloadAudio();
                }

                // 添加动画效果
                this.classList.add('egg-found');

                // 移除动画类
                setTimeout(() => {
                    this.classList.remove('egg-found');
                }, 500);

                foundSpots++;

                // 当找到所有触发点时显示彩蛋
                if (foundSpots >= totalSpots) {
                    showEasterEgg();
                }
            }
        });
    });

    // 额外的彩蛋：双击英雄Logo
    let logoClickCount = 0;
    let logoClickTimer;

    heroLogo.addEventListener('click', function () {
        logoClickCount++;

        if (logoClickTimer) {
            clearTimeout(logoClickTimer);
        }

        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
        }, 1000);

        if (logoClickCount >= 5 && !easterEggShown) {
            logoClickCount = 0;
            // 确保音频已预加载
            if (!eggAudio) {
                preloadAudio();
            }
            showEasterEgg();
        }
    });

    // 显示彩蛋函数
    function showEasterEgg() {
        easterEggShown = true;
        easterEggModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // 播放音效
        try {
            if (eggAudio && audioLoaded) {
                eggAudio.currentTime = 0; // 从头开始播放
                eggAudio.play().then(() => {
                    console.log('彩蛋音效播放成功');
                }).catch(error => {
                    console.log('音效播放被阻止:', error);
                    // 如果自动播放被阻止，等待用户交互后播放
                    document.addEventListener('click', function playOnce() {
                        if (eggAudio && audioLoaded) {
                            eggAudio.play();
                        }
                        document.removeEventListener('click', playOnce);
                    }, { once: true });
                });
            } else {
                console.log('音效未加载，跳过播放');
            }
        } catch (e) {
            console.log('播放音效时出错:', e);
        }
    }

    // 关闭彩蛋
    closeEasterEgg.addEventListener('click', function () {
        easterEggModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        easterEggShown = false;
        foundSpots = 0; // 重置计数器

        // 停止音效
        if (eggAudio) {
            eggAudio.pause();
            eggAudio.currentTime = 0;
        }
    });

    // 点击模态框外部关闭
    easterEggModal.addEventListener('click', function (e) {
        if (e.target === easterEggModal) {
            easterEggModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            easterEggShown = false;
            foundSpots = 0;

            // 停止音效
            if (eggAudio) {
                eggAudio.pause();
                eggAudio.currentTime = 0;
            }
        }
    });

    // 控制台彩蛋
    console.log('FinalSuspect 彩蛋已激活!',
        'color: #00ffcc; font-size: 16px; font-weight: bold;');
    console.log('提示: 在页面中寻找隐藏的点击区域快速点击5次',
        'color: #ffcc00; font-size: 12px;');

    // 手动触发音频加载（用于测试）
    window.triggerAudioLoad = function () {
        preloadAudio();
        console.log('手动触发音频加载');
    };
});