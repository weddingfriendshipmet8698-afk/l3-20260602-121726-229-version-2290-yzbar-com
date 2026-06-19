document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var input = document.querySelector("[data-search-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var empty = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var query = normalize(input ? input.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-category"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" "));
      var sameYear = !year || normalize(card.getAttribute("data-year")) === year;
      var matched = (!query || text.indexOf(query) !== -1) && sameYear;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (input) {
    input.addEventListener("input", filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", filterCards);
  }
});
