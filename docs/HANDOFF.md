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
- **Công nghệ cốt lõi**: React 19 / Vite 6 / TypeScript; Zustand; Tailwind CSS; Web Audio API; npm + `package-lock.json`, Node >=24.
- **Nguyên tắc bảo tồn dữ liệu**: Sửa trực tiếp kiến trúc hiện có, tái sử dụng component. Không xóa/reset database, tài khoản, tiến độ; không bịa từ/cách đọc/dịch; không tự thêm AI trả phí.
- **Tiêu chuẩn kiểm tra hoàn tất**: Luôn chạy Typecheck (`npm run typecheck`), Unit test suite (`npm test`) và Build (`npm run build`) đạt 100% không lỗi trước khi bàn giao.

---

## PHẦN II: NHẬT KÝ SỰ CỐ & BÀI HỌC KINH NGHIỆM (INCIDENT LOG & LESSONS LEARNED)
*Mục đích: Ghi lại chi tiết lỗi phát sinh, nguyên nhân gốc rễ (Root Cause), giải pháp đã thực hiện và bài học để tuyệt đối không tái phạm.*

### [LỖI 01 / 2026-11-10]: Puppeteer không tìm thấy Chromium mặc định trên Windows khi chạy CDP Test
- **Triệu chứng & Hiện tượng**: Lệnh `node tests/cdp-e2e.test.mjs` báo lỗi `Error: Could not find Chrome (ver. 133.0.6943.98)`.
- **Nguyên nhân gốc rễ (Root Cause)**: Môi trường Windows cài đặt Google Chrome tại `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe` thay vì đường dẫn chuẩn trong Program Files hoặc cache riêng của Puppeteer.
- **Số lần thử nghiệm sửa (Retry count)**: 1 lần.
- **Giải pháp xử lý (Resolution)**: Sử dụng đường dẫn thực tế `C:\Users\Hoang Vuong\AppData\Local\Google\Chrome\Application\chrome.exe` làm `executablePath` cho `puppeteer.launch()`.
- **Bài học & Biện pháp phòng tránh**: Với môi trường Windows của người dùng, luôn ưu tiên kiểm tra sự tồn tại của Chrome/Edge trong AppData trước khi chạy test CDP.

### [LỖI 02 / 2026-11-10]: Selector `button:has-text(...)` bị timeout trong Puppeteer
- **Triệu chứng & Hiện tượng**: Script CDP chờ selector `button:has-text("Phân Hệ Giáo Viên")` bị timeout sau 30 giây.
- **Nguyên nhân gốc rễ (Root Cause)**: `:has-text(...)` là pseudo-selector đặc thù của Playwright, trong khi Puppeteer chuẩn chỉ hỗ trợ CSS selector hoặc `::-p-text(...)`.
- **Số lần thử nghiệm sửa (Retry count)**: 1 lần.
- **Giải pháp xử lý (Resolution)**: Viết hàm helper `clickButtonWithText(page, text)` sử dụng `page.evaluate()` duyệt qua các button thật trên DOM để click chính xác và ổn định.
- **Bài học & Biện pháp phòng tránh**: Trong các test script Puppeteer thuần, luôn sử dụng `page.evaluate()` hoặc `::-p-text()` khi tìm phần tử theo nội dung văn bản.

---

## PHẦN III: NHẬT KÝ THAY ĐỔI & TRẠNG THÁI HIỆN TẠI (CHANGELOG & STATUS)

