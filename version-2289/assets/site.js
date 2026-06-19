document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupBackToTop();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
});

function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
        return;
    }

    button.addEventListener('click', function () {
        menu.classList.toggle('is-open');
    });
}

function setupBackToTop() {
    var button = document.querySelector('[data-back-to-top]');

    if (!button) {
        return;
    }

    window.addEventListener('scroll', function () {
        if (window.scrollY > 360) {
            button.classList.add('is-visible');
        } else {
            button.classList.remove('is-visible');
        }
    });

    button.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }
}

function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');

    if (!panel || !list) {
        return;
    }

    var keyword = panel.querySelector('[data-filter-keyword]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var status = panel.querySelector('[data-filter-status]');
    var items = Array.prototype.slice.call(list.children);

    populateSelect(year, collectValues(items, 'year').sort(function (a, b) {
        return parseInt(b, 10) - parseInt(a, 10);
    }));
    populateSelect(region, collectValues(items, 'region').sort());
    populateSelect(type, collectValues(items, 'type').sort());

    var query = new URLSearchParams(window.location.search).get('q');
    if (query && keyword) {
        keyword.value = query;
    }

    function applyFilter() {
        var word = (keyword && keyword.value || '').trim().toLowerCase();
        var chosenYear = year && year.value || '';
        var chosenRegion = region && region.value || '';
        var chosenType = type && type.value || '';
        var visible = 0;

        items.forEach(function (item) {
            var haystack = [
                item.dataset.title || '',
                item.dataset.region || '',
                item.dataset.type || '',
                item.dataset.year || '',
                item.dataset.genre || '',
                item.dataset.tags || ''
            ].join(' ').toLowerCase();

            var matched = true;
            matched = matched && (!word || haystack.indexOf(word) !== -1);
            matched = matched && (!chosenYear || item.dataset.year === chosenYear);
            matched = matched && (!chosenRegion || item.dataset.region === chosenRegion);
            matched = matched && (!chosenType || item.dataset.type === chosenType);

            item.classList.toggle('is-filter-hidden', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (status) {
            status.textContent = '当前显示 ' + visible + ' 条，共 ' + items.length + ' 条';
        }
    }

    [keyword, year, region, type].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    applyFilter();
}

function collectValues(items, key) {
    var values = [];

    items.forEach(function (item) {
        var value = item.dataset[key];
        if (value && values.indexOf(value) === -1) {
            values.push(value);
        }
    });

    return values;
}

function populateSelect(select, values) {
    if (!select) {
        return;
    }

    values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function setupPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('[data-hls-video]'));

    videos.forEach(function (video) {
        var shell = video.closest('[data-player-shell]');
        var startButton = shell ? shell.querySelector('[data-video-start]') : null;
        var sourceButtons = Array.prototype.slice.call(document.querySelectorAll('[data-video-source]'));
        var hlsInstance = null;

        function loadSource(url, autoplay) {
            if (!url) {
                return;
            }

            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                video.src = url;
            }

            if (autoplay) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }
        }

        loadSource(video.dataset.src, false);

        if (startButton) {
            startButton.addEventListener('click', function () {
                startButton.classList.add('is-hidden');
                loadSource(video.dataset.src, true);
            });

            video.addEventListener('play', function () {
                startButton.classList.add('is-hidden');
            });
        }

        sourceButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var url = button.dataset.videoSource;
                video.dataset.src = url;
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
                loadSource(url, true);
            });
        });
    });
}
