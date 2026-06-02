document.addEventListener('DOMContentLoaded', function () {
    const lastEditTimeElement = document.getElementById('lastEditTime');

    if (lastEditTimeElement) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        lastEditTimeElement.textContent = formattedDate;
        lastEditTimeElement.setAttribute('datetime', now.toISOString());
    }
});