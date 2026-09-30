# Tài liệu PRD: Nay Ăn Gì (AI Food Decision & Nutrition Assistant)

## 1. Tổng quan sản phẩm
- **Tên sản phẩm:** Nay Ăn Gì
- **Nhánh dự thi:** Nhánh B — Giải bài toán của chính mình.
- **Nhóm chủ đề:** Cá nhân / Đời sống / Sức khỏe văn phòng.
- **Bài toán thực tế:** 
  - Dân văn phòng đối mặt với câu hỏi "Hôm nay ăn gì?" 2–3 lần/ngày (15–20 lần/tuần).
  - Việc chọn món thường tốn 10–20 phút lướt app giao đồ ăn vô định, dẫn đến: lặp món phát ngán, ăn theo quán tính làm lệch dinh dưỡng (quá nhiều tinh bột/dầu mỡ, thiếu rau và cá), và không kiểm soát được lượng calo so với thể trạng (thừa cân/gầy gò).

---

## 2. Chân dung người dùng (User Persona)
- **Đối tượng chính:** Dân văn phòng, người làm việc tự do (freelancer), sinh viên thường xuyên ăn ngoài hoặc đặt đồ ăn qua app (ShopeeFood, GrabFood, BeFood...).
- **Nỗi đau (Pain points):**
  1. "Bệnh" phân vân kinh niên: Không biết ăn gì, hỏi đồng nghiệp luôn nhận lại "Gì cũng được".
  2. Bữa ăn mất cân đối: 3–4 ngày liền không có rau xanh, ăn thịt đỏ liên tục.
  3. Thiếu công cụ gợi ý cá nhân hóa gắn liền với cân nặng, chiều cao và mục tiêu vóc dáng (giảm mỡ, tăng cơ, ăn heathy).

---

## 3. Giá trị cốt lõi (Core Value & The Hook)
Ứng dụng **không phải trò chơi may rủi (Wheel of Fortune thuần túy)**. Vòng quay chỉ là yếu tố gamification tạo cảm giác bất ngờ và giảm áp lực chọn lựa. Giá trị cốt lõi nằm ở:
1. **Logic Engine thông minh:** Lọc theo khung giờ (Sáng/Trưa/Tối), loại bỏ dị ứng 100%, chống ngán theo lịch sử, và **gợi ý theo chỉ số cơ thể (BMI/TDEE)**.
2. **Điểm ăn tiền (The Hook - Lý do chọn món):** Hiển thị câu giải thích tường minh lý do món ăn được chọn.
   - *Ví dụ 1:* "🍲 Bún cá — Vì 4 bữa gần nhất bạn toàn ăn thịt đỏ, và chỉ số BMI của bạn cần bổ sung đạm lành mạnh ít béo."
   - *Ví dụ 2:* "🥗 Salad gà sốt mè — Vì mục tiêu của bạn là Giảm mỡ và hôm nay bạn chưa nạp đủ chất xơ!"

---

## 4. Kiến trúc 2 Giao diện: Desktop Dashboard & Mobile PWA
Để mang lại trải nghiệm tối ưu trên mọi màn hình:
1. **Giao diện Điện thoại (Mobile PWA < 1024px):**
   - Thiết kế chuẩn Mobile App thao tác một tay với Bottom Navigation Bar hiệu ứng Glassmorphism.
   - Vòng quay Slot Machine trực quan, âm thanh haptic click vui tai, thao tác quay và chốt món nhanh gọn trong 5 giây.
2. **Giao diện Máy tính (Desktop Dashboard >= 1024px):**
   - Tận dụng toàn bộ không gian màn hình rộng (Container mở rộng 1200px - 1300px).
   - Sidebar cố định bên trái tích hợp Logo, Thẻ tóm tắt Profile (BMI, Mục tiêu, Calo khuyến nghị) và Menu chuyển trang.
   - Bố cục 2 cột (Dual-Column layout):
     - Cột chính: Vòng quay hoặc Bảng danh mục thực đơn dạng lưới (Grid 2-3 cột).
     - Cột phụ (Side Widget): Thống kê dinh dưỡng trực tiếp trong ngày, Lịch sử bữa ăn gần nhất, Cảnh báo thiếu rau/cá.

---

## 5. Đề xuất tính năng mới: Hồ sơ thể trạng (Body Profile & Health Goals)

### 5.1. Dữ liệu hồ sơ người dùng (User Body Profile)
Người dùng khai báo hoặc cập nhật nhanh không cần thủ tục rườm rà:
- **Tên / Biệt danh**
- **Giới tính** (Nam / Nữ)
- **Chiều cao (cm)** & **Cân nặng (kg)** -> Hệ thống tự động tính **BMI** và phân loại thể trạng:
  - *BMI < 18.5:* Thiếu cân
  - *18.5 ≤ BMI < 23:* Chuẩn cân đối (theo chuẩn người châu Á)
  - *23 ≤ BMI < 25:* Tiền thừa cân
  - *BMI ≥ 25:* Thừa cân / Béo phì
