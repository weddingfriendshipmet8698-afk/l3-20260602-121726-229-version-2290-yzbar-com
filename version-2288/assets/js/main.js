(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var isHidden = menu.classList.contains("hidden");
                menu.classList.toggle("hidden", !isHidden);
                toggle.setAttribute("aria-expanded", String(isHidden));
            });
        }

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (searchInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query) {
                searchInput.value = query;
            }

            var filterCards = function () {
                var keyword = searchInput.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-keywords") || "").toLowerCase();
                    card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
                });
            };

            searchInput.addEventListener("input", filterCards);
            filterCards();
        }
    });
}());
