window.onload = function () {
    setTimeout(function () {
        window.location.href = 'https://finalsuspect.pages.dev/';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    const particlesContainer = document.querySelector('.particles');
    const particlesCount = 15;

    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('span');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 30 + 10 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particlesContainer.appendChild(particle);
    }

    const terminalContent = document.querySelector('.terminal-content');
    const text = terminalContent.textContent;
    terminalContent.textContent = '';
    let charIndex = 0;

    function typeText() {
        if (charIndex < text.length) {
            terminalContent.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 50);
        }
    }

    setTimeout(typeText, 1000);
});