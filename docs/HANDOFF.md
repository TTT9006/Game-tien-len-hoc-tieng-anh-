# 📋 TÀI LIỆU BÀN GIAO & QUY TẮC PHÁT TRIỂN DỰ ÁN (HANDOFF & DEVELOPMENT PROTOCOLS)

> **Dự án**: Tiến Lên Tiếng Anh (Classroom Baamboozle Edition)  
> **Cập nhật lần cuối**: 2026-11-10  
> **Vị trí tài liệu**: `docs/HANDOFF.md`

---

## PHẦN I: BỘ QUY TẮC PHÁT TRIỂN & KIỂM THỬ TÍNH NĂNG (BẮT BUỘC TUÂN THỦ)

### 1. Quy tắc Cách ly Môi trường & Quy trình Git (Bảo vệ dữ liệu & Chống xung đột)
- **Tạo nhánh / Môi trường độc lập (Isolated Worktree/Branch)**:
  - Khi có yêu cầu cập nhật hoặc thêm tính năng mới, **BẮT BUỘC** phải tạo một nhánh / worktree môi trường độc lập (hoặc sandbox tách biệt) để triển khai, chạy thử và kiểm thử toàn diện tính năng đó.
  - Chỉ khi tính năng đã hoàn thiện trọn vẹn và vượt qua kiểm thử trong môi trường độc lập mới được phép đồng bộ (merge/integrate) vào mã nguồn chính của trang web.
  - *Mục đích tối thượng*: Tuyệt đối tránh gây xung đột, lỗi lan sang các phân hệ khác hoặc làm mất dữ liệu người dùng.
- **Cập nhật tài liệu bàn giao trước khi commit**:
  - Mỗi lần sửa mã, giao diện, dữ liệu hoặc cấu hình đều phải cập nhật `docs/HANDOFF.md` trước khi commit. Ghi rõ thay đổi, kiểm tra đã chạy, kết quả và phần còn hạn chế/chưa hoàn tất; bổ sung lưu ý migration hoặc vận hành nếu có. Đưa cập nhật handoff vào cùng commit với thay đổi tương ứng.
- **Tự động Commit & Push**:
  - Tự động tạo commit sau khi hoàn thành một thay đổi và chạy các kiểm tra phù hợp, không cần hỏi lại.
  - Mỗi khi hoàn thiện và kiểm thử tính năng xong, tự động push lên Git (`origin/main` hoặc nhánh quy định) mà không cần hỏi lại.
  - Chỉ commit các thay đổi thuộc công việc đã hoàn thành; không đưa database, mật khẩu, file `.env`, backup hay dữ liệu riêng vào Git.

---

### 2. Quy định Dữ liệu Kiểm thử Thực tế (Production-like Data — BẮT BUỘC DÙNG DỮ LIỆU THẬT)
- Trong quá trình kiểm thử, **ĐƯỢC PHÉP VÀ BẮT BUỘC** sử dụng dữ liệu thật (đề thi thật, file âm thanh thật, cấu trúc từ điển thật, các bản ghi database thực tế của hệ thống).
- **TUYỆT ĐỐI KHÔNG DÙNG DỮ LIỆU GIẢ (MOCK/FAKE DATA QUÁ ĐƠN GIẢN HOẶC LÝ TƯỞNG HÓA)**: Tránh trường hợp kiểm thử tự động với dữ liệu giả thì vượt qua (pass), nhưng khi đưa vào vận hành thực tế hoặc deploy lên production thì gặp sự cố (như lỗi trích xuất ký tự đặc biệt, lỗi audio 404, lỗi chuỗi dài, v.v.).

---

### 3. Quy tắc Kiểm thử 3 lần & Tạm dừng khi gặp lỗi sau đồng bộ (Retry 3 Times & Pivot)
- Sau khi đồng bộ vào trang web, nếu quá trình kiểm thử phát hiện lỗi: Cho phép kiểm tra, rà soát và thử khắc phục **tối đa 3 lần**.
- Nếu sau 3 lần sửa đổi và kiểm thử mà lỗi vẫn chưa được giải quyết triệt để: **DỪNG NGAY VIỆC KIỂM THỬ LẶP LẠI**, ghi chép chi tiết nguyên nhân, hiện tượng lỗi vào nhật ký/handoff và chuyển hướng tiếp cận khác.
- **BẮT BUỘC**: Phải tham vấn và hỏi ý kiến người dùng về hướng tiếp cận mới trước khi bắt tay vào triển khai hướng mới đó.

