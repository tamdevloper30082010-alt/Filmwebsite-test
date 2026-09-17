// ============================================================
// ROPHIM — Data Access Layer
// Wraps Supabase queries. When Supabase is not configured,
// the API returns empty arrays so the site shows a clean
// "no movies yet" state until the admin uploads something.
// ============================================================

const RophimAPI = (() => {
  const isDemo = () => window.ROPHIM_DEMO_MODE;

  // ----------------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------------
  async function listMovies({ genre, year, sort = 'created_at', order = 'desc', search, limit } = {}) {
    if (isDemo()) {
      // No demo data — site stays empty until user configures Supabase + uploads
      return [];
    }
    await window.sbReady;
    let q = window.sb.from('movies').select('*');
    if (genre && genre !== 'all') q = q.eq('genre', genre);
    if (year && year !== 'all') q = q.eq('year', Number(year));
    if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%,cast.ilike.%${search}%`);
    q = q.order(sort, { ascending: order === 'asc' });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function getMovie(id) {
    if (isDemo()) return null;
    await window.sbReady;
    const { data, error } = await window.sb.from('movies').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async function getEpisodes(movieId) {
    if (isDemo()) return [];
    await window.sbReady;
    const { data, error } = await window.sb
      .from('episodes')
      .select('*')
      .eq('movie_id', movieId)
      .order('episode_number', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function getFeatured() {
    return listMovies({ sort: 'rating', order: 'desc', limit: 5 });
  }

  async function getRelated(movieId, genre) {
    if (!genre) return [];
    const all = await listMovies({ genre });
    return all.filter(m => m.id !== movieId).slice(0, 6);
  }

  async function searchMovies(query) {
    return listMovies({ search: query });
  }

  // ---------- ADMIN: write operations ----------
  async function upsertMovie(movie) {
    if (isDemo()) throw new Error('Vui lòng cấu hình Supabase trong config.js để upload.');
    await window.sbReady;
    if (movie.id) {
      const { id, ...rest } = movie;
      const { data, error } = await window.sb.from('movies').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await window.sb.from('movies').insert(movie).select().single();
      if (error) throw error;
      return data;
    }
  }

  async function deleteMovie(id) {
    if (isDemo()) throw new Error('Vui lòng cấu hình Supabase trong config.js.');
    await window.sbReady;
    // Get all episodes first to delete their storage files
    const { data: eps } = await window.sb.from('episodes').select('video_path').eq('movie_id', id);
    if (eps && eps.length) {
      const paths = eps.map(e => e.video_path).filter(Boolean);
      if (paths.length) {
        await window.sb.storage.from(window.ROPHIM_CONFIG.VIDEOS_BUCKET).remove(paths);
      }
    }
    const { error } = await window.sb.from('movies').delete().eq('id', id);
    if (error) throw error;
  }

  async function addEpisode(episode) {
    if (isDemo()) throw new Error('Vui lòng cấu hình Supabase trong config.js để upload.');
    await window.sbReady;
    const { data, error } = await window.sb.from('episodes').insert(episode).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteEpisode(id) {
    if (isDemo()) throw new Error('Vui lòng cấu hình Supabase trong config.js.');
    await window.sbReady;
    const { data: ep } = await window.sb.from('episodes').select('video_path').eq('id', id).single();
    if (ep?.video_path) {
      await window.sb.storage.from(window.ROPHIM_CONFIG.VIDEOS_BUCKET).remove([ep.video_path]);
    }
    const { error } = await window.sb.from('episodes').delete().eq('id', id);
    if (error) throw error;
  }

  async function uploadVideo(file, movieId, episodeNumber) {
    if (isDemo()) throw new Error('Vui lòng cấu hình Supabase trong config.js để upload.');
    await window.sbReady;
    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : 'mp4';
    const path = `${movieId}/ep-${episodeNumber}-${Date.now()}.${safeExt}`;
    const { data, error } = await window.sb.storage
      .from(window.ROPHIM_CONFIG.VIDEOS_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: pub } = window.sb.storage.from(window.ROPHIM_CONFIG.VIDEOS_BUCKET).getPublicUrl(path);
    return { path: data.path, url: pub.publicUrl };
  }

  return {
    listMovies, getMovie, getEpisodes, getFeatured, getRelated, searchMovies,
    upsertMovie, deleteMovie, addEpisode, deleteEpisode, uploadVideo,
    isDemo, GENRES: ['Hành động', 'Tình cảm', 'Kinh dị', 'Hoạt hình', 'Bí ẩn', 'Hài hước', 'Phiêu lưu'],
  };
})();

window.RophimAPI = RophimAPI;
