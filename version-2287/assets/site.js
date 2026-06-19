(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var toggle = $('[data-mobile-toggle]');
  var mobilePanel = $('[data-mobile-panel]');

  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = $('[data-hero-slider]');

  if (hero) {
    var slides = $all('[data-hero-slide]', hero);
    var next = $('[data-hero-next]', hero);
    var prev = $('[data-hero-prev]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    start();
  }

  $all('[data-player]').forEach(function (box) {
    var video = $('video', box);
    var button = $('[data-play]', box);
    var overlay = $('.player-overlay', box);
    var source = box.getAttribute('data-src');
    var loaded = false;

    function loadAndPlay() {
      if (!video || !source) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        loaded = true;
      }

      if (overlay) {
        overlay.style.display = 'none';
      }

      video.play().catch(function () {
        if (overlay) {
          overlay.style.display = 'grid';
        }
      });
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }
  });

  var searchApp = $('[data-search-app]');

  if (searchApp) {
    var resultBox = $('[data-search-results]', searchApp);
    var keywordInput = $('[data-search-keyword]', searchApp);
    var yearSelect = $('[data-search-year]', searchApp);
    var typeSelect = $('[data-search-type]', searchApp);
    var categorySelect = $('[data-search-category]', searchApp);
    var form = $('[data-search-form]', searchApp);
    var catalogUrl = searchApp.getAttribute('data-catalog');
    var catalog = [];

    function getQueryParam(name) {
      return new URLSearchParams(window.location.search).get(name) || '';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(items) {
      if (!resultBox) {
        return;
      }

      if (!items.length) {
        resultBox.innerHTML = '<div class="empty-state">没有找到匹配内容，请更换关键词或筛选条件。</div>';
        return;
      }

      resultBox.innerHTML = items.slice(0, 120).map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-wrap" href="' + escapeHtml(item.url) + '">',
          '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="badge badge-hot">热度 ' + escapeHtml(item.heat) + '</span>',
          '    <span class="play-mark">▶</span>',
          '  </a>',
          '  <div class="movie-info">',
          '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <p class="movie-desc">' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="movie-meta">',
          '      <span>' + escapeHtml(item.year) + '</span>',
          '      <span>' + escapeHtml(item.region) + '</span>',
          '      <span>' + escapeHtml(item.type) + '</span>',
          '    </div>',
          '    <div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function applySearch() {
      var keyword = (keywordInput ? keywordInput.value : '').trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';

      var items = catalog.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.category].join(' ').toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1)
          && (!year || String(item.year) === year)
          && (!type || item.type === type)
          && (!category || item.category === category);
      });

      items.sort(function (a, b) {
        if (b.year !== a.year) {
          return b.year - a.year;
        }
        return b.heat - a.heat;
      });

      render(items);
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applySearch();
      });
    }

    fetch(catalogUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        catalog = data;
        if (keywordInput) {
          keywordInput.value = getQueryParam('q');
        }
        applySearch();
      })
      .catch(function () {
        if (resultBox) {
          resultBox.innerHTML = '<div class="empty-state">搜索数据暂时无法加载，请从分类页继续浏览。</div>';
        }
      });
  }
})();