---

### 4. Quy định Kiểm thử Thực tế qua Chrome DevTools Protocol (CDP) & Bắt buộc Chụp ảnh Màn hình
- Mỗi lần cập nhật xong một tính năng hoặc thay đổi giao diện, bắt buộc phải khởi chạy trình duyệt thật qua **Chrome DevTools Protocol (CDP)** để trực tiếp thử nghiệm và tương tác toàn diện tính năng đó (thao tác click, nhập liệu, gửi yêu cầu, chuyển trạng thái).
- **BẮT BUỘC chụp ảnh màn hình (screenshot)** kết quả kiểm thử thực tế trên Desktop, lưu lại và hiển thị trực tiếp trong artifact / báo cáo để người dùng kiểm tra trực quan. (Yêu cầu chụp màn hình và kiểm thử trên mobile đã được loại bỏ).
- Nếu xuất hiện bất kỳ lỗi nào (lỗi giao diện, lỗi logic, lỗi API, lỗi console) thì phải khắc phục và sửa ngay lập tức, sau đó tiếp tục thử nghiệm lại qua CDP. Lặp lại chu trình kiểm thử - sửa lỗi này cho tới khi tính năng hoạt động hoàn thiện, mượt mà và không còn lỗi nào thì mới được kết thúc công việc.

---

### 5. Quy tắc Nghiêm ngặt: Tuyệt đối Bảo toàn Dữ liệu Hiển thị & Cấm filter làm biến mất Dữ liệu Người dùng (Zero Data Loss by UI Filtering)
- **Tuyệt đối không dùng bộ lọc loại trừ triệt để (Destructive Filtering)** khi bổ sung tính năng mới: Khi thêm cờ phân loại mới (như `isPracticeExam`, `isOfficial`, `category`, v.v.), tầng hiển thị frontend PHẢI có fallback an toàn. Nếu trường đó là `undefined`, mặc định dữ liệu vẫn phải được hiển thị (gán nhãn mặc định hoặc phân nhóm phụ) chứ **TUYỆT ĐỐI KHÔNG ĐƯỢC** `.filter(x => x.newField)` làm mất sạch dữ liệu hiện có của người dùng.
- **Tách tính năng mới không bao giờ được làm trống rỗng tính năng cũ**: Khi tách một phân hệ thành trang riêng, trang gốc phải giữ nguyên vẹn toàn bộ dữ liệu đã có, không được lọc bỏ làm rỗng giao diện.
- **CDP Test bắt buộc phải assert số lượng bản ghi hiển thị**: Trong mọi bài kiểm thử trình duyệt CDP, bắt buộc phải có câu lệnh assert số lượng phần tử lớn hơn 0 trên tất cả các tab (`expect(count).toBeGreaterThan(0)`). Bất kỳ màn hình nào hiển thị "0 bản ghi" bất thường khi hệ thống đã có dữ liệu đều bị tính là lỗi nghiêm trọng (Critical Bug) và không được phép kết thúc phiên làm việc.

---

### 6. Quy tắc Chống Treo Task khi Thực thi Tiến trình Kiểm thử & Server Chạy Ngầm (Anti-Hanging Background Tasks)
- **Tuyệt đối không quét `*.*` trên toàn repo**: Lệnh tìm kiếm chuỗi không quét đệ quy `*.*` không giới hạn đường dẫn nhằm tránh quét vào toàn bộ thư mục `node_modules` và thư mục build khổng lồ làm treo luồng I/O.
- **Luôn đóng triệt để mọi tiến trình con (Process Tree Kill)**: Trong khối `finally {}` của mọi script kiểm thử tự động, bắt buộc phải kill dứt điểm tiến trình server và cây tiến trình con (sử dụng lệnh `taskkill /F /T /PID <pid>` trên Windows hoặc `tree-kill`).
- **Đảm bảo thoát tiến trình rõ ràng (Explicit Exit)**: Sau khi hoàn thành kiểm thử và dọn dẹp xong tài nguyên, luôn gọi `process.exit(0)` (hoặc `process.exit(1)` nếu lỗi), không để script đợi event loop treo lơ lửng.
- **Đặt thời gian chờ (Timeout Guardrail)**: Mọi script kiểm thử trình duyệt CDP bắt buộc phải có timeout tổng thể (ví dụ: `setTimeout(() => { process.exit(1); }, 60000)`). Tuyệt đối không để một task chạy vô tận quá 60–90 giây mà không phản hồi.
- **Chủ động kiểm tra tiến trình khi nghi ngờ treo**: Nếu một lệnh chạy ngầm không hoàn tất trong khoảng thời gian dự kiến, trợ lý phải chủ động kiểm tra log tệp `.log` và trạng thái cổng mạng/PID, không ngồi đợi thụ động làm gián đoạn tương tác của người dùng.

