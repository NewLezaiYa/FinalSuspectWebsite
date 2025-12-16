// 音乐播放器功能（添加自动播放）
function setupMusicPlayer() {
    const audio = document.getElementById('gameAudio');
    if (!audio) return; // 确保元素存在

    const playBtn = document.querySelector('.play-btn');
    const playIcon = playBtn?.querySelector('i');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeLevel = document.querySelector('.volume-level');

    if (!playBtn || !progressBar || !progressContainer || !volumeSlider || !volumeLevel) {
        console.error("音乐播放器元素未找到");
        return;
    }

    let isPlaying = false;

    // 播放/暂停功能
    const togglePlay = () => {
        if (isPlaying) {
            audio.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        } else {
            audio.play().catch(err => {
                console.log('播放失败（可能需要用户交互）:', err);
                // 可选：显示提示让用户点击播放
            });
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        }
        isPlaying = !isPlaying;
    };

    playBtn.addEventListener('click', togglePlay);

    // 更新进度条
    audio.addEventListener('timeupdate', () => {
        if (isNaN(audio.duration)) return; // 防止未加载时出错
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
    });

    // 点击进度条跳转
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        if (!isNaN(duration)) {
            audio.currentTime = (clickX / width) * duration;
        }
    });

    // 音量控制
    const setVolume = (volume) => {
        audio.volume = volume;
        volumeLevel.style.width = `${volume * 100}%`;
    };

    volumeSlider.addEventListener('click', (e) => {
        const width = volumeSlider.clientWidth;
        const clickX = e.offsetX;
        setVolume(clickX / width);
    });

    // 初始化设置
    audio.volume = 0.7;

    // ------------------- 自动播放逻辑 -------------------
    const tryAutoPlay = () => {
        audio.muted = false;
    };

    // 页面加载完成后尝试自动播放
    tryAutoPlay();

    // 监听用户交互后重新尝试自动播放（解决浏览器限制）
    document.addEventListener('click', () => {
        if (!isPlaying && audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-pause');
            }).catch(err => console.log('用户交互后播放失败:', err));
        }
    }, { once: true }); // 只监听一次用户首次交互
}

document.addEventListener('DOMContentLoaded', () => {
    setupMusicPlayer();
});