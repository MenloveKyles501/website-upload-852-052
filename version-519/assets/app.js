
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var search = document.getElementById('site-search');
  var yearFilter = document.querySelector('[data-filter-year]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var clearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-clear-search]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var query = normalize(search ? search.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesYear = !year || card.getAttribute('data-year') === year;
      var matchesRegion = !region || card.getAttribute('data-region') === region;

      card.classList.toggle('is-hidden', !(matchesQuery && matchesYear && matchesRegion));
    });
  }

  if (search) {
    search.addEventListener('input', filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }

  if (regionFilter) {
    regionFilter.addEventListener('change', filterCards);
  }

  clearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (search) {
        search.value = '';
      }

      if (yearFilter) {
        yearFilter.value = '';
      }

      if (regionFilter) {
        regionFilter.value = '';
      }

      filterCards();
    });
  });
}());

function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var loaded = false;
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function loadVideo() {
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }
  }

  function startPlayback() {
    loadVideo();
    button.classList.add('is-hidden');

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (loaded && !video.ended) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
