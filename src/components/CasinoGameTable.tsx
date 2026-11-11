import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import { Card as CardType } from '../types/game';
import { Trophy, Award, RotateCcw, Volume2, VolumeX, Shield, Play, SkipForward, Eye, EyeOff } from 'lucide-react';
import { evaluateCombination } from '../engine/tienLenEngine';
import { soundService } from '../services/soundService';

export const CasinoGameTable: React.FC = () => {
  const {
    teams,
    currentTeamIndex,
    tableCards,
    phase,
    rankings,
    resetGame,
    setTeacherMode,
    playSelectedCards,
    passTurn,
  } = useGameStore();

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isHandRevealed, setIsHandRevealed] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  const toggleSound = () => {
    const next = !isMuted;
    soundService.setMuted(next);
    setIsMuted(next);
  };

  const currentTeam = teams[currentTeamIndex];

  // Các vị trí người chơi theo phong cách bàn Casino:
  // - Vị trí 0 (Dưới cùng - Chính giữa): Đội người chơi chính (Player / Đội đang mở bài)
  // - Vị trí 1 (Bên trái): Chelsea
  // - Vị trí 2 (Phía trên cùng): Gabriel
  // - Vị trí 3 (Bên phải): Player787312
  const mainTeam = teams[0] || teams[currentTeamIndex];
  const leftTeam = teams[1];
  const topTeam = teams[2];
  const rightTeam = teams[3];

  const toggleSelectCard = (card: CardType) => {
    setErrorMessage(null);
    if (selectedCardIds.includes(card.id)) {
      setSelectedCardIds(selectedCardIds.filter(id => id !== card.id));
    } else {
      setSelectedCardIds([...selectedCardIds, card.id]);
    }
  };

  const selectedCards = (currentTeam?.cards || []).filter(c => selectedCardIds.includes(c.id));
  const previewCombo = evaluateCombination(selectedCards);

  const handlePlayCards = () => {
    if (selectedCards.length === 0) {
      setErrorMessage('Vui lòng chọn lá bài hợp lệ!');
      return;
    }

    const res = playSelectedCards(selectedCards);
    if (!res.success) {
      setErrorMessage(res.message || 'Nước đi không hợp lệ!');
    } else {
      setSelectedCardIds([]);
      setErrorMessage(null);
    }
  };

  const handlePass = () => {
    setSelectedCardIds([]);
    setErrorMessage(null);
    passTurn();
  };

  // Component phụ trợ hiển thị từng đối thủ (Avatar tròn + Xấp bài đứng + Nút Bỏ Lượt)
  const renderOpponent = (team: typeof leftTeam, position: 'left' | 'top' | 'right') => {
    if (!team) return null;
    const isCurrent = currentTeam?.id === team.id;
    const isWinner = team.cards.length === 0;

    return (
      <div className={`flex flex-col items-center z-20 ${
        position === 'left' ? 'absolute left-8 top-1/2 -translate-y-1/2' :
        position === 'top' ? 'absolute top-6 left-1/2 -translate-x-1/2' :
        'absolute right-8 top-1/2 -translate-y-1/2'
      }`}>
        {/* Nút hoặc Trạng thái Bỏ Lượt tròn kiểu Casino */}
        <div className="flex items-center space-x-3 mb-2">
          {team.hasPassedTurn && (
            <div className="w-16 h-16 rounded-full bg-slate-900/80 border-2 border-slate-400/60 shadow-xl flex flex-col items-center justify-center backdrop-blur-sm text-slate-200">
              <span className="text-xs font-black leading-tight text-center">Bỏ<br/>lượt</span>
            </div>
          )}

          {/* Xấp bài úp đứng (Thẻ bài xếp dọc hoặc ngang) với số lượng bài 13 lá */}
          <div className="relative flex items-center justify-center p-1.5 bg-sky-950/40 border-2 border-sky-400/50 rounded-xl shadow-lg backdrop-blur-sm">
            {position === 'top' ? (
              // Xếp ngang phía trên
              <div className="flex -space-x-4 px-1 py-0.5">
                {Array.from({ length: Math.min(team.cards.length, 12) }).map((_, i) => (
                  <div key={i} className="w-4 h-10 bg-gradient-to-b from-sky-400 to-blue-700 rounded-sm border border-white/60 shadow-sm" />
                ))}
              </div>
            ) : (
              // Xếp dọc hai bên trái / phải
              <div className="flex flex-col -space-y-4 py-1">
                {Array.from({ length: Math.min(team.cards.length, 10) }).map((_, i) => (
                  <div key={i} className="w-12 h-2.5 bg-gradient-to-r from-sky-400 to-blue-700 rounded-sm border border-white/60 shadow-sm" />
                ))}
              </div>
            )}
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 border border-white text-white text-xs font-black rounded-md shadow">
              {team.cards.length}
            </span>
          </div>
        </div>

        {/* Avatar tròn viền vàng phát sáng + Chip tiền vàng */}
        <div className="relative flex flex-col items-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-4 transition-all duration-300 shadow-2xl ${
            isCurrent ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.8)] scale-110' : 'border-amber-500/80'
          }`}>
            <img
              src={team.avatar}
              alt={team.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <span className="text-xs sm:text-sm font-black text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {team.name}
          </span>

          {/* Chip tiền vàng 139K, 62K, 182K */}
          <div className="flex items-center space-x-1 px-3 py-0.5 mt-0.5 rounded-full bg-slate-950/80 border border-amber-400/60 shadow-md">
            <span className="text-amber-400 text-xs">🪙</span>
            <span className="text-xs font-extrabold text-amber-300">{team.score}K</span>
          </div>

          {isCurrent && (
            <span className="absolute -bottom-5 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
              Đang Lượt
            </span>
          )}

          {isWinner && (
            <span className="absolute -top-3 text-[11px] font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-400 shadow">
              🏆 Về Đích!
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-hidden flex flex-col justify-between select-none">
      {/* TOP HEADER CONTROLS (Thoát trận, Âm thanh, Giáo viên) */}
      <div className="relative z-30 w-full flex items-center justify-between px-6 py-3 bg-slate-950/40 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/30">
            ♠
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-base text-white tracking-wider drop-shadow">
              TIẾN LÊN MIỀN NAM • CASINO CLASSROOM
            </h1>
            <span className="text-[10px] text-amber-400/90 font-medium">Bàn chơi 4 đội chuẩn 13 lá bài</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 cursor-pointer shadow"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setTeacherMode(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 cursor-pointer shadow"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phân Hệ Giáo Viên</span>
          </button>

          <button
            onClick={resetGame}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs font-bold text-rose-200 cursor-pointer shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thoát Trận</span>
          </button>
        </div>
      </div>

      {/* MẶT BÀN CASINO HÌNH OVAL NỈ XANH KHỔNG LỒ (CASINO FELT POKER TABLE) */}
      <div className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        <div className="relative w-full max-w-7xl h-[620px] sm:h-[680px] rounded-[180px] sm:rounded-[240px] bg-gradient-to-b from-[#15733d] via-[#0f592d] to-[#0c4422] border-[16px] sm:border-[22px] border-[#5e3818] shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_20px_60px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
          {/* Vạch nỉ mờ họa tiết hoa văn sòng bài */}
          <div className="absolute inset-4 rounded-[150px] sm:rounded-[200px] border border-emerald-400/20 pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-emerald-400/15 via-transparent to-black/50 pointer-events-none" />

          {/* Dòng chữ in mờ watermark trên nỉ xanh */}
          <div className="absolute text-emerald-950/50 text-5xl sm:text-7xl font-black uppercase tracking-widest pointer-events-none select-none font-serif">
            TIẾN LÊN MIỀN NAM
          </div>

          {/* VỊ TRÍ 3 ĐỐI THỦ XUNG QUANH BÀN */}
          {renderOpponent(leftTeam, 'left')}
          {renderOpponent(topTeam, 'top')}
          {renderOpponent(rightTeam, 'right')}

          {/* KHU VỰC ĐÁNH BÀI TRUNG TÂM (TABLE CARDS DISPLAY) */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {tableCards && tableCards.cards.length > 0 ? (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-black/60 px-3 py-1 rounded-full border border-amber-400/40 shadow mb-3">
                  Bài Trên Bàn • {tableCards.type}
                </span>
                {/* Các lá bài đánh ra bàn xòe nhẹ góc như hình mẫu K K K K kèm hiệu ứng bay animate-card-fly */}
                <div className="flex justify-center -space-x-8 sm:-space-x-10 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] animate-card-fly">
                  {tableCards.cards.map((card, idx) => {
                    const rotations = ['-rotate-6', '-rotate-2', 'rotate-2', 'rotate-6', 'rotate-12'];
                    const rotClass = rotations[idx % rotations.length];
                    return (
                      <div key={card.id} className={`transform transition-transform ${rotClass}`}>
                        <Card card={card} size="table" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center text-emerald-300/40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-400/30 flex items-center justify-center mb-2">
                  <span className="text-2xl">♠</span>
                </div>
                <span className="text-sm font-bold text-emerald-200/80">Bàn Trống (Mở Vòng Mới)</span>
                <span className="text-xs text-emerald-300/50 mt-0.5">Đội trả lời đúng được tự do đánh bất kỳ tổ hợp nào</span>
              </div>
            )}
          </div>

          {/* VỊ TRÍ ĐỘI CHÍNH / BÀI TRÊN TAY CỦA NGƯỜI CHƠI (PHÍA DƯỚI CÙNG) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 w-full max-w-4xl px-4">
            {/* Thông báo lỗi nếu có */}
            {errorMessage && (
              <div className="mb-2 px-4 py-1.5 bg-rose-950/90 border border-rose-500 rounded-full text-rose-300 text-xs font-bold shadow-lg animate-shake">
                {errorMessage}
              </div>
            )}

            {/* Thông tin avatar & chip tiền người chơi chính */}
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg">
                  <img src={mainTeam?.avatar} alt={mainTeam?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block drop-shadow">{mainTeam?.name}</span>
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-amber-400/60 shadow">
                    <span className="text-amber-400 text-xs">🪙</span>
                    <span className="text-xs font-black text-amber-300">{mainTeam?.score}K</span>
                  </div>
                </div>
              </div>

              {/* Nút Xem / Che Bài để bảo mật khi học sinh lên bảng */}
              <button
                onClick={() => setIsHandRevealed(!isHandRevealed)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 rounded-xl border border-amber-400/50 text-xs font-bold shadow cursor-pointer"
              >
                {isHandRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isHandRevealed ? 'Che bài' : 'Xem 13 lá'}</span>
              </button>

              {/* Phân tích bài chọn */}
              {selectedCards.length > 0 && (
                <div className="px-3 py-1 bg-black/70 border border-amber-400/50 rounded-xl text-xs font-bold text-amber-300">
                  {previewCombo.type === 'INVALID' ? 'Chưa hợp lệ' : `Đang chọn: ${previewCombo.type}`}
                </div>
              )}

              {/* Nút Đánh bài & Bỏ lượt nếu đang trong pha PLAYING_CARDS */}
              {phase === 'PLAYING_CARDS' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePass}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 shadow cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bỏ Lượt</span>
                  </button>

                  <button
                    onClick={handlePlayCards}
                    disabled={selectedCards.length === 0}
                    className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Đánh Ra Bàn</span>
                  </button>
                </div>
              )}
            </div>

            {/* DÀN BÀI 13 LÁ ĐẦY ĐỦ TRÊN TAY NGƯỜI CHƠI (XÒE NẰM ĐÈ NHAU NHƯ HÌNH MẪU Q Q Q 2 2 A A) */}
            <div className="w-full flex justify-center py-2 overflow-x-auto">
              {!isHandRevealed ? (
                <div className="flex -space-x-8 sm:-space-x-10">
                  {mainTeam?.cards.map((_, idx) => (
                    <Card key={idx} isFacedDown size="hand" />
                  ))}
                </div>
              ) : (
                <div className="flex -space-x-8 sm:-space-x-10 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                  {mainTeam?.cards.map((card) => {
                    const isSelected = selectedCardIds.includes(card.id);
                    return (
                      <div key={card.id} className="relative transition-transform duration-200">
                        <Card
                          card={card}
                          isSelected={isSelected}
                          onClick={() => toggleSelectCard(card)}
                          size="hand"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GAME OVER MODAL (Khi có đội về đích) */}
      {phase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center">
            <Trophy className="w-16 h-16 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-3xl font-black text-white mb-1">TRẬN ĐẤU KẾT THÚC!</h2>
            <p className="text-slate-400 text-sm mb-6">Bảng xếp hạng chung cuộc sòng bài</p>

            <div className="w-full space-y-3 mb-6">
              {rankings.map((team, idx) => (
                <div
                  key={team.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border ${
                    idx === 0
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-extrabold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 font-semibold'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-950 font-black text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '4'}
                    </span>
                    <span className="text-base">{team.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-amber-300 font-bold">🪙 {team.score}K</span>
                    <Award className={`w-5 h-5 ${idx === 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Chơi Ván Mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