- **Mức độ vận động:** Ít vận động văn phòng / Vừa phải (thể thao 2-3 buổi/tuần) / Vận động nhiều.
- **Mục tiêu ăn uống (Diet Goal):**
  1. 🥗 **Giảm mỡ & Kiểm soát calo:** Ưu tiên món nhiều chất xơ, rau củ, ức gà, giảm tinh bột và dầu mỡ.
  2. 🥩 **Tăng cơ & Bổ sung protein:** Tăng điểm cho món giàu protein (thịt đỏ, cá hồi, trứng).
  3. 🧘 **Ăn lành mạnh & Cân bằng (Healthy Balanced):** Phân bổ đồng đều 5 nhóm chất, ngăn ngừa bệnh văn phòng.
  4. 🍃 **Thanh lọc / Ít tinh bột (Low Carb & Detox):** Tối ưu rau củ, súp, canh chua cá.

### 5.2. Tác động của Body Profile lên Logic Engine
Thuật toán chọn món `spin(foods, history, allergies, mealType, profile)` sẽ cộng điểm thông minh:
- Nếu mục tiêu là **Giảm mỡ**: Món nhóm `Rau củ` (+20 điểm), món `Thịt trắng` (+10 điểm), món `Tinh bột` hoặc chiên béo (-10 điểm).
- Nếu mục tiêu là **Tăng cơ**: Món giàu đạm `Thịt đỏ`, `Thịt trắng`, `Cá` (+15 điểm).
- Nếu chỉ số **BMI > 24**: Tự động nhắc nhở và ưu tiên đĩa salad hoặc canh rau thanh mát.

---

## 6. Phạm vi tính năng chi tiết (Scope)

### 6.1. Màn hình Quay số (Home)
- Chọn khung giờ (Sáng / Trưa / Tối).
- Hiển thị Widget mục tiêu sức khỏe & thể trạng của người dùng.
- Vòng quay Slot Machine đa hiệu ứng với âm thanh Web Audio và rung Haptic.
- Thẻ lý do AI phân tích theo cả Lịch sử ăn uống + Mục tiêu cơ thể.
- Nút "Chốt món này" (Bắn pháo hoa Confetti + Lưu lịch sử) & "Đổi món khác" (Hạ điểm ngầm).

### 6.2. Màn hình Sổ Món (Menu)
- Quản lý danh mục hơn 50 món ăn chuẩn vị Việt.
- Bộ lọc kết hợp: Bữa ăn (Sáng/Trưa/Tối), Nhóm chất dinh dưỡng (Thịt đỏ/trắng/cá/rau/tinh bột), Trạng thái bật/tắt.
- Tìm kiếm tức thì theo từ khóa tên món hoặc nguyên liệu.
- Modal Thêm / Chỉnh sửa món ăn linh hoạt (Chọn emoji, tên món, nhóm chất, gán dị ứng).

### 6.3. Màn hình Nhật Ký & Sức Khỏe (History & Health Insights)
- Thống kê tỷ lệ các nhóm chất trong 7 bữa gần nhất (Biểu đồ phân bổ màu sắc).
- Điểm cân bằng dinh dưỡng (Variety Score /100).
- Hệ thống cảnh báo tự động: Thiếu rau, thiếu cá, quá nhiều thịt đỏ.
- Quản lý danh sách Dị ứng & Kiêng cữ (lọc cứng 100%).
- Nhật ký chi tiết kèm khung giờ ăn và nút xóa từng bản ghi.

### 6.4. Màn hình / Modal Hồ sơ Thể trạng (Body Profile)
- Nhập chiều cao, cân nặng, giới tính, mục tiêu.
- Thẻ đo chỉ số BMI trực quan (vạch màu: Xanh lá = Chuẩn, Vàng = Thừa cân, Cam = Tiền béo phì).
- Lời khuyên dinh dưỡng tóm tắt riêng cho thể trạng của người dùng.

---

## 7. Kế hoạch điều chỉnh & Lộ trình thực hiện (Action Plan)

| Giai đoạn | Nội dung công việc | Kết quả đầu ra |
|---|---|---|
| **Phase 1** | Mở rộng Data Model & State | Lưu trữ `profile` (chiều cao, cân nặng, mục tiêu) trong LocalStorage, helper tính BMI & TDEE |
| **Phase 2** | Nâng cấp Logic Engine | Tích hợp mục tiêu vóc dáng & BMI vào công thức tính trọng số chọn món |
| **Phase 3** | Xây dựng Giao diện Đa Nền tảng (Desktop & Mobile) | Layout co giãn 2 phiên bản: Sidebar + Dual Column Dashboard trên Desktop (>= 1024px) và Bottom Nav trên Mobile (< 1024px) |
| **Phase 4** | Xây dựng Form Hồ Sơ Sức Khỏe (Profile Page/Modal) | Người dùng dễ dàng nhập/sửa chiều cao, cân nặng, xem phân loại BMI và chọn mục tiêu |
| **Phase 5** | Tích hợp & Kiểm thử toàn diện | Kiểm tra responsive trên cả 2 màn hình, test logic quay và build bundle kiểm định |
