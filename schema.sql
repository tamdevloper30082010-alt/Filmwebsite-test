-- ============================================================
-- ROPHIM — Supabase Database Schema
-- ============================================================
-- Chạy file này trong Supabase SQL Editor (một lần duy nhất).
-- Nó sẽ tạo bảng, indexes, RLS policies, và một vài dữ liệu mẫu.
-- ============================================================

-- 1) Bảng phim
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'series',          -- 'series' | 'single'
  genre text not null default 'Hành động',
  year int not null default 2026,
  quality text not null default 'HD',           -- 'HD' | 'FHD' | '4K'
  country text default '',
  director text default '',
  cast_list text default '',
  duration text default '',                      -- ví dụ: "120 phút" hoặc "45 phút/tập"
  rating numeric(3,1) default 0,                -- 0.0 - 10.0
  poster text default '',                        -- URL ảnh poster
  backdrop text default '',                      -- URL ảnh nền lớn
  description text default '',
  featured boolean default false,                -- hiển thị ở hero carousel
  views bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Bảng tập
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  episode_number int not null default 1,
  title text not null default '',
  video_path text not null,                      -- path trong Supabase Storage (vd: "abc/movie-1-ep1.mp4")
  video_url text default '',                     -- URL công khai hoặc external URL
  server text default 'Server 1',
  duration int default 0,                        -- giây
  created_at timestamptz default now()
);

-- 3) Indexes
create index if not exists idx_movies_genre on public.movies(genre);
create index if not exists idx_movies_year on public.movies(year desc);
create index if not exists idx_movies_featured on public.movies(featured);
create index if not exists idx_movies_created on public.movies(created_at desc);
create index if not exists idx_episodes_movie on public.episodes(movie_id);

-- 4) Row Level Security
alter table public.movies enable row level security;
alter table public.episodes enable row level security;

-- Ai cũng đọc được
drop policy if exists "movies_public_read" on public.movies;
create policy "movies_public_read" on public.movies
  for select using (true);

drop policy if exists "episodes_public_read" on public.episodes;
create policy "episodes_public_read" on public.episodes
  for select using (true);

-- Chỉ authenticated mới được ghi (admin dùng email/password login)
drop policy if exists "movies_admin_write" on public.movies;
create policy "movies_admin_write" on public.movies
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "episodes_admin_write" on public.episodes;
create policy "episodes_admin_write" on public.episodes
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 5) Trigger cập nhật updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_movies_updated on public.movies;
create trigger trg_movies_updated before update on public.movies
  for each row execute function public.touch_updated_at();

-- ============================================================
-- KHÔNG CÓ DỮ LIỆU MẪU
-- Sau khi chạy schema này, database hoàn toàn trống.
-- Admin sẽ upload phim qua trang /admin/ trên website.
-- ============================================================

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Vào Storage → New bucket, tạo bucket tên "videos" và bật Public
-- (Schema SQL không tạo bucket được; phải tạo thủ công trong dashboard)
-- ============================================================

-- Storage policies (chạy sau khi tạo bucket "videos")
-- Public read
drop policy if exists "videos_public_read" on storage.objects;
create policy "videos_public_read" on storage.objects
  for select using (bucket_id = 'videos');

-- Authenticated write
drop policy if exists "videos_admin_write" on storage.objects;
create policy "videos_admin_write" on storage.objects
  for insert with check (bucket_id = 'videos' and auth.role() = 'authenticated');

drop policy if exists "videos_admin_update" on storage.objects;
create policy "videos_admin_update" on storage.objects
  for update using (bucket_id = 'videos' and auth.role() = 'authenticated');

drop policy if exists "videos_admin_delete" on storage.objects;
create policy "videos_admin_delete" on storage.objects
  for delete using (bucket_id = 'videos' and auth.role() = 'authenticated');
