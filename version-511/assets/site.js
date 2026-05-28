(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterPage = document.querySelector('[data-filter-page]');
  if (filterPage) {
    var input = filterPage.querySelector('[data-filter-input]');
    var yearSelect = filterPage.querySelector('[data-year-filter]');
    var regionSelect = filterPage.querySelector('[data-region-filter]');
    var items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search'));
        var itemYear = item.getAttribute('data-year') || '';
        var itemRegion = item.getAttribute('data-region') || '';
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || itemYear === year;
        var matchedRegion = !region || itemRegion === region;
        item.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedRegion));
      });
    }

    if (input && query) {
      input.value = query;
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilters);
    }

    applyFilters();
  }

  document.querySelectorAll('.player').forEach(function (frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    var stream = frame.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