---

### 7. Dự án và Quy chuẩn Thiết kế / Kỹ thuật
- **Phong cách giao diện**: Giao diện gọn gàng, tinh tế, không gradient/thiết kế kiểu AI rẻ tiền, hoạt động tốt trên desktop và dark mode.
- **Công nghệ cốt lõi**: React 19 / Vite 7 / TypeScript; Express 5; Prisma 6.19 / SQLite; React Query / Zustand; npm + `package-lock.json`, Node >=24. Không dùng `node_modules-pnpm-backup`.
- **Nguyên tắc bảo tồn dữ liệu**: Sửa trực tiếp kiến trúc hiện có, tái sử dụng component. Không xóa/reset database, tài khoản, tiến độ; không bịa từ/cách đọc/dịch; không tự thêm AI trả phí.
- **Tiêu chuẩn kiểm tra hoàn tất**: Luôn chạy Typecheck (`npx tsc --noEmit`), Unit test suite (`npm test`) và Build (`npm run build`) đạt 100% không lỗi trước khi bàn giao.

---

## PHẦN II: NHẬT KÝ SỰ CỐ & BÀI HỌC KINH NGHIỆM (INCIDENT LOG & LESSONS LEARNED)
*Mục đích: Ghi lại chi tiết lỗi phát sinh, nguyên nhân gốc rễ (Root Cause), giải pháp đã thực hiện và bài học để tuyệt đối không tái phạm.*

### Mẫu ghi nhận lỗi khi phát sinh và sửa xong:
```markdown
### [MÃ LỖI / NGÀY THÁNG]: <Tên sự cố ngắn gọn>
- **Triệu chứng & Hiện tượng**: Mô tả chi tiết hành vi lỗi xuất hiện ở đâu, lúc nào, màn hình nào.
- **Nguyên nhân gốc rễ (Root Cause)**: Lý do kỹ thuật chính xác gây ra lỗi.
- **Số lần thử nghiệm sửa (Retry count)**: (Tối đa 3 lần theo quy tắc)
- **Giải pháp xử lý (Resolution)**: Cách đã fix triệt để.
- **Bài học & Biện pháp phòng tránh (Actionable Prevention)**: Quy tắc kiểm tra/coding pattern cần tuân thủ trong tương lai để không lặp lại lỗi này.
```

*(Các lỗi và bài học sẽ được cập nhật liên tục tại đây sau mỗi phiên làm việc).*

---

## PHẦN III: NHẬT KÝ THAY ĐỔI & TRẠNG THÁI HIỆN TẠI (CHANGELOG & STATUS)

### [2026-11-10] Khởi tạo tài liệu quy tắc và Git repository
- **Nội dung thay đổi**:
  - Khởi tạo Git repository cho thư mục dự án `d:\game tieng anh`.
  - Thiết lập tài liệu `docs/HANDOFF.md` ghi nhận toàn bộ 7 quy tắc cốt lõi, cơ chế ghi nhận lỗi - giải pháp - phòng ngừa, và quy trình bàn giao.
  - Tạo cấu hình `.gitignore` chuẩn cho Node.js/TypeScript/SQLite để bảo vệ tệp môi trường và cơ sở dữ liệu.
- **Kiểm tra đã chạy**:
  - Kiểm tra trạng thái Git repo và cấu trúc thư mục.
- **Trạng thái**: Sẵn sàng bắt đầu triển khai các module tính năng theo quy trình cách ly nhánh.
