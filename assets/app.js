(function() {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("open");
      });
    }

    setupHeroCarousel();
    setupHorizontalScroll();
    setupFilters();
    setupSearchInput();
    setupBackTop();
  });

  function setupHeroCarousel() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupHorizontalScroll() {
    var buttons = document.querySelectorAll(".scroll-prev, .scroll-next");
    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        var targetId = button.getAttribute("data-target");
        var target = document.getElementById(targetId);
        var direction = button.classList.contains("scroll-prev") ? -1 : 1;
        if (target) {
          target.scrollBy({ left: direction * 420, behavior: "smooth" });
        }
      });
    });
  }

  function setupFilters() {
    var panels = document.querySelectorAll(".filter-panel");
    panels.forEach(function(panel) {
      var section = panel.closest(".content-section");
      var grid = section ? section.querySelector(".filter-grid") : null;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
      var keyword = panel.querySelector(".filter-keyword");
      var year = panel.querySelector(".filter-year");
      var type = panel.querySelector(".filter-type");
      var reset = panel.querySelector(".filter-reset");
      var empty = section ? section.querySelector(".filter-empty") : null;

      function apply() {
        var query = keyword ? keyword.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var cardTitle = (card.getAttribute("data-title") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchesQuery = !query || searchText.indexOf(query) >= 0 || cardTitle.indexOf(query) >= 0;
          var matchesYear = !yearValue || cardYear === yearValue;
          var matchesType = !typeValue || cardType.indexOf(typeValue) >= 0;
          var show = matchesQuery && matchesYear && matchesType;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      [keyword, year, type].forEach(function(control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function() {
          if (keyword) {
            keyword.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  function setupSearchInput() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (!query) {
      return;
    }

    var pageInput = document.querySelector(".page-search-input");
    var filterInput = document.querySelector(".filter-keyword");

    if (pageInput) {
      pageInput.value = query;
    }

    if (filterInput) {
      filterInput.value = query;
      filterInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function setupBackTop() {
    var button = document.createElement("button");
    button.className = "back-top";
    button.type = "button";
    button.setAttribute("aria-label", "回到顶部");
    button.textContent = "↑";
    document.body.appendChild(button);

    function update() {
      button.classList.toggle("show", window.scrollY > 420);
    }

    button.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  window.initMoviePlayer = function(videoUrl) {
    var video = document.getElementById("videoPlayer");
    var overlay = document.querySelector(".player-overlay");
    var started = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", attach);
    }

    video.addEventListener("click", function() {
      if (!started) {
        attach();
      }
    });

    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
