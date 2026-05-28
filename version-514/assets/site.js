(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.nav-menu');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var searchInput = document.getElementById('movieSearch');
  var genreFilter = document.getElementById('genreFilter');
  var yearFilter = document.getElementById('yearFilter');
  var categoryFilter = document.getElementById('categoryFilter');
  var movieGrid = document.getElementById('movieGrid');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!movieGrid) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var genre = normalize(genreFilter && genreFilter.value);
    var year = normalize(yearFilter && yearFilter.value);
    var category = normalize(categoryFilter && categoryFilter.value);
    var cards = Array.prototype.slice.call(movieGrid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.year,
        card.textContent
      ].join(' '));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchGenre = !genre || normalize(card.dataset.genre).indexOf(genre) !== -1;
      var matchYear = !year || normalize(card.dataset.year) === year;
      var matchCategory = !category || normalize(card.dataset.category) === category;
      card.hidden = !(matchKeyword && matchGenre && matchYear && matchCategory);
    });
  }

  [searchInput, genreFilter, yearFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  if (searchInput && window.location.search) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
      applyFilters();
    }
  }

  var video = document.getElementById('movieVideo');
  var overlay = document.querySelector('.player-overlay');
  var streamData = document.getElementById('streamData');
  var bound = false;

  function getStreamUrl() {
    if (!streamData) {
      return '';
    }

    try {
      return JSON.parse(streamData.textContent || '{}').url || '';
    } catch (error) {
      return '';
    }
  }

  function bindVideo() {
    if (!video || bound) {
      return;
    }

    var streamUrl = getStreamUrl();

    if (!streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      bound = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      bound = true;
      return;
    }

    video.src = streamUrl;
    bound = true;
  }

  function startVideo() {
    bindVideo();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video) {
      video.controls = true;
      video.play().catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (!bound) {
        startVideo();
      }
    }, { once: true });
  }
}());
