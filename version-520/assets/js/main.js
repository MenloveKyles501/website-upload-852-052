(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-site-nav]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot') || 0);
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var category = card.getAttribute('data-category') || '';
      var matchesText = !query || text.indexOf(query) !== -1;
      var matchesCategory = activeFilter === 'all' || category === activeFilter;
      card.classList.toggle('is-hidden', !(matchesText && matchesCategory));
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    searchInput.addEventListener('input', applyFilters);
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      applyFilters();
      searchInput.focus();
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  if (cards.length) {
    applyFilters();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var status = box.querySelector('.player-status');
    var source = box.getAttribute('data-video');
    var loaded = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function loadVideo() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      setStatus('视频加载中');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('视频加载失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('');
        }, { once: true });
        video.addEventListener('error', function () {
          setStatus('视频加载失败');
        });
      } else {
        setStatus('视频暂时无法在当前浏览器播放');
      }
    }

    function startPlayback() {
      loadVideo();
      if (overlay) {
        overlay.hidden = true;
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {
            if (overlay) {
              overlay.hidden = false;
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
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.hidden = true;
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.hidden = false;
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
