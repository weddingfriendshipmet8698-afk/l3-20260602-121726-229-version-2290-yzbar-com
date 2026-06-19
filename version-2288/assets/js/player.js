var MoviePlayer = (function () {
    function setup(source, videoId, shellId) {
        var video = document.getElementById(videoId);
        var shell = document.getElementById(shellId);
        if (!video || !shell || !source) {
            return;
        }

        var button = shell.querySelector("[data-play-button]");
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            shell.classList.add("is-playing");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        shell.addEventListener("click", function (event) {
            if (event.target === video && video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    return {
        setup: setup
    };
}());
