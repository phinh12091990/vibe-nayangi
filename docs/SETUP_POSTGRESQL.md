# HƯỚNG DẪN KẾT NỐI POSTGRESQL TRÊN VIBE HOST

Hệ thống **Nay Ăn Gì** hỗ trợ kết nối trực tiếp với PostgreSQL Database vừa khởi tạo trên **Vibe Host** (`v2.tinhngon.xyz`).

---

## 1. Thông tin Database của bạn (Vibe Host)
- **Host (nội bộ Vibe Host):** `your_db_host`
- **Port (nội bộ Vibe Host):** `5432`
- **Database:** `nayangi_db`
- **Username:** `your_db_user`
- **Password:** `your_db_password`

---

## 2. Chuỗi kết nối chuẩn trong mạng nội bộ Vibe Host
Do chuỗi sao chép mặc định từ giao diện bị khuyết host ngoài (`@:0`), chuỗi kết nối chuẩn để chạy trong môi trường Vibe Host là:

```text
postgresql://your_db_user:your_db_password@your_db_host:5432/nayangi_db
```

---

## 3. Cấu hình Biến Môi Trường (Environment Variables) trên Vibe Host
Vào phần **Cài đặt Website / Ứng dụng** trên trang quản trị Vibe Host, mục **Biến môi trường (Environment Variables)** và thêm:

| Tên biến (Key) | Giá trị (Value) |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://your_db_user:your_db_password@your_db_host:5432/nayangi_db` |
| `PGHOST` | `your_db_host` |
| `PGPORT` | `5432` |
| `PGDATABASE` | `nayangi_db` |
| `PGUSER` | `your_db_user` |
| `PGPASSWORD` | `your_db_password` |

---

## 4. Bảo mật tuyệt đối (Tuân thủ Điều luật số 2 của BTC)
- File `.env` chứa mật khẩu đã được tự động thêm vào `.gitignore` để không bao giờ bị lộ lên GitHub.
- Dự án có sẵn cơ chế fallback an toàn: khi chưa kết nối mạng nội bộ của Vibe Host, ứng dụng vẫn hoạt động mượt mà với local storage và tự động đồng bộ ngay khi deploy lên Vibe Host.
