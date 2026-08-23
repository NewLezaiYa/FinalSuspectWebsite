(function () {
    function getPagePath() {
        var path = window.location.pathname.replace(/^\//, '');
        return path || 'index.html';
    }

    function formatDate(dateStr) {
        var parts = dateStr.split(' ');
        var datePart = parts[0];
        var timePart = parts[1] || '00:00';
        return datePart + ' ' + timePart;
    }

    function setTime(element, dateStr) {
        var formatted = formatDate(dateStr);
        element.textContent = formatted;
        element.setAttribute('datetime', dateStr);
    }

    function init() {
        var timeElement = document.getElementById('lastEditTime');
        if (!timeElement) return;

        var pagePath = getPagePath();

        if (window.LAST_MODIFIED && window.LAST_MODIFIED[pagePath]) {
            setTime(timeElement, window.LAST_MODIFIED[pagePath]);
        } else {
            // fallback: try matching just the filename
            var fileName = pagePath.split('/').pop();
            var found = false;
            if (window.LAST_MODIFIED) {
                for (var key in window.LAST_MODIFIED) {
                    if (key.indexOf(fileName) !== -1 && key.indexOf(pagePath.replace(/^\//, '')) !== -1) {
                        setTime(timeElement, window.LAST_MODIFIED[key]);
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                var now = new Date();
                var y = now.getFullYear();
                var m = String(now.getMonth() + 1).padStart(2, '0');
                var d = String(now.getDate()).padStart(2, '0');
                var h = String(now.getHours()).padStart(2, '0');
                var min = String(now.getMinutes()).padStart(2, '0');
                setTime(timeElement, y + '-' + m + '-' + d + ' ' + h + ':' + min);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();