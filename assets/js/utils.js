// ============================================================
// ROPHIM — Shared utilities (UI helpers, history, watchlist)
// ============================================================

const RophimUI = (() => {
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  }

  function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function formatViews(n) {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  }

  function formatSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0, x = bytes;
    while (x >= 1024 && i < units.length - 1) { x /= 1024; i++; }
    return `${x.toFixed(i ? 1 : 0)} ${units[i]}`;
  }

  // Toast notification
  function toast(message, type = '') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // Movie card HTML
  function movieCardHTML(m) {
    const epsCount = m.episodes_count ?? '';
    return `
      <article class="card" data-id="${esc(m.id)}">
        <div class="poster" style="background-image:url('${esc(m.poster || '')}')">
          ${m.type === 'series' ? `<span class="badge badge-episode">📺</span>` : ''}
          <span class="badge badge-quality">${esc(m.quality || 'HD')}</span>
          ${m.rating ? `<span class="badge badge-rating" style="position:absolute;bottom:10px;left:10px;z-index:3">⭐ ${m.rating.toFixed(1)}</span>` : ''}
          <div class="poster-overlay">
            <div class="poster-actions">
              <div class="poster-play" aria-label="Xem">▶</div>
            </div>
          </div>
        </div>
        <h3 class="card-title">${esc(m.title)}</h3>
        <div class="card-meta">
          <span>${esc(m.year || '')}</span>
          <span class="dot">•</span>
          <span>${esc(m.genre || '')}</span>
          ${m.country ? `<span class="dot">•</span><span>${esc(m.country)}</span>` : ''}
        </div>
      </article>
    `;
  }

  function renderMovieGrid(container, movies, emptyMessage = 'Không tìm thấy phim.') {
    if (!movies || !movies.length) {
      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon">🎬</div>
          <h3>Chưa có phim</h3>
          <p>${esc(emptyMessage)}</p>
        </div>`;
      return;
    }
    container.innerHTML = movies.map(movieCardHTML).join('');
  }

  // ---------- Local storage: watch history + watchlist ----------
  const HISTORY_KEY = 'rophim_history_v1';
  const WATCHLIST_KEY = 'rophim_watchlist_v1';

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
  }
  function saveHistory(x) { localStorage.setItem(HISTORY_KEY, JSON.stringify(x)); }

  function pushHistory(movieId, episodeId, episodeNumber) {
    const list = getHistory().filter(h => !(h.movieId === movieId && h.episodeId === episodeId));
    list.unshift({
      movieId, episodeId, episodeNumber,
      watchedAt: Date.now(),
    });
    saveHistory(list.slice(0, 50));
  }

  function getHistoryForMovie(movieId) {
    return getHistory().filter(h => h.movieId === movieId);
  }

  function getWatchlist() {
    try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]'); }
    catch { return []; }
  }
  function toggleWatchlist(movieId) {
    const list = getWatchlist();
    const i = list.indexOf(movieId);
    if (i >= 0) { list.splice(i, 1); }
    else { list.unshift(movieId); }
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list.slice(0, 200)));
    return i < 0;
  }
  function isInWatchlist(movieId) {
    return getWatchlist().includes(movieId);
  }

  return {
    esc, formatDuration, formatViews, formatSize, toast,
    movieCardHTML, renderMovieGrid,
    pushHistory, getHistoryForMovie, getHistory,
    toggleWatchlist, isInWatchlist, getWatchlist,
  };
})();

window.RophimUI = RophimUI;

// ============================================================
// Shared header / footer
// ============================================================
window.renderChrome = function (active = '') {
  const header = document.querySelector('[data-role="header"]');
  if (header && !header.innerHTML.trim()) {
    header.innerHTML = `
      <header class="topbar">
        <a class="brand" href="index.html">
          <div class="brand-logo">R</div>
          <span class="brand-name">Rophim</span>
        </a>
        <nav class="main-nav">
          <a href="index.html" class="${active === 'home' ? 'active' : ''}">Trang chủ</a>
          <a href="browse.html?type=series" class="${active === 'series' ? 'active' : ''}">Phim bộ</a>
          <a href="browse.html?type=single" class="${active === 'single' ? 'active' : ''}">Phim lẻ</a>
          <a href="browse.html" class="${active === 'browse' ? 'active' : ''}">Thể loại</a>
        </nav>
        <form class="search-bar" onsubmit="event.preventDefault(); const q=this.querySelector('input').value.trim(); if(q) location.href='browse.html?q='+encodeURIComponent(q);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="search" placeholder="Tìm phim, diễn viên..." aria-label="Tìm phim">
        </form>
        <div class="user-zone"></div>
      </header>
    `;
  }

  const demoBanner = document.querySelector('[data-role="demo-banner"]');
  if (demoBanner && window.ROPHIM_CONFIG.SHOW_DEMO_BANNER && window.ROPHIM_DEMO_MODE) {
    demoBanner.innerHTML = `
      <div class="demo-banner">
        <strong>Website đang trong chế độ trống.</strong>
        Chưa có phim nào được đăng tải.
      </div>
    `;
  }

  const footer = document.querySelector('[data-role="footer"]');
  if (footer && !footer.innerHTML.trim()) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>Rophim</h4>
              <p>Kho phim trực tuyến với hàng ngàn bộ phim hấp dẫn. Xem phim chất lượng cao, miễn phí.</p>
            </div>
            <div class="footer-col">
              <h4>Khám phá</h4>
              <a href="browse.html?type=series">Phim bộ</a>
              <a href="browse.html?type=single">Phim lẻ</a>
              <a href="browse.html">Tất cả thể loại</a>
            </div>
            <div class="footer-col">
              <h4>Liên hệ</h4>
              <a href="admin/">Trang quản trị</a>
            </div>
            <div class="footer-col">
              <h4>Lưu ý</h4>
              <p>Chỉ đăng nội dung bạn có quyền phân phối.</p>
            </div>
          </div>
          <div class="footer-bottom">
            © ${new Date().getFullYear()} Rophim
          </div>
        </div>
      </footer>
    `;
  }
};
