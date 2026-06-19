(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    if (!header) {
      return;
    }
    function syncHeader() {
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    if (button) {
      button.addEventListener("click", function () {
        header.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", header.classList.contains("is-open"));
      });
    }
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function setupHomeSearch() {
    var form = document.querySelector("[data-home-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-root]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var queryInput = panel.querySelector("[data-filter-query]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    if (queryInput && params.get("q")) {
      queryInput.value = params.get("q");
    }
    function applyFilters() {
      var query = normalize(queryInput && queryInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (region && normalize(card.getAttribute("data-region")) !== region) {
          matched = false;
        }
        if (type && normalize(card.getAttribute("data-type")) !== type) {
          matched = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          matched = false;
        }
        if (category && normalize(card.getAttribute("data-category")) !== category) {
          matched = false;
        }
        card.classList.toggle("hidden-by-filter", !matched);
      });
    }
    [queryInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
    applyFilters();
  }

  function initializePlayer(playerId, videoUrl) {
    var root = document.getElementById(playerId);
    if (!root || !videoUrl) {
      return;
    }
    var video = root.querySelector("video");
    var button = root.querySelector(".play-overlay");
    if (!video || !button) {
      return;
    }
    var isBound = false;
    function bindVideo() {
      if (isBound) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        root.hlsInstance = hls;
      } else {
        video.src = videoUrl;
      }
      isBound = true;
    }
    function startPlayback() {
      bindVideo();
      root.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          root.classList.remove("is-playing");
        });
      }
    }
    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      root.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        root.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", function () {
      root.classList.remove("is-playing");
    });
  }

  window.initializePlayer = initializePlayer;

  ready(function () {
    setupHeader();
    setupHero();
    setupHomeSearch();
    setupFilters();
  });
})();