### [2026-11-11] Hoàn thành thiết kế lại toàn bộ giao diện (Redesign Template Casino Sòng Bài chuẩn 13 lá)
- **Nội dung thay đổi**:
  - Thiết kế lại toàn bộ template giao diện theo ảnh mẫu sòng bài Casino người dùng cung cấp:
    - Bàn oval nỉ xanh viền gỗ sang trọng với hiệu ứng ánh sáng gradient trung tâm.
    - Hiệu ứng mưa đồng xu vàng Casino lơ lửng xung quanh bàn (`GoldCoinRain.tsx`).
    - Dàn bài người chơi chính ở cạnh dưới hiển thị **đầy đủ 13 lá bài** xếp lớp đè nhau (`-space-x-10`), đồ họa quân bài chuẩn quốc tế với hình mặt người J, Q, K và chữ số đậm nét.
    - Bố trí 3 đối thủ xung quanh bàn (*Chelsea*, *Gabriel*, *Player787312*) với avatar tròn phát sáng viền vàng, xấp bài đứng hiển thị số lượng 13 lá bài úp, chip tiền vàng (K) và nút tròn "Bỏ lượt".
    - Khu vực bài đánh ra bàn ở trung tâm xòe góc nghệ thuật (giống tổ hợp K K K K trong ảnh mẫu).
  - Cập nhật chế độ chơi mặc định đủ 13 lá bài mỗi đội.
  - Sửa cấu hình `vite.config.ts` để Vitest chỉ quét các file `.test.ts` trong `src/`, tránh xung đột với script CDP.
  - Chạy kiểm thử tự động toàn diện qua CDP trên Chrome thật `tests/cdp-e2e.test.mjs`, chụp ảnh màn hình nghiệm thu thực tế `03-casino-table-13cards.png` và `04-casino-table-played.png`.
- **Kiểm tra đã chạy**:
  - `npm run typecheck`: 100% pass (`tsc --noEmit`).
  - `npm test`: 6/6 unit tests passed.
  - `npm run build`: Build production hoàn tất không lỗi.
  - `node tests/cdp-e2e.test.mjs`: Vượt qua toàn bộ bài test CDP trên Chrome thật.
- **Trạng thái**: Hoàn thành xuất sắc toàn bộ yêu cầu giao diện mới của người dùng. Tiến hành merge và push lên GitHub.
- **Nội dung thay đổi**:
  - Xây dựng hoàn chỉnh kiến trúc Vite 6 + React 19 + TypeScript + Tailwind CSS.
  - Xây dựng động cơ bài Tiến Lên Miền Nam `src/engine/tienLenEngine.ts` với đầy đủ luật chặn heo, đôi heo, 3 đôi thông, tứ quý, 4 đôi thông.
  - Viết bộ unit test toàn diện `tienLenEngine.test.ts` đạt 100% pass (6/6 tests).
  - Xây dựng giao diện:
    - `SetupScreen`: Chọn 2–4 đội, chế độ thi đấu Nhanh (8 lá) hoặc Chuẩn (13 lá), chọn đề thi, mã PIN giáo viên.
    - `TeacherDashboard`: Soạn đề, quản lý câu hỏi, nhập file Excel/CSV qua SheetJS, nhập nhanh qua Text Paste.
    - `QuestionModal`: Popup câu hỏi tiếng Anh phong cách Baamboozle, xem đáp án, giải thích ngữ pháp, giáo viên chấm điểm.
    - `PlayCardsModal`: Chế độ che/xem bài bảo mật, nhận diện tổ hợp bài chọn (Đơn, Đôi, Ba, Sảnh, Tứ quý,...), đánh bài ra bàn hoặc Bỏ lượt.
    - `GameTable`: Mặt bàn nỉ xanh Tiến Lên, hiển thị số lá bài úp của các đội, bài trên bàn, bảng xếp hạng chung cuộc có cúp và huân chương.
  - Hệ thống âm thanh Web Audio API (Ting ting, Buzzer, tiếng đánh bài, tiếng chặt hàng, chiến thắng) và pháo hoa Confetti.
  - Chạy kiểm thử tự động toàn diện qua Chrome DevTools Protocol (CDP) `tests/cdp-e2e.test.mjs` và chụp 6 ảnh màn hình nghiệm thu Desktop thực tế vào `docs/screenshots/`.
- **Kiểm tra đã chạy**:
  - `npm run typecheck`: 100% không lỗi (`tsc --noEmit`).
  - `npm test`: 6/6 tests passed.
  - `npm run build`: Hoàn tất tạo gói dist/ tối ưu hóa.
  - `node tests/cdp-e2e.test.mjs`: Vượt qua toàn bộ kịch bản kiểm thử E2E trên trình duyệt Chrome thật.
- **Trạng thái**: Hoàn thành xuất sắc toàn bộ yêu cầu của dự án. Sẵn sàng tích hợp vào nhánh chính `main` và push lên GitHub.
