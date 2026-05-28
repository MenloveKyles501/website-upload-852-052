(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function setSlide(nextIndex) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                setSlide(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        setSlide(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-search-input]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");

            function apply() {
                var q = normalize(input && input.value);
                var selectedRegion = normalize(region && region.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matchQuery = !q || text.indexOf(q) !== -1;
                    var matchRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
                    var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
                    var matchType = !selectedType || normalize(card.dataset.type) === selectedType;
                    var show = matchQuery && matchRegion && matchYear && matchType;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function createPlayer(url, videoSelector, coverSelector) {
        var video = document.querySelector(videoSelector);
        var cover = document.querySelector(coverSelector);
        var hls = null;
        var loaded = false;

        if (!video || !url) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                return;
            }

            video.src = url;
        }

        function play() {
            load();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.SitePlayer = {
        init: createPlayer
    };
})();
