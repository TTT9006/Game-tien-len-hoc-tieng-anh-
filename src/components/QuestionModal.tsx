import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { CheckCircle2, XCircle, Eye, HelpCircle } from 'lucide-react';

export const QuestionModal: React.FC = () => {
  const {
    phase,
    currentQuestion,
    teams,
    currentTeamIndex,
    revealAnswer,
    handleAnswerResult,
  } = useGameStore();

  if (phase !== 'QUESTION' && phase !== 'ANSWER_REVEALED') {
    return null;
  }

  const currentTeam = teams[currentTeamIndex];
  if (!currentQuestion || !currentTeam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header: Đội đang thi đấu */}
        <div className={`p-4 bg-gradient-to-r ${currentTeam.color} flex items-center justify-between text-white shadow-md`}>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-black/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Lượt Đội
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide drop-shadow">
              {currentTeam.name}
            </h2>
          </div>
          <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
            {currentQuestion.category || 'English Challenge'}
          </div>
        </div>

        {/* Content: Câu hỏi */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center">
          {currentQuestion.imageUrl && (
            <div className="mb-6 max-h-48 overflow-hidden rounded-xl border border-slate-700 shadow-md">
              <img
                src={currentQuestion.imageUrl}
                alt="Question Illustration"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 text-amber-400 mb-3">
            <HelpCircle className="w-6 h-6 animate-pulse" />
            <span className="font-semibold text-sm uppercase tracking-widest">
              {currentQuestion.type === 'multiple_choice' ? 'Câu hỏi Trắc nghiệm' : 'Câu hỏi Thảo luận'}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-relaxed mb-6 max-w-2xl">
            {currentQuestion.prompt}
          </h3>

          {/* Nếu là trắc nghiệm */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-6">
              {currentQuestion.options.map((option, idx) => {
                const label = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-left text-slate-200 font-medium hover:border-slate-500 transition-colors"
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 font-bold text-sm">
                      {label}
                    </span>
                    <span className="flex-1 text-base">{option}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Đáp án hiển thị khi giáo viên bấm "Xem đáp án" */}
          {phase === 'ANSWER_REVEALED' && (
            <div className="w-full max-w-2xl p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl mb-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                Đáp án chính xác:
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300">
                {currentQuestion.answer}
              </div>
              {currentQuestion.explanation && (
                <div className="mt-2 text-sm text-slate-300 border-t border-emerald-500/20 pt-2 text-left">
                  <span className="font-semibold text-emerald-400">Giải thích: </span>
                  {currentQuestion.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Controls dành cho Giáo viên */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 italic">
            *Giáo viên điều phối và chấm điểm cho học sinh
          </div>

          <div className="flex items-center space-x-3">
            {phase === 'QUESTION' ? (
              <button
                onClick={revealAnswer}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Eye className="w-5 h-5" />
                <span>Hiện đáp án</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAnswerResult(false)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Sai (Mất lượt)</span>
                </button>
                <button
                  onClick={() => handleAnswerResult(true)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Đúng (Mở bài)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
