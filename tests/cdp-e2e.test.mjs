import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function clickButtonWithText(page, text) {
  const result = await page.evaluate((btnText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(b => b.textContent && b.textContent.includes(btnText));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, text);

  if (!result) {
    throw new Error(`Không tìm thấy button chứa text: "${text}"`);
  }
}

async function runCdpE2ETest() {
  console.log('🚀 Khởi chạy Vite Preview Server...');
  const server = spawn('npm.cmd', ['run', 'preview', '--', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  });

  const serverPid = server.pid;
  console.log(`Server PID: ${serverPid}`);

  const cleanup = () => {
    console.log('🧹 Đang dọn dẹp tiến trình server con...');
    if (serverPid) {
      try {
        spawn('taskkill', ['/F', '/T', '/PID', String(serverPid)], { shell: true });
      } catch (e) {
        console.error('Lỗi khi taskkill:', e);
      }
    }
  };

  const timeoutGuard = setTimeout(() => {
    console.error('❌ Kiểm thử bị quá thời gian timeout (60s)');
    cleanup();
    process.exit(1);
  }, 60000);

  try {
    await new Promise(res => setTimeout(res, 2500));

    console.log('🌐 Kết nối Chrome qua Puppeteer / CDP...');
    const chromePath = 'C:\\Users\\Hoang Vuong\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Màn hình Setup
    console.log('1️⃣ Truy cập trang chủ Setup...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    // Khởi động Trận Đấu
    console.log('2️⃣ Nhấn nút [BẮT ĐẦU TRẬN ĐẤU]...');
    await clickButtonWithText(page, 'BẮT ĐẦU TRẬN ĐẤU');

    // Chụp lại màn hình hiệu ứng Xáo bài
    await new Promise(r => setTimeout(r, 400));
    const shuffleShot = path.join(SCREENSHOT_DIR, '07-shuffle-animation.png');
    await page.screenshot({ path: shuffleShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp Xáo Bài: ${shuffleShot}`);

    // Chờ hết hiệu ứng xáo bài và câu hỏi xuất hiện
    await new Promise(r => setTimeout(r, 1200));

    // 3. Modal Câu hỏi Tiếng Anh hiện lên
    console.log('3️⃣ Kiểm tra Modal Câu Hỏi và Nút [Xem bài trước]...');
    const questionShot = path.join(SCREENSHOT_DIR, '08-question-with-peek-button.png');
    await page.screenshot({ path: questionShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${questionShot}`);

    // 4. Bấm nút "Xem bài trước" để ẩn câu hỏi
    console.log('4️⃣ Bấm nút [Xem bài trước] để ẩn câu hỏi xem mặt bàn...');
    await clickButtonWithText(page, 'Xem bài trước');
    await new Promise(r => setTimeout(r, 600));

    const peekShot = path.join(SCREENSHOT_DIR, '09-question-minimized-peek-table.png');
    await page.screenshot({ path: peekShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp bàn bài khi đang ẩn câu hỏi: ${peekShot}`);

    // 5. Bấm nút "Hiện lại câu hỏi"
    console.log('5️⃣ Bấm nút [Hiện lại câu hỏi]...');
    await clickButtonWithText(page, 'Hiện lại câu hỏi');
    await new Promise(r => setTimeout(r, 600));

    // 6. Giáo viên bấm "Hiện đáp án" và chấm Đúng
    console.log('6️⃣ Giáo viên bấm [Hiện đáp án] và chấm Đúng...');
    await clickButtonWithText(page, 'Hiện đáp án');
    await new Promise(r => setTimeout(r, 500));
    await clickButtonWithText(page, 'Đúng (Mở bài)');
    await new Promise(r => setTimeout(r, 800));

    // 7. Chọn bài và bấm Đánh Ra Bàn để kích hoạt hiệu ứng đánh bài
    console.log('7️⃣ Đánh bài để kích hoạt hiệu ứng bay ra bàn...');
    const cards = await page.$$('.cursor-pointer.bg-gradient-to-b');
    if (cards.length > 0) {
      await cards[0].click();
      await new Promise(r => setTimeout(r, 400));
      await clickButtonWithText(page, 'Đánh Ra Bàn');
      await new Promise(r => setTimeout(r, 600));
    }

    const cardPlayedShot = path.join(SCREENSHOT_DIR, '10-card-played-animated.png');
    await page.screenshot({ path: cardPlayedShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp Hiệu ứng Đánh bài: ${cardPlayedShot}`);

    await browser.close();
    console.log('🎉 TOÀN BỘ KIỂM THỬ CDP CHO HIỆU ỨNG XÁO BÀI, ĐÁNH BÀI & NÚT ẨN CÂU HỎI ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');

    clearTimeout(timeoutGuard);
    cleanup();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm thử CDP:', error);
    clearTimeout(timeoutGuard);
    cleanup();
    process.exit(1);
  }
}

runCdpE2ETest();
