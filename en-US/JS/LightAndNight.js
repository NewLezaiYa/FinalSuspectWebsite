const themeToggle = document.getElementById('themeToggle');
const sunIcon = '<i class="fas fa-sun"></i>';
const moonIcon = '<i class="fas fa-moon"></i>';
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = moonIcon;
}
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        themeToggle.innerHTML = sunIcon;
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.innerHTML = moonIcon;
        localStorage.setItem('theme', 'dark');
    }
});
