import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import { Trophy, Award, RotateCcw } from 'lucide-react';

export const GameTable: React.FC = () => {
  const {
    teams,
    currentTeamIndex,
    tableCards,
    phase,
    rankings,
    resetGame,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sm:p-6 bg-radial from-emerald-950 via-slate-950 to-slate-950">
      {/* KHU VỰC CÁC ĐỘI ĐỐI THỦ (Phía trên & hai bên) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {teams.map((team, idx) => {
          const isCurrent = idx === currentTeamIndex;
          const isWinner = team.cards.length === 0;

          return (
            <div
              key={team.id}
              className={`relative p-3.5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? 'border-amber-400 bg-slate-900/90 shadow-lg shadow-amber-400/20 scale-105'
                  : 'border-slate-800 bg-slate-900/60'
              } ${team.hasPassedTurn ? 'opacity-50' : 'opacity-100'}`}
            >
              {/* Header đội */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${team.color}`} />
                  <span className="font-extrabold text-sm sm:text-base text-white truncate max-w-[120px]">
                    {team.name}
                  </span>
                </div>
                <div className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                  {team.score} đ
                </div>
              </div>

              {/* Trạng thái bài của đội */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="flex -space-x-4 overflow-hidden py-1">
                    {team.cards.slice(0, 5).map((_, cIdx) => (
                      <Card key={cIdx} isFacedDown size="sm" />
                    ))}
                  </div>
                  {team.cards.length > 5 && (
                    <span className="text-xs text-slate-400 font-bold ml-1">
                      +{team.cards.length - 5}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-amber-400">
                    {team.cards.length}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-medium">lá bài</span>
                </div>
              </div>

              {/* Cờ thông báo trạng thái */}
              {isCurrent && (
                <div className="mt-2 text-center text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 py-0.5 rounded-full animate-pulse border border-amber-400/30">
                  Đang đến lượt
                </div>
              )}
              {team.hasPassedTurn && !isWinner && (
                <div className="mt-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 py-0.5 rounded-full">
                  Đã bỏ lượt
                </div>
              )}
              {isWinner && (
                <div className="mt-2 text-center text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 py-0.5 rounded-full border border-emerald-500/40">
                  🏆 Đã Về Đích!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BÀN CHƠI TRUNG TÂM (TABLE CARDS DISPLAY) */}
      <div className="relative my-auto flex flex-col items-center justify-center min-h-[220px]">
        {/* Mặt bàn nỉ xanh Tiến Lên */}
        <div className="w-full max-w-2xl min-h-[180px] bg-emerald-900/40 border-4 border-emerald-700/60 rounded-3xl p-6 flex flex-col items-center justify-center shadow-inner backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-emerald-600/10 to-transparent pointer-events-none" />

          {tableCards && tableCards.cards.length > 0 ? (
            <div className="flex flex-col items-center space-y-3 z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                Bài trên bàn ({tableCards.type})
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {tableCards.cards.map(card => (
                  <Card key={card.id} card={card} size="lg" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center text-emerald-400/60 z-10 space-y-1">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-500/40 flex items-center justify-center mb-1">
                ♠
              </div>
              <p className="text-base font-bold text-emerald-300">Bàn Trống (Vòng Mới)</p>
              <p className="text-xs text-emerald-400/70">
                Đội trả lời đúng kế tiếp có quyền ra bất kỳ tổ hợp nào!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: ĐỘI ĐANG TRONG LƯỢT */}
      {currentTeam && (
        <div className="w-full flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${currentTeam.color}`} />
            <div>
              <span className="text-xs text-slate-400 block font-medium">Lượt chơi hiện tại:</span>
              <span className="text-lg font-black text-white">{currentTeam.name}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            *Lượt chơi luân phiên: Trả lời câu hỏi ➔ Giáo viên chấm ➔ Đánh bài / Bỏ lượt
          </div>
        </div>
      )}

      {/* GAME OVER MODAL (Khi trận đấu kết thúc) */}
      {phase === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center">
            <Trophy className="w-16 h-16 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-3xl font-black text-white mb-1">TRẬN ĐẤU KẾT THÚC!</h2>
            <p className="text-slate-400 text-sm mb-6">Bảng xếp hạng chung cuộc của các đội</p>

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
                    <span className="text-xs text-slate-400">Điểm: {team.score}đ</span>
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
