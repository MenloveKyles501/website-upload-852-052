(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var filterChips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var activeChip = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!filterList) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : '');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var chipMatch = !activeChip || haystack.indexOf(normalize(activeChip)) !== -1;
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('hidden-by-filter', !(chipMatch && keywordMatch));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      activeChip = chip.getAttribute('data-filter-chip') || '';
      applyFilter();
    });
  });

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var streamUrl = player.getAttribute('data-stream-url');
    var loaded = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (!video || !streamUrl || loaded) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function startVideo() {
      prepareVideo();

      if (!video) {
        return;
      }

      player.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    }
  }
})();
