import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Play, Users, Clock, BookOpen, Volume2, VolumeX, Shield, Lock } from 'lucide-react';
import { GameMode } from '../types/game';
import { soundService } from '../services/soundService';

export const SetupScreen: React.FC = () => {
  const {
    questionPacks,
    selectedPackId,
    selectQuestionPack,
    startGame,
    setTeacherMode,
    verifyTeacherPin,
  } = useGameStore();

  const [numTeams, setNumTeams] = useState<number>(4);
  const [mode, setMode] = useState<GameMode>('classroom');
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());
  const [pinInput, setPinInput] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !isMuted;
    soundService.setMuted(next);
    setIsMuted(next);
  };

  const handleEnterTeacherMode = () => {
    if (verifyTeacherPin(pinInput)) {
      setPinError(false);
      setShowPinModal(false);
      setPinInput('');
      setTeacherMode(true);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center font-black text-slate-950 text-base shadow">
            ♠
          </div>
          <span className="font-black text-lg text-white tracking-wide">
            TIẾN LÊN TIẾNG ANH
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSound}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          <button
            onClick={() => setShowPinModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Phân Hệ Giáo Viên</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md my-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20">
            Classroom Interactive Edition
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-3 tracking-tight">
            Thiết Lập Trận Đấu
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Mô hình trò chơi Baamboozle kết hợp luật bài Tiến Lên Miền Nam dành cho lớp học
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Chọn Số Lượng Đội */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Số lượng đội tham gia (2 – 4 Đội)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setNumTeams(num)}
                  className={`py-3 rounded-2xl font-black text-base border transition-all cursor-pointer ${
                    numTeams === num
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-102'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Đội
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chọn Chế Độ Chơi (13 lá đầy đủ chuẩn sòng bài) */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Chế độ chơi (Đủ 13 lá sòng bài Casino)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setMode('standard')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  mode === 'standard'
                    ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-amber-400">🎴 Chế độ Chuẩn Casino (13 Lá)</span>
                  <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
                    Chuẩn ảnh mẫu
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đủ 13 lá/đội (52 lá bài), dàn bài xòe rộng phong cách VIP.
                </p>
              </button>

              <button
                onClick={() => setMode('classroom')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  mode === 'classroom'
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-indigo-400">⚡ Chế độ Nhanh Lớp Học (8 Lá)</span>
                  <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                    10 Phút
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  8 lá/đội, kết thúc ván bài nhanh gọn trong tiết học.
                </p>
              </button>
            </div>
          </div>

          {/* 3. Chọn Bộ Đề Câu Hỏi Tiếng Anh */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Bộ đề câu hỏi tiếng Anh</span>
            </label>
            <select
              value={selectedPackId}
              onChange={(e) => selectQuestionPack(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {questionPacks.map(pack => (
                <option key={pack.id} value={pack.id}>
                  {pack.title} ({pack.questions.length} câu)
                </option>
              ))}
            </select>
          </div>

          {/* Nút Khởi Động */}
          <button
            onClick={() => startGame(numTeams, mode, selectedPackId)}
            className="w-full py-4 mt-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center space-x-3 transition-transform active:scale-98 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>BẮT ĐẦU TRẬN ĐẤU</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-600 py-2">
        Tiến Lên Tiếng Anh Classroom Edition • Trả lời đúng nhận quyền đánh bài
      </div>

      {/* Modal Nhập PIN Giáo viên */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Xác Thực Giáo Viên</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Nhập mã PIN để truy cập màn hình soạn đề (Mặc định: <code className="text-amber-400">1234</code>)
            </p>

            <input
              type="password"
              placeholder="Nhập mã PIN..."
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className={`w-full p-3 bg-slate-950 border rounded-xl text-center text-xl font-bold tracking-widest text-white focus:outline-none ${
                pinError ? 'border-rose-500 animate-shake' : 'border-slate-700 focus:border-indigo-500'
              }`}
            />
            {pinError && (
              <span className="text-[11px] text-rose-400 font-semibold block mt-1.5 text-center">
                Mã PIN không đúng, vui lòng thử lại!
              </span>
            )}

            <div className="mt-5 flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinError(false);
                  setPinInput('');
                }}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleEnterTeacherMode}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Đăng Nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
