(function() {
  var header = document.querySelector("[data-site-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function setHeaderState() {
    if (!header) {
      return;
    }

    if (window.scrollY > 18) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener("click", function() {
      var open = mobileNav.classList.toggle("is-open");
      header.classList.toggle("is-open", open);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function(scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-year-filter]");
    var region = scope.querySelector("[data-region-filter]");
    var type = scope.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function updateCards() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          ok = false;
        }

        if (typeValue && cardType !== typeValue) {
          ok = false;
        }

        card.classList.toggle("is-hidden", !ok);
      });
    }

    [input, year, region, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", updateCards);
        control.addEventListener("change", updateCards);
      }
    });
  });
})();
