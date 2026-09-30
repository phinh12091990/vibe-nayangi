# 🍲 Nay Ăn Gì? (AI Food Decision & Nutrition Assistant)

> **Dự án tham dự Vibe Code Challenge — Nhánh B: Giải bài toán của chính mình (Cá nhân & Đời sống)**  
> Ứng dụng giải quyết "bệnh phân vân ăn gì" kinh niên của dân văn phòng, kết hợp công nghệ Gamification (vòng quay Slot Machine), thuật toán Logic Engine cân bằng dinh dưỡng, gợi ý theo chỉ số thể trạng (BMI/TDEE), hầu bao và thời tiết thực tế.

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Oxlint](https://img.shields.io/badge/Oxlint-Clean-success.svg)](https://oxc.rs/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 1. Vấn đề thực tế & Giải pháp

- **Vấn đề:** 
  - Một người làm việc văn phòng đối mặt với câu hỏi *"Hôm nay ăn gì?"* 2–3 lần/ngày (~15–20 lần/tuần), tốn trung bình 15–20 phút lướt app trong vô vọng.
  - Ăn theo quán tính dẫn đến lệch dinh dưỡng (nhiều ngày liền ăn thịt đỏ, dầu mỡ, thiếu rau xanh và cá).
  - Khó kiểm soát calo và không có công cụ gợi ý cá nhân hóa dựa trên chiều cao, cân nặng và thể trạng BMI.
- **Giải pháp của "Nay Ăn Gì":**
  - **Không phải vòng quay may rủi đơn thuần:** Vòng quay chỉ là yếu tố thư giãn tạo sự phấn khích, đằng sau là **Logic Engine đa biến**.
  - **The Hook (Lý do chọn món):** Hiển thị minh bạch lý do AI chọn món cho bạn *(VD: "Vì 4 bữa gần nhất bạn chưa ăn rau củ và mục tiêu vóc dáng là Giảm mỡ")*.
  - **Cầu nối 1-Click Đặt món:** Sau khi chốt món, 1 chạm mở ngay ShopeeFood / GrabFood / Google Maps tìm quán gần nhất.

---

## 🚀 2. Tính năng nổi bật

### 🎯 1. Quay Món Thông Minh (Smart Reel Engine)
- **Vòng quay Slot Machine mượt mà:** Sử dụng chuyển động CSS Bezier tối ưu tốc độ 60FPS kèm âm thanh Web Audio và rung phản hồi (Haptic).
- **Trọng số thông minh (Weighted Random):** Tự động hạ điểm các món vừa ăn gần đây (chống ngán), tăng điểm nhóm chất thiếu hụt (rau xanh, cá, thịt trắng).
- **Pháo hoa Confetti:** Chúc mừng khi người dùng bấm "Chốt món này" và tự động lưu vào Nhật ký dinh dưỡng.

### 🏋️ 2. Hồ Sơ Thể Trạng & Chỉ Số BMI (Body Profile)
- Nhập chiều cao, cân nặng, giới tính và mục tiêu vóc dáng (*Giảm cân, Tăng cơ, Thanh lọc, Cân bằng*).
- Tự động đo chỉ số **BMI** theo chuẩn thể trạng người châu Á (vạch màu trực quan: Chuẩn cân đối, Tiền thừa cân, Thừa cân).
- Tự động cộng điểm ưu tiên các món phù hợp với vóc dáng của bạn.

### 💰 3. Bộ lọc Hầu bao / Ngân sách (Budget Mode)
- Phân khúc chi phí cho mỗi món ăn:
  - `💰 Bình dân (< 45.000đ)`: Món cứu cánh cuối tháng (Bánh mì, Cơm tấm sườn, Xôi mặn, Bún riêu...).
  - `🍛 Tiêu chuẩn (45.000đ - 75.000đ)`: Bữa ăn thường nhật cân đối.
  - `🥩 Thưởng nóng / Xoã (> 75.000đ)`: Tự thưởng cho bản thân một bữa thịnh soạn xả stress.

### 🌦️ 4. Chọn nhanh theo Thời tiết & Tâm trạng (Weather & Mood Spin)
- **🌧️ Trời mưa / Lạnh:** Tự động tăng 50% điểm ưu tiên cho món nước nóng hổi bốc khói (Phở bò, Bún bò Huế, Cháo lòng, Hủ tiếu, Canh chua...).
- **☀️ Nắng nóng:** Ưu tiên món thanh mát hạ nhiệt (Salad ức gà, Gỏi cuốn tôm thịt, Bún chả...).
- **⚡ Cần ăn vội (< 15 phút):** Ưu tiên món chế biến nhanh, ăn nhanh gọn lẹ.

### 👥 5. Chế độ "Ăn cùng đồng nghiệp" (Group Dining Mode)
- Cho phép tích chọn danh sách đồng nghiệp đi ăn cùng phòng ban.
- Dung hòa kiêng cữ chéo: Hệ thống tự động tổng hợp dị ứng của toàn bộ thành viên và **tìm mẫu số chung an toàn 100% cho cả nhóm**.

### 🛵 6. Cầu nối Đặt đồ ăn 1-Click (1-Click Delivery & Map)
- **ShopeeFood / Foody:** Mở ngay danh sách hàng trăm quán bán món ăn đã chọn kèm đánh giá và menu.
- **GrabFood:** Tìm kiếm quán giao nhanh nhất khu vực.
- **Google Maps:** Định vị GPS tìm các quán ăn gần vị trí của bạn kèm chỉ đường và số điện thoại.
- **Chia sẻ Story:** Tạo câu quote món ăn thú vị để gửi nhanh vào Zalo / Instagram.

### 📖 7. Sổ Món Thực Đơn Tinh Gọn (Menu Management)
- Sổ thực đơn hơn 50 món ăn chuẩn vị Việt.
- **Chế độ xem siêu gọn (Compact List View):** Tối ưu chiều cao ~48px mỗi món trên Mobile, hiển thị 6-7 món không cần cuộn mỏi tay.
- Thanh tìm kiếm và bộ lọc ghim nổi (Sticky header).
- Thêm, sửa, xoá và bật/tắt món linh hoạt.

### 📊 8. Nhật Ký & Đánh Giá Cân Bằng (Health Insights)
- Biểu đồ phân bổ 5 nhóm chất trong 7 bữa gần nhất.
- Điểm cân bằng dinh dưỡng (Variety Score /100).
- Hệ thống cảnh báo tự động: Thiếu rau củ, thiếu cá/hải sản, ăn quá nhiều thịt đỏ.

---

## 🖥️ 3. Thiết kế Responsive Đa Nền Tảng

- **Trên Máy tính (Desktop Dashboard $\ge$ 1024px):** Bố cục 2 cột (Dual-Column) kết hợp Sidebar cố định bên trái, xem đồng thời vòng quay và widget thống kê dinh dưỡng trong ngày.
- **Trên Điện thoại (Mobile PWA < 1024px):** Giao diện thao tác bằng một tay (Thumb-friendly), thanh Bottom Navigation hiệu ứng Glassmorphism mờ ảo cao cấp.

---

## 🛠️ 4. Công nghệ sử dụng

- **Frontend:** [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/), [React Router 7](https://reactrouter.com/)
- **Styling:** Vanilla CSS Hiện đại (Glassmorphism, CSS Custom Properties, Dark Mode neon, Flexbox/Grid responsive)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio & Hiệu ứng:** Web Audio API (âm thanh máy quay slot), Canvas Confetti, HTML5 Vibration API (Haptic)
- **Lưu trữ:** Web Storage (LocalStorage) hoạt động Offline 100%, không cần cài đặt backend phức tạp
- **Linter & Performance:** [Oxlint](https://oxc.rs/) siêu tốc (0 errors, 0 warnings)

---

## 💻 5. Hướng dẫn chạy cục bộ (Getting Started)

### Yêu cầu môi trường
- **Node.js:** v18.0.0 trở lên (khuyên dùng Node 20 hoặc Node 22)
- **Trình duyệt:** Chrome, Edge, Safari, Firefox phiên bản hiện đại

### Cài đặt và khởi chạy

```bash
# 1. Clone repository
git clone https://github.com/phinh12091990/vibe-nayangi.git
cd vibe-nayangi

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi động môi trường phát triển (Dev server)
npm run dev

# 4. Kiểm tra code chuẩn với Oxlint
npm run lint

# 5. Đóng gói bản Production
npm run build
```

Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 📁 6. Cấu trúc thư mục

```
vibecodechallenge/
├── docs/
│   └── PRD.md              # Tài liệu chi tiết yêu cầu sản phẩm & lộ trình
├── public/
│   └── favicon.svg         # Favicon tô phở nóng bốc khói
├── src/
│   ├── assets/             # Hình ảnh & tài nguyên tĩnh
│   ├── components/
│   │   ├── GroupModal.jsx  # Modal quản lý nhóm đồng nghiệp & dị ứng
│   │   └── ProfileModal.jsx# Modal cài đặt hồ sơ thể trạng & BMI
│   ├── data/
│   │   └── seedData.js     # Danh mục 48+ món ăn Việt (kèm phân khúc giá & mood)
│   ├── hooks/
│   │   └── useStorage.js   # Custom Hook đồng bộ LocalStorage & State
│   ├── pages/
│   │   ├── Home.jsx        # Trang quay số, bộ lọc nhanh & 1-Click order
│   │   ├── Menu.jsx        # Trang quản lý sổ món (Compact list view)
│   │   └── History.jsx     # Trang nhật ký bữa ăn & biểu đồ dinh dưỡng
│   ├── utils/
│   │   ├── audio.js        # Trình phát âm thanh Web Audio
│   │   ├── confetti.js     # Hiệu ứng pháo hoa khi chốt món
│   │   └── logicEngine.js  # Thuật toán tính trọng số chọn món thông minh
│   ├── App.jsx             # Shell điều hướng & Sidebar layout
│   ├── index.css           # Toàn bộ design system & CSS variables
│   └── main.jsx
├── package.json
└── README.md
```

---

## 📜 7. Bản quyền & Đóng góp
Dự án được phát triển cho cuộc thi **Vibe Code Challenge**.  
Mã nguồn mở theo giấy phép MIT License. Chúc bạn có những bữa ăn ngon miệng và cân đối dinh dưỡng mỗi ngày! 🍜
