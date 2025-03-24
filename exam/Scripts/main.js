document.addEventListener("DOMContentLoaded", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    fullscreenBtn.addEventListener("click", () => {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        } catch (e) {
            errorSystem.show('全屏切换失败: ' + e.message);
        }
    });

    // 页面加载完成后自动点击全屏按钮
    fullscreenBtn.click();
});

// 页面加载完成后自动全屏
window.onload = function() {
    function enterFullScreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    }

    // 延迟执行以确保在 浏览器 中生效
    setTimeout(enterFullScreen, 1000);
};
