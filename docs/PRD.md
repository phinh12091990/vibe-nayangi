# Tài liệu PRD: Nay Ăn Gì

## 1. Tổng quan sản phẩm
- **Tên sản phẩm:** Nay Ăn Gì
- **Nhánh dự thi:** Nhánh B — Giải bài toán của chính mình.
- **Nhóm chủ đề:** Cá nhân / Đời sống.
- **Bài toán:** Dân văn phòng đối mặt với câu hỏi "ăn gì" 2–3 lần/ngày (15–20 lần/tuần). Việc chọn món thường mất 5–15 phút lướt app giao đồ ăn vô định, dẫn đến hệ quả: lặp món đến phát ngán và lệch nhóm chất dinh dưỡng mà không ai để ý.

## 2. Chân dung người dùng (User Persona)
- **Đối tượng chính:** Dân văn phòng, người bận rộn thường xuyên mua đồ ăn ngoài hoặc đặt qua ứng dụng (ShopeeFood, GrabFood, BeFood, v.v.). Sử dụng cho nhu cầu cá nhân.
- **Tần suất gặp vấn đề:** 2-3 lần/ngày.
- **Hành vi hiện tại:** Mất trung bình 10-15 phút để lướt app tìm món mới, hoặc hỏi vòng quanh đồng nghiệp rồi nhận lại câu trả lời "gì cũng được". Kết cục phổ biến nhất là... lặp lại món đã ăn ngày hôm qua.

## 3. Giá trị cốt lõi (Core Value)
Sản phẩm **không phải là một ứng dụng quay số ngẫu nhiên đơn thuần**. Vòng quay chỉ là yếu tố bề nổi để tạo cảm giác bất ngờ, thú vị. Bên dưới nó là một **Bộ luật chọn món (Logic Engine)** đóng vai trò như một trợ lý.

**Điểm "ăn tiền" (Hook):** Sau khi quay ra kết quả, app hiển thị luôn **LÝ DO** vì sao chọn món đó.
*Ví dụ: "🍲 Bún cá — vì 4 bữa gần nhất bạn toàn ăn thịt đỏ, và bạn chưa ăn cá 9 ngày rồi."*
Chỉ với một dòng lý do này, sản phẩm chuyển mình từ "trò chơi random" sang một "trợ lý chăm sóc bữa ăn".

## 4. Phạm vi tính năng (Scope) - MVP 3 Màn hình
Để đảm bảo tiến độ và tính khả thi, ứng dụng gói gọn trong 3 màn hình:

### 4.1. Màn hình Quay (Home)
- Chọn khung giờ bữa ăn: Sáng / Trưa / Tối.
- Hành động: Bấm **QUAY**.
- Hiển thị: Kết quả món ăn + **Câu giải thích lý do**.
- Tương tác: 
  - Nút **"Chốt món này"**: Lưu món vào nhật ký và kết thúc flow.
  - Nút **"Đổi món khác"**: Món vừa ra sẽ bị hạ điểm yêu thích ngầm và app quay lại món khác.

### 4.2. Màn hình Sổ Món (Menu)
- Quản lý danh sách món: Thêm mới, sửa, ẩn món khỏi vòng quay.
- Dữ liệu một món bao gồm: 
  - Tên món.
  - Mức giá (Bình dân/Khá/Cao) hoặc Tag ưu tiên mua ngoài.
  - Buổi ăn phù hợp (Sáng, Trưa, Tối).
  - Nhóm chất chính (Thịt đỏ, Thịt trắng, Cá, Rau, Tinh bột...).
  - Dị ứng/Nguyên liệu đặc thù (Tôm, đậu phộng, bò...).
- **Seed Data:** Ứng dụng tích hợp sẵn 60–80 món Việt phổ biến (tập trung vào món hay đặt app) để người dùng có thể "quay" được ngay lần đầu mở app, phá bỏ rào cản phải nhập liệu ban đầu.

### 4.3. Màn hình Nhật Ký (History & Insights)
- Hiển thị danh sách các món đã ăn trong những ngày gần đây.
- Cảnh báo/Nhắc nhở nhẹ nhàng dựa trên dữ liệu. *Ví dụ: "Báo động: Tuần này bạn chưa ăn bữa nào có rau!"*
- Cài đặt cá nhân: Người dùng đánh dấu các nguyên liệu mình bị dị ứng (App chỉ lọc cứng theo khai báo này, không cam kết y tế/dinh dưỡng tuyệt đối).

