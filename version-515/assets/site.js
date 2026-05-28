(function () {
  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
      return;
    }

    var input = page.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(page.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
    var empty = page.querySelector('[data-search-empty]');
    var selected = 'all';

    function paramsQuery() {
      try {
        return new URLSearchParams(window.location.search).get('q') || '';
      } catch (error) {
        return '';
      }
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchCategory = selected === 'all' || category === selected;
        var show = matchKeyword && matchCategory;
        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        selected = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });

    if (input) {
      input.value = paramsQuery();
      input.addEventListener('input', apply);
    }

    apply();
  }

  function setupVideo(video) {
    if (!video || video.dataset.ready === 'true') {
      return;
    }

    var src = video.getAttribute('data-src');

    if (!src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });

      video.dataset.ready = 'true';
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = 'true';
    } else {
      video.src = src;
      video.dataset.ready = 'true';
    }
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    shells.forEach(function (shell) {
      var video = shell.querySelector('.movie-player');
      var action = shell.querySelector('.player-action');

      if (!video) {
        return;
      }

      function play() {
        setupVideo(video);
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (action) {
              action.classList.remove('hidden');
            }
          });
        }
      }

      if (action) {
        action.addEventListener('click', function () {
          play();
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video || event.target === shell) {
          if (video.paused) {
            play();
          }
        }
      });

      video.addEventListener('play', function () {
        if (action) {
          action.classList.add('hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (action) {
          action.classList.remove('hidden');
        }
      });
    });
  }

  function initImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initSearch();
    initPlayers();
    initImageFallback();
  });
})();
