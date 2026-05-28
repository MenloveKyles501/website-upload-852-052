(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-dot]'));
        var prev = carousel.querySelector('[data-prev]');
        var next = carousel.querySelector('[data-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-row]').forEach(function (row) {
        row.addEventListener('click', function (event) {
            var button = event.target.closest('[data-filter]');
            if (!button) {
                return;
            }
            row.querySelectorAll('[data-filter]').forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    function applyFilters() {
        var input = document.querySelector('[data-filter-input]');
        var query = input ? input.value.trim().toLowerCase() : '';
        var activeButton = document.querySelector('[data-filter-row] [data-filter].active');
        var filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';

        document.querySelectorAll('[data-card]').forEach(function (card) {
            var text = card.getAttribute('data-search') || '';
            var category = card.getAttribute('data-category') || '';
            var matchText = !query || text.indexOf(query) !== -1;
            var matchCategory = filter === 'all' || category === filter || !category;
            card.classList.toggle('is-hidden', !(matchText && matchCategory));
        });
    }

    document.querySelectorAll('[data-play]').forEach(function (button) {
        var box = button.closest('.player-card');
        var video = box ? box.querySelector('video[data-video]') : null;

        if (!video) {
            return;
        }

        function boot() {
            var url = video.getAttribute('data-video');
            if (!url) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!video.hlsInstance) {
                    video.hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    video.hlsInstance.loadSource(url);
                    video.hlsInstance.attachMedia(video);
                }
            } else if (!video.getAttribute('src')) {
                video.setAttribute('src', url);
            }

            button.classList.add('hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('hidden');
                });
            }
        }

        button.addEventListener('click', boot);
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove('hidden');
            }
        });
    });
}());
