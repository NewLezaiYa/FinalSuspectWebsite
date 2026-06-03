document.addEventListener('DOMContentLoaded', async function () {
    const lastEditTimeElement = document.getElementById('lastEditTime');

    if (lastEditTimeElement) {
        try {
            const response = await fetch(window.location.href, { method: 'HEAD' });
            const lastModified = response.headers.get('Last-Modified');

            if (lastModified) {
                const date = new Date(lastModified);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');

                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
                lastEditTimeElement.textContent = formattedDate;
                lastEditTimeElement.setAttribute('datetime', date.toISOString());
            } else {
                setDefaultTime(lastEditTimeElement);
            }
        } catch (error) {
            console.warn('无法获取文件最后修改时间:', error);
            setDefaultTime(lastEditTimeElement);
        }
    }
});

function setDefaultTime(element) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    element.textContent = formattedDate;
    element.setAttribute('datetime', now.toISOString());
}