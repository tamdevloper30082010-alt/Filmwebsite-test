# 🎬 Rophim — Movie Website

Website xem phim chuyên nghiệp với admin panel riêng biệt để upload và quản lý phim. Tất cả video và metadata được lưu trên **Supabase** (miễn phí). Host tĩnh trên **GitHub Pages**.

## ✨ Tính năng

### Phần công khai (khách truy cập)
- 🏠 **Trang chủ** với hero carousel + các hàng phim theo thể loại
- 🎬 **Chi tiết phim** với backdrop blur, rating, episodes list, phim tương tự
- ▶️ **Trang xem** với player 16:9 (MP4/YouTube/Vimeo), chuyển server, auto-next
- 🗂 **Khám phá** với filter thể loại/năm, sắp xếp theo rating/views/năm
- 🔍 **Tìm kiếm** theo tên phim, diễn viên, đạo diễn
- ❤️ **Yêu thích & lịch sử xem** lưu localStorage
- 📱 **Responsive** mobile/tablet/desktop

### Phần quản trị (`/admin/`)
- 🔐 **Đăng nhập email/password** qua Supabase Auth
- 📤 **Upload phim** với nhiều tập, file hoặc URL video
- 🎥 **Upload video lên cloud** (Supabase Storage) — không giới hạn dung lượng local
- 📚 **Quản lý**: xem, sửa, xóa phim (xóa cả file video trên cloud)

## 📁 Cấu trúc thư mục

```
rophim/
├── index.html              # Trang chủ
├── movie.html              # Chi tiết phim
├── watch.html              # Xem phim
├── browse.html             # Khám phá / tìm kiếm / lọc
├── admin.html              # Auto-redirect → /admin/
├── admin/                  # ⭐ TRANG QUẢN TRỊ RIÊNG
│   └── index.html          # Admin panel (login + upload + manage)
├── config.js               # ⚙ File cấu hình Supabase
├── schema.sql              # SQL schema cho database
├── assets/
│   ├── css/
│   │   ├── theme.css       # Theme tối chung
│   │   └── detail.css      # Style chi tiết/watch/browse
│   └── js/
│       ├── supabase.js     # Supabase client + auth
│       ├── api.js          # Data layer (CRUD movies, episodes)
│       └── utils.js        # UI helpers, history, watchlist
└── README.md
```

**Trang admin ở URL riêng `/admin/`** — không hiển thị ở navigation chính, người dùng bình thường không thấy.

---

## 🚀 Hướng dẫn Setup Database Supabase (từng bước)

### Bước 1 — Tạo tài khoản & project Supabase (2 phút)

1. Vào **https://supabase.com** → bấm **Start your project** → đăng ký bằng GitHub (nhanh nhất)
2. Sau khi đăng nhập, bấm **New Project**
3. Điền thông tin:
   - **Name**: `rophim` (hoặc tên bạn thích)
   - **Database Password**: đặt mật khẩu mạnh, **LƯU LẠI** (sẽ cần nếu muốn truy cập DB trực tiếp)
   - **Region**: chọn `Singapore` (gần VN nhất) hoặc gần bạn
4. Bấm **Create new project** → đợi ~2 phút để Supabase khởi tạo

### Bước 2 — Chạy Schema SQL (1 phút)

1. Trong dashboard Supabase, menu bên trái → **SQL Editor**
2. Bấm **+ New query**
3. Mở file [`schema.sql`](schema.sql) trong repo này → **copy toàn bộ nội dung** → paste vào editor
4. Bấm **Run** (hoặc Ctrl/Cmd + Enter)
5. Kết quả thành công sẽ hiển thị các thông báo "Success. No rows returned" — đã tạo 2 bảng (`movies`, `episodes`) và các policies

### Bước 3 — Tạo Storage Bucket (30 giây)

1. Menu bên trái → **Storage**
2. Bấm **New bucket**
3. Điền:
   - **Name**: `videos` (đúng tên này, viết thường, viết liền)
   - **Public bucket**: ✅ BẬT (để mọi người xem được video)
4. Bấm **Create bucket**

### Bước 4 — Lấy API Keys (30 giây)

1. Menu bên trái → **Project Settings** (icon bánh răng ở dưới cùng)
2. Bấm **API** trong menu con
3. Bạn sẽ thấy 2 giá trị cần copy:
   - **Project URL** (vd: `https://abcdefgh.supabase.co`) — copy nguyên
   - **Project API keys → `anon` `public`** (chuỗi dài bắt đầu bằng `eyJhbGc...`) — copy nguyên
4. ⚠️ ĐỪNG copy key `service_role` — key đó có quyền admin tuyệt đối, không bao giờ để lộ client-side

### Bước 5 — Cấu hình trong code (30 giây)

Mở file `config.js` ở thư mục gốc, paste 2 giá trị vừa copy:

```javascript
window.ROPHIM_CONFIG = {
  SUPABASE_URL: 'https://abcdefgh.supabase.co',       // ← paste URL vào đây
  SUPABASE_ANON_KEY: 'eyJhbGc...chuỗi_dài...',       // ← paste anon key vào đây
  VIDEOS_BUCKET: 'videos',
  SHOW_DEMO_BANNER: true,
};
```

Lưu file. Xong bước setup!

### Bước 6 — Tạo tài khoản Admin (1 phút)

