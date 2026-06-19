(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterType = document.querySelector("[data-filter-type]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .rank-card"));

  function applyFilters() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var type = filterType ? filterType.value : "";

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();

      var sameType = !type || card.getAttribute("data-type") === type;
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle("is-hidden-by-filter", !(sameType && matched));
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyFilters);
  }

  if (filterType) {
    filterType.addEventListener("change", applyFilters);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");

  if (q && filterInput) {
    filterInput.value = q;
    applyFilters();
  }
})();

function initMoviePlayer(url) {
  var video = document.getElementById("movie-video");
  var button = document.getElementById("play-cover");
  var attached = false;
  var hlsInstance = null;

  if (!video || !url) {
    return;
  }

  function attachMedia() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function startPlayback() {
    attachMedia();

    if (button) {
      button.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

(function () {
  var node = document.getElementById("player-config");

  if (!node) {
    return;
  }

  try {
    var data = JSON.parse(node.textContent || "{}");

    if (data.url) {
      initMoviePlayer(data.url);
    }
  } catch (error) {
  }
})();
