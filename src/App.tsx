import React from 'react';
import { useGameStore } from './store/useGameStore';
import { SetupScreen } from './components/SetupScreen';
import { CasinoGameTable } from './components/CasinoGameTable';
import { QuestionModal } from './components/QuestionModal';
import { PlayCardsModal } from './components/PlayCardsModal';
import { TeacherDashboard } from './components/TeacherDashboard';

export const App: React.FC = () => {
  const {
    phase,
    isTeacherMode,
  } = useGameStore();

  // Nếu đang ở màn hình Quản lý Giáo viên
  if (isTeacherMode) {
    return <TeacherDashboard />;
  }

  // Nếu đang ở màn hình Thiết lập ban đầu
  if (phase === 'SETUP') {
    return <SetupScreen />;
  }

  // Màn hình Game sòng bài Casino Tiến Lên đang diễn ra
  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col">
      <main className="flex-1 flex flex-col">
        <CasinoGameTable />
        <QuestionModal />
        <PlayCardsModal />
      </main>
    </div>
  );
};

export default App;
