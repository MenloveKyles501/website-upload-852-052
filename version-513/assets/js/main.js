(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 4800);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var category = root.querySelector("[data-filter-category]");
            var reset = root.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var empty = root.querySelector("[data-empty-state]");

            function apply() {
                var keyword = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var typeValue = normalize(type && type.value);
                var categoryValue = normalize(category && category.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-type")
                    ].join(" "));
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchedType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    var matchedCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
                    var matched = matchedKeyword && matchedYear && matchedType && matchedCategory;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [input, year, type, category].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (category) {
                        category.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function createResultCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeAttr(movie.detail) + "\" aria-label=\"观看" + escapeAttr(movie.title) + "\">" +
            "<img src=\"" + escapeAttr(movie.image) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"badge badge-type\">" + escapeHtml(movie.type) + "</span>" +
            "<span class=\"badge badge-year\">" + escapeHtml(movie.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3><a href=\"" + escapeAttr(movie.detail) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p class=\"movie-meta\">" + escapeHtml(movie.region + " · " + movie.genre) + "</p>" +
            "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function initSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.MovieIndex) {
            return;
        }
        var input = root.querySelector("[data-search-input]");
        var results = root.querySelector("[data-search-results]");
        var empty = root.querySelector("[data-empty-state]");
        var query = getQuery("q");
        if (input) {
            input.value = query;
        }

        function render() {
            var keyword = normalize(input && input.value);
            var pool = window.MovieIndex.filter(function (movie) {
                if (!keyword) {
                    return movie.hot;
                }
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                return text.indexOf(keyword) !== -1;
            }).slice(0, keyword ? 120 : 48);

            if (results) {
                results.innerHTML = pool.map(createResultCard).join("");
            }
            if (empty) {
                empty.classList.toggle("is-visible", pool.length === 0);
            }
        }

        if (input) {
            input.addEventListener("input", render);
        }
        render();
    }

    ready(function () {
        initMenu();
        initHeroCarousel();
        initFilters();
        initSearchPage();
    });
})();