1. Mở website (`index.html` hoặc URL đã deploy)
2. Truy cập URL admin: `https://your-site.com/admin/`
3. Bạn sẽ thấy form **Admin Panel** → nhập email + mật khẩu (≥ 6 ký tự)
4. Bấm **"Tạo tài khoản Admin mới"**
5. Supabase sẽ gửi email xác nhận → bấm link trong email để kích hoạt

> 💡 **Tắt email confirm** (khuyến nghị cho cá nhân):
> Trong Supabase dashboard → **Authentication** → **Providers** → **Email** → tắt **"Confirm email"** → Save
> Sau đó tạo lại tài khoản là vào được luôn, không cần xác nhận email.

6. Sau khi đăng nhập thành công → vào tab **"Đăng phim"** → upload phim đầu tiên!

---

## 🌐 Deploy lên GitHub Pages

### Cách 1 — Qua giao diện web (dễ nhất)

1. Đăng nhập GitHub → **New repository** → tên `rophim` (công khai)
2. Bấm **uploading an existing file** → kéo thả TẤT CẢ file/folder trong repo này vào (bao gồm cả folder `admin/`, `assets/`)
3. Bấm **Commit changes**
4. Vào **Settings** của repo → **Pages** (menu bên trái)
5. Mục **Source**: chọn **Deploy from a branch**
6. **Branch**: chọn `main` (hoặc `master`) → **Folder**: `/ (root)` → bấm **Save**
7. Đợi 1-2 phút → GitHub cung cấp URL: `https://username.github.io/rophim/`

### Cách 2 — Qua Git command line

```bash
git init
git add .
git commit -m "Initial Rophim"
git branch -M main
git remote add origin https://github.com/username/rophim.git
git push -u origin main
```

Sau đó làm bước 4-7 ở Cách 1 để bật Pages.

### Truy cập

- **Trang khách**: `https://username.github.io/rophim/`
- **Trang admin**: `https://username.github.io/rophim/admin/`

> ⚠️ **Quan trọng**: Vì Supabase `anon` key được public trong code JavaScript, bảo mật thực hiện qua **Row Level Security (RLS)**. Schema SQL đã cấu hình RLS đúng — guest chỉ đọc, chỉ user đã đăng nhập mới ghi được.

---

## 📖 Cách dùng Admin Panel

### Upload phim mới

1. Vào `/admin/` → đăng nhập
2. Tab **"📤 Đăng phim"**
3. Điền thông tin:
   - **Tên phim** (bắt buộc)
   - **Loại**: phim bộ (nhiều tập) hoặc phim lẻ
   - **Thể loại, năm, chất lượng**
   - **Poster URL, Backdrop URL**: link ảnh (lấy từ TMDB, Unsplash, hoặc bất kỳ đâu)
   - **Mô tả, đạo diễn, diễn viên, rating**
4. Phần **Danh sách tập**:
   - Mặc định có 1 tập → có thể bấm **"+ Thêm tập"** để thêm
   - Với mỗi tập: chọn **file video từ máy** HOẶC nhập **URL video** (YouTube, Vimeo, link .mp4, .m3u8)
   - Đặt tên tập + thời lượng (giây)
5. Bấm **"📤 Đăng phim"** → file video được upload lên Supabase Storage → phim xuất hiện trên website ngay lập tức

### Quản lý phim

Tab **"📚 Quản lý phim"**:
- Xem danh sách tất cả phim đã upload
- Bấm **"Xem"** để mở trang chi tiết
- Bấm **🗑** để xóa (sẽ xóa cả file video trên Storage)

### Upload video dung lượng lớn

- Supabase free tier cho phép file tối đa **50MB/file** (Pro: 5GB)
- Với phim nhiều GB, nên:
  - Nén video trước (H.264, 720p đủ xem)
  - Hoặc upload lên dịch vụ khác (Google Drive, OneDrive) → dùng link .mp4 trực tiếp
  - Hoặc nâng cấp Supabase Pro ($25/tháng, 100GB storage)

---

## 🐛 Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|------|-------------|----------|
| **"Supabase chưa được cấu hình"** | Chưa sửa `config.js` | Paste URL + anon key vào |
| **Upload lỗi 403** | Bucket `videos` chưa tạo hoặc policies chưa chạy | Tạo bucket + chạy lại schema.sql |
| **Đăng nhập báo "Email not confirmed"** | Email confirm đang bật | Tắt confirm email trong Auth settings HOẶC bấm link xác nhận trong email |
| **Video không phát** | URL không hợp lệ hoặc bucket không public | Kiểm tra bucket đã bật Public, thử URL khác |
| **GitHub Pages 404** | Cache chưa cập nhật | Đợi 2-3 phút, Ctrl+Shift+R để hard reload |
| **Website trống dù đã upload** | Cache trình duyệt | Hard reload hoặc mở tab ẩn danh |

---

## ⚠️ Lưu ý pháp lý

- **Chỉ upload video bạn sở hữu hoặc có quyền phân phối**
- Mọi dữ liệu thuộc về chủ sở hữu tương ứng
- Supabase free tier: 1GB storage + 500MB database + 50K MAU — đủ cho website cá nhân / demo
- Nếu vi phạm bản quyền, bạn tự chịu trách nhiệm

## 📜 License

MIT — tự do sử dụng, sửa, phân phối.
