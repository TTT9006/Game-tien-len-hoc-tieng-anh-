import React from 'react';
import { useGameStore } from './store/useGameStore';
import { SetupScreen } from './components/SetupScreen';
import { GameTable } from './components/GameTable';
import { QuestionModal } from './components/QuestionModal';
import { PlayCardsModal } from './components/PlayCardsModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Volume2, VolumeX, Shield, RotateCcw } from 'lucide-react';
import { soundService } from './services/soundService';

export const App: React.FC = () => {
  const {
    phase,
    isTeacherMode,
    setTeacherMode,
    resetGame,
  } = useGameStore();

  const [isMuted, setIsMuted] = React.useState<boolean>(soundService.getMuted());

  const toggleSound = () => {
    const next = !isMuted;
    soundService.setMuted(next);
    setIsMuted(next);
  };

  // Nếu đang ở màn hình Quản lý Giáo viên
  if (isTeacherMode) {
    return <TeacherDashboard />;
  }

  // Nếu đang ở màn hình Thiết lập ban đầu
  if (phase === 'SETUP') {
    return <SetupScreen />;
  }

  // Màn hình Game đang diễn ra
  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navigation Bar trong trận đấu */}
      <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center font-black text-slate-950 text-sm">
            ♠
          </div>
          <span className="font-black text-sm sm:text-base text-white tracking-wider">
            TIẾN LÊN TIẾNG ANH
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setTeacherMode(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Đề Thi</span>
          </button>

          <button
            onClick={resetGame}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs font-bold text-rose-300 hover:bg-rose-900/60 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thoát Trận</span>
          </button>
        </div>
      </header>

      {/* Sân đấu Tiến Lên */}
      <main className="flex-1 flex flex-col">
        <GameTable />
        <QuestionModal />
        <PlayCardsModal />
      </main>
    </div>
  );
};

export default App;
