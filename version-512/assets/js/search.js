(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var input = document.getElementById('searchPageInput');
  var title = document.getElementById('searchTitle');
  var results = document.getElementById('searchResults');

  if (input) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function card(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
    return [
      '<a class="movie-card landscape-card" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(tags) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="card-badge">' + escapeHtml(movie.region) + '</span>',
      '    <span class="play-hover">▶</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span class="movie-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</span>',
      '    <span class="movie-line">' + escapeHtml(movie.line) + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function run() {
    if (!results || typeof SEARCH_MOVIES === 'undefined') {
      return;
    }

    var q = normalize(query);
    var list = SEARCH_MOVIES.filter(function (movie) {
      if (!q) {
        return true;
      }

      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        Array.isArray(movie.tags) ? movie.tags.join(' ') : '',
        movie.line
      ].join(' '));
      return haystack.indexOf(q) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = q ? '搜索结果：' + query : '推荐片库';
    }

    results.innerHTML = list.map(card).join('');
  }

  run();
})();
