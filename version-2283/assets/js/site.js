
(function () {
  var header = document.querySelector('[data-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('video[data-src]'));
    players.forEach(function (video) {
      if (video.getAttribute('data-player-ready') === '1') {
        return;
      }
      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-player-ready', '1');
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.setAttribute('data-player-ready', '1');
      }
    });
  }

  window.addEventListener('hls-ready', initPlayers);
  initPlayers();

  Array.prototype.slice.call(document.querySelectorAll('[data-play]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.getAttribute('data-play');
      var video = document.getElementById(id);
      var shell = button.closest('.player-shell');
      initPlayers();
      if (video) {
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {});
        }
      }
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
  });

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var keyword = filterRoot.querySelector('[data-filter-keyword]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var genre = filterRoot.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty]');

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var g = normalize(genre && genre.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title')) + ' ' + normalize(card.getAttribute('data-genre')) + ' ' + normalize(card.getAttribute('data-region'));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')) !== y) {
          ok = false;
        }
        if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
          ok = false;
        }
        if (g && normalize(card.getAttribute('data-genre')).indexOf(g) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [keyword, year, region, genre].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });
  }
})();
