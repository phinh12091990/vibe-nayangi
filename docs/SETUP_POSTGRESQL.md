# HƯỚNG DẪN KẾT NỐI POSTGRESQL TRÊN VIBE HOST

Hệ thống **Nay Ăn Gì** hỗ trợ kết nối trực tiếp với cơ sở dữ liệu PostgreSQL trên **Vibe Host** thông qua cơ chế biến môi trường (Environment Variables), tuyệt đối không lưu trữ thông tin kết nối hoặc mật khẩu trong mã nguồn.

---

## 1. Nguyên tắc bảo mật (Tuân thủ Điều 2 của Ban Tổ Chức)
- Toàn bộ chuỗi kết nối và mật khẩu cơ sở dữ liệu phải được **cấu hình thông qua Biến Môi Trường (Environment Variables)** trên bảng điều khiển Vibe Host / Server hosting.
- Tệp `.env` cục bộ đã được khai báo trong `.gitignore` để không bị đẩy lên kho lưu trữ.
- Mọi tài liệu và tệp cấu hình mẫu `.env.example` chỉ sử dụng các giá trị giữ chỗ (placeholder) an toàn.

---

## 2. Cấu hình Biến Môi Trường trên Vibe Host
Vào phần **Cài đặt Website / Ứng dụng** trên trang quản trị Vibe Host, mục **Biến môi trường (Environment Variables)** và thiết lập các biến tương ứng với cơ sở dữ liệu của bạn:

### Lựa chọn A: Dùng chuỗi kết nối duy nhất (Khuyến nghị)
| Tên biến (Key) | Giá trị (Value) | Mô tả |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://<db_user>:<db_password>@<db_host>:5432/<db_name>` | Chuỗi kết nối PostgreSQL do Vibe Host cung cấp |

### Lựa chọn B: Khai báo từng thông số riêng lẻ
| Tên biến (Key) | Giá trị ví dụ | Mô tả |
| :--- | :--- | :--- |
| `PGHOST` | `your_db_host` | Địa chỉ máy chủ PostgreSQL |
| `PGPORT` | `5432` | Cổng dịch vụ PostgreSQL |
| `PGDATABASE` | `your_db_name` | Tên cơ sở dữ liệu |
| `PGUSER` | `your_db_user` | Tên người dùng CSDL |
| `PGPASSWORD` | `<mat_khau_csdl_cua_ban>` | Mật khẩu tài khoản CSDL |
| `ADMIN_PASSWORD` | `<mat_khau_quan_tri_vien>` | Mật khẩu quản trị viên hệ thống (tuỳ chọn) |

---

## 3. Cơ chế hoạt động & Fallback an toàn
- Khi Backend chạy trong môi trường có biến môi trường CSDL, hệ thống tự động kết nối và đồng bộ toàn bộ tài khoản, thực đơn và nhật ký ăn uống vào PostgreSQL.
- Khi chưa có cấu hình CSDL, ứng dụng frontend vẫn vận hành linh hoạt và độc lập nhờ bộ lưu trữ IndexedDB/LocalStorage, đảm bảo trải nghiệm người dùng liền mạch.
