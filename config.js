// ============================================================
// ROPHIM — Site Configuration
// ============================================================
// Hướng dẫn:
//   1. Tạo project miễn phí tại https://supabase.com
//   2. Vào Project Settings → API, copy URL và publishable key
//   3. Paste vào 2 biến bên dưới
//   4. Vào SQL Editor, chạy toàn bộ file schema.sql để tạo bảng
//   5. Vào Storage, tạo bucket tên "videos" (public)
//   6. Deploy lên GitHub Pages
// ============================================================

window.ROPHIM_CONFIG = {
  // === Thay bằng giá trị thật từ Supabase project của bạn ===
  SUPABASE_URL: 'https://zzaudicmeqgxncmwzrwq.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_SpEa_nzUQqGx030C1vi5mA_FnBqN0uv',

  // Tên bucket lưu video trong Supabase Storage
  VIDEOS_BUCKET: 'videos',

  // Có hiển thị banner "Demo Mode" khi chưa cấu hình Supabase hay không
  SHOW_DEMO_BANNER: true,
};

// ============================================================
// Auto-detect chế độ Demo
// ============================================================
window.ROPHIM_DEMO_MODE =
  !window.ROPHIM_CONFIG.SUPABASE_URL ||
  window.ROPHIM_CONFIG.SUPABASE_URL.includes('YOUR-PROJECT');
