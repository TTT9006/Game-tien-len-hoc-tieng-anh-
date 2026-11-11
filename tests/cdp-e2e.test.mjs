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

    const setupShot = path.join(SCREENSHOT_DIR, '01-casino-setup.png');
    await page.screenshot({ path: setupShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${setupShot}`);

    // Chọn Chế độ Chuẩn Casino 13 lá
    console.log('2️⃣ Chọn Chế độ Chuẩn Casino 13 Lá...');
    await clickButtonWithText(page, 'Chế độ Chuẩn Casino');
    await new Promise(r => setTimeout(r, 400));

    // Khởi động Trận Đấu
    console.log('3️⃣ Nhấn nút [BẮT ĐẦU TRẬN ĐẤU]...');
    await clickButtonWithText(page, 'BẮT ĐẦU TRẬN ĐẤU');
    await new Promise(r => setTimeout(r, 1000));

    // 4. Modal Câu hỏi Tiếng Anh hiện lên
    console.log('4️⃣ Chờ Modal Câu Hỏi xuất hiện...');
    const questionShot = path.join(SCREENSHOT_DIR, '02-casino-question-modal.png');
    await page.screenshot({ path: questionShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${questionShot}`);

    // 5. Giáo viên bấm "Hiện đáp án"
    console.log('5️⃣ Giáo viên bấm [Hiện đáp án]...');
    await clickButtonWithText(page, 'Hiện đáp án');
    await new Promise(r => setTimeout(r, 600));

    // 6. Giáo viên chấm ĐÚNG -> Mở quyền đánh bài trên bàn
    console.log('6️⃣ Giáo viên chấm [Đúng (Mở bài)]...');
    await clickButtonWithText(page, 'Đúng (Mở bài)');
    await new Promise(r => setTimeout(r, 800));

    // Chụp lại toàn cảnh Bàn Chơi Casino hình Oval xanh lá giống ảnh mẫu
    const casinoTableShot = path.join(SCREENSHOT_DIR, '03-casino-table-13cards.png');
    await page.screenshot({ path: casinoTableShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${casinoTableShot}`);

    // 7. Chọn bài trên tay và đánh ra bàn (để xuất hiện tổ hợp bài trung tâm giống ảnh mẫu K K K K)
    console.log('7️⃣ Chọn và đánh bài ra bàn...');
    const cards = await page.$$('.cursor-pointer.bg-gradient-to-b');
    console.log(`Tìm thấy ${cards.length} lá bài trên tay người chơi chính`);
    if (cards.length > 0) {
      await cards[0].click(); // Chọn lá bài đầu tiên
      await new Promise(r => setTimeout(r, 400));

      // Bấm nút Đánh Ra Bàn
      await clickButtonWithText(page, 'Đánh Ra Bàn');
      console.log('✅ Đã đánh bài ra giữa bàn!');
      await new Promise(r => setTimeout(r, 1000));
    }

    // Chụp ảnh bàn chơi với bài đã đánh ra giữa
    const playedShot = path.join(SCREENSHOT_DIR, '04-casino-table-played.png');
    await page.screenshot({ path: playedShot, fullPage: true });
    console.log(`📸 Đã lưu ảnh chụp: ${playedShot}`);

    await browser.close();
    console.log('🎉 TOÀN BỘ KIỂM THỬ CDP CASINO TABLE ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');

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