## 5. Luật chọn món (Logic Engine)
Thuật toán quay không dùng random 100%, mà dựa trên **điểm số (Weighted Random)** sau khi qua các màng lọc:

1. **Lọc cứng (Hard Filters):**
   - Loại bỏ món có chứa nguyên liệu người dùng đã báo dị ứng.
   - Loại bỏ món không hợp buổi (VD: Lẩu không ăn sáng).
2. **Chống ngán (Fatigue Penalty):**
   - Món vừa ăn hôm qua -> Gần như không xuất hiện lại.
   - Món ăn 3 ngày trước -> Điểm tỷ lệ ra thấp.
   - Món 2 tuần chưa ăn -> Điểm tỷ lệ ra rất cao.
3. **Cân bằng chất (Nutritional Boost):**
   - Nhìn lại 5-7 bữa gần nhất. Nếu phát hiện thiếu nhóm rau/cá, hệ thống tự động đẩy điểm cho các món chứa rau/cá lên cao.
4. **Học khẩu vị (Feedback Loop):**
   - Mỗi khi người dùng bấm "Đổi món khác", món đó sẽ bị hạ điểm ngầm, giúp app dần dần hiểu và ít gợi ý lại những món người dùng không thích.

## 6. Kỹ thuật, Dữ liệu & Tech Stack
- **Kiến trúc (Tech Stack):** Ứng dụng sẽ được phát triển theo hướng Web App / PWA (Progressive Web App). Điều này giúp sản phẩm chạy mượt trên mọi thiết bị di động chỉ qua một đường link (có thể Add to Home Screen), loại bỏ rào cản cài đặt app rườm rà.
- **Lưu trữ (Storage):** Sử dụng LocalStorage hoặc IndexedDB. Toàn bộ dữ liệu (Món ăn, Nhật ký) nằm tại local. KHÔNG cần Backend/Server, KHÔNG cần chức năng Đăng nhập/Đăng ký.
- **Lợi ích:** 
  - Về mặt User: Đảm bảo quyền riêng tư 100%, thao tác cực nhanh (zero-latency).
  - Về mặt Hackathon: Tối ưu khối lượng công việc, đảm bảo rủi ro kỹ thuật ở mức thấp nhất để có thể hoàn thiện một sản phẩm trọn vẹn.

## 7. Định hướng Trải nghiệm & Tương lai (Vibe & Future Scope)
Để tạo điểm nhấn cho cuộc thi và chứng minh tiềm năng phát triển, sản phẩm có thêm các định hướng sau:

1. **Luật chọn món theo Thời tiết (Weather-based Logic):**
   - Gọi API thời tiết cơ bản khi mở app.
   - Nếu trời mưa/lạnh: Tự động cộng điểm cho món nước (Lẩu, Bún bò, Phở).
   - *Lý do xuất ra:* "🍲 Bún bò chả cua — vì ngoài trời đang mưa 24°C, và 4 bữa rồi bạn chưa ăn món nước nào."
2. **Giao diện & Micro-copy hài hước (Tạo Vibe):**
   - Khi đang quay, thay vì chỉ hiện "Đang xử lý...", app hiển thị các câu text hài hước: *"Đang phân tích khẩu vị nghiệp quật...", "Đang né mấy món hôm qua bạn chê...", "Đang thỉnh ý kiến vũ trụ..."*.
   - Kết hợp rung điện thoại (Haptic feedback) và âm thanh để tạo cảm giác hồi hộp.
3. **Khả năng kiếm tiền (Monetization):**
   - Tính năng tương lai: Nút "Chốt món này" có thể gắn link Affiliate chuyển hướng sang ShopeeFood / GrabFood. Khi user đặt món thành công, ứng dụng nhận được hoa hồng. Điều này chứng minh ứng dụng có khả năng tự nuôi sống (Sustainable Business Model).
4. **Lan truyền mạng xã hội (Social Share - Viral):**
   - Nút "Khoe kết quả" để xuất ra một bức ảnh Card vuông vức, đẹp mắt dùng để chia sẻ lên Story Facebook/Instagram.
   - *Thông điệp chia sẻ:* "Vũ trụ ép tôi ăn Bún Cá vì cả tuần nay tôi chưa có cọng rau nào vào bụng. (Via app Nay Ăn Gì)".
