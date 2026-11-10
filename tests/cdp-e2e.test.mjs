import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper tìm button theo text
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

    // 1. Truy cập màn hình Setup
    console.log('1️⃣ Truy cập trang chủ Setup...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });

    const title = await page.title();
    console.log(`Tiêu đề trang: ${title}`);
    if (!title.includes('Tiến Lên Tiếng Anh')) {
      throw new Error('Tiêu đề trang không đúng');
    }

    const setupShot = path.join(SCREENSHOT_DIR, '01-setup-screen.png');
    await page.screenshot({ path: setupShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${setupShot}`);

    // 2. Vào Phân Hệ Giáo Viên
    console.log('2️⃣ Mở Modal Giáo Viên...');
    await clickButtonWithText(page, 'Phân Hệ Giáo Viên');
    await new Promise(r => setTimeout(r, 600));

    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', '1234');
    await clickButtonWithText(page, 'Đăng Nhập');
    await new Promise(r => setTimeout(r, 800));

    console.log('✅ Đã đăng nhập vào Teacher Dashboard thành công!');
    const teacherShot = path.join(SCREENSHOT_DIR, '02-teacher-dashboard.png');
    await page.screenshot({ path: teacherShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${teacherShot}`);

    // Quay lại màn hình Setup
    await page.evaluate(() => {
      const backBtn = document.querySelector('button svg.lucide-arrow-left')?.closest('button');
      if (backBtn) backBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Khởi động Trận Đấu
    console.log('3️⃣ Nhấn nút [BẮT ĐẦU TRẬN ĐẤU]...');
    await clickButtonWithText(page, 'BẮT ĐẦU TRẬN ĐẤU');
    await new Promise(r => setTimeout(r, 1000));

    // 4. Modal Câu hỏi Tiếng Anh hiện lên
    console.log('4️⃣ Chờ Modal Câu Hỏi xuất hiện...');
    const questionShot = path.join(SCREENSHOT_DIR, '03-question-modal.png');
    await page.screenshot({ path: questionShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${questionShot}`);

    // 5. Giáo viên bấm "Hiện đáp án"
    console.log('5️⃣ Giáo viên bấm [Hiện đáp án]...');
    await clickButtonWithText(page, 'Hiện đáp án');
    await new Promise(r => setTimeout(r, 600));

    const answerShot = path.join(SCREENSHOT_DIR, '04-answer-revealed.png');
    await page.screenshot({ path: answerShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${answerShot}`);

    // 6. Giáo viên chấm ĐÚNG -> Mở modal chọn bài
    console.log('6️⃣ Giáo viên chấm [Đúng (Mở bài)]...');
    await clickButtonWithText(page, 'Đúng (Mở bài)');
    await new Promise(r => setTimeout(r, 800));

    // Bấm xem bài
    console.log('7️⃣ Bấm xem bài để chọn nước đánh...');
    await clickButtonWithText(page, 'Xem bài đội mình');
    await new Promise(r => setTimeout(r, 600));

    const playCardsShot = path.join(SCREENSHOT_DIR, '05-play-cards-revealed.png');
    await page.screenshot({ path: playCardsShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${playCardsShot}`);

    // Chọn 1 lá bài bất kỳ và đánh ra bàn
    const cards = await page.$$('.cursor-pointer.bg-white');
    console.log(`Tìm thấy ${cards.length} lá bài hiển thị trên tay`);
    if (cards.length > 0) {
      await cards[0].click(); // Chọn 1 lá
      await new Promise(r => setTimeout(r, 400));

      await clickButtonWithText(page, 'Đánh Bài Ra Bàn');
      console.log('✅ Đã đánh 1 lá bài ra bàn thành công!');
    }

    await new Promise(r => setTimeout(r, 1000));

    // Chụp ảnh Bàn chơi với bài đã đánh
    const gameTableShot = path.join(SCREENSHOT_DIR, '06-game-table.png');
    await page.screenshot({ path: gameTableShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${gameTableShot}`);

    await browser.close();
    console.log('🎉 TOÀN BỘ BÀI KIỂM THỬ CDP & CHỤP ẢNH MÀN HÌNH ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');

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
