import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from './Card';
import { Card as CardType } from '../types/game';
import { Eye, EyeOff, Play, SkipForward, AlertCircle } from 'lucide-react';
import { evaluateCombination } from '../engine/tienLenEngine';

export const PlayCardsModal: React.FC = () => {
  const {
    phase,
    teams,
    currentTeamIndex,
    tableCards,
    playSelectedCards,
    passTurn,
  } = useGameStore();

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (phase !== 'PLAYING_CARDS') {
    return null;
  }

  const currentTeam = teams[currentTeamIndex];
  if (!currentTeam) return null;

  const toggleSelectCard = (card: CardType) => {
    setErrorMessage(null);
    if (selectedCardIds.includes(card.id)) {
      setSelectedCardIds(selectedCardIds.filter(id => id !== card.id));
    } else {
      setSelectedCardIds([...selectedCardIds, card.id]);
    }
  };

  const selectedCards = currentTeam.cards.filter(c => selectedCardIds.includes(c.id));
  const previewCombo = evaluateCombination(selectedCards);

  const handlePlayCards = () => {
    if (selectedCards.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 lá bài để đánh!');
      return;
    }

    const res = playSelectedCards(selectedCards);
    if (!res.success) {
      setErrorMessage(res.message || 'Nước đi không hợp lệ!');
    } else {
      setSelectedCardIds([]);
      setIsRevealed(false);
      setErrorMessage(null);
    }
  };

  const handlePass = () => {
    setSelectedCardIds([]);
    setIsRevealed(false);
    setErrorMessage(null);
    passTurn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${currentTeam.color} flex items-center justify-between text-white shadow-md`}>
          <div>
            <span className="px-3 py-1 bg-black/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Quyền Đánh Bài
            </span>
            <h2 className="text-2xl font-black tracking-wide mt-1 drop-shadow">
              {currentTeam.name}
            </h2>
          </div>

          {/* Nút Ẩn/Hiện bài để bảo mật trên màn hình chiếu */}
          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-950/70 hover:bg-slate-950 text-amber-300 font-bold rounded-xl border border-amber-400/40 shadow transition-all cursor-pointer"
          >
            {isRevealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span>{isRevealed ? 'Che bài (Bảo mật)' : 'Xem bài đội mình'}</span>
          </button>
        </div>

        {/* Nội dung bài của đội */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center">
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 mb-4 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-sm font-semibold animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isRevealed ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-4">
              <div className="flex space-x-2">
                {currentTeam.cards.map((_, idx) => (
                  <Card key={idx} isFacedDown size="md" className="-ml-8 first:ml-0" />
                ))}
              </div>
              <p className="text-slate-300 text-sm font-medium">
                Bài đang được úp để giữ bí mật trước các đội khác.
              </p>
              <button
                onClick={() => setIsRevealed(true)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Mở bài để chọn nước đánh
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                Nhấp vào các lá bài để chọn tổ hợp đánh (Đơn, Đôi, Ba, Sảnh, Đôi thông, Tứ quý)
              </div>

              {/* Vùng bài hiển thị */}
              <div className="flex flex-wrap justify-center gap-2 py-4 max-w-full">
                {currentTeam.cards.map(card => {
                  const isSelected = selectedCardIds.includes(card.id);
                  return (
                    <Card
                      key={card.id}
                      card={card}
                      isSelected={isSelected}
                      onClick={() => toggleSelectCard(card)}
                      size="lg"
                    />
                  );
                })}
              </div>

              {/* Phân tích bài chọn */}
              <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider mr-2">Tổ hợp đang chọn:</span>
                <span className="font-bold text-amber-400">
                  {previewCombo.type === 'INVALID' && selectedCards.length > 0 && 'Chưa hợp lệ'}
                  {previewCombo.type === 'SINGLE' && '1 Lá Rác (Đơn)'}
                  {previewCombo.type === 'PAIR' && 'Một Đôi'}
                  {previewCombo.type === 'TRIPLE' && 'Bộ Ba (Sám cô)'}
                  {previewCombo.type === 'STRAIGHT' && `Sảnh ${previewCombo.length} cây`}
                  {previewCombo.type === 'FOUR_OF_A_KIND' && 'Tứ Quý (Chặt heo / hàng)'}
                  {previewCombo.type === 'THREE_PAIRS_SEQUENCE' && '3 Đôi Thông (Chặt heo)'}
                  {previewCombo.type === 'FOUR_PAIRS_SEQUENCE' && '4 Đôi Thông (Chặt đôi heo/tứ quý)'}
                  {selectedCards.length === 0 && 'Chưa chọn lá bài nào'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {tableCards && tableCards.cards.length > 0 ? (
              <span>Cần đánh bài lớn hơn tổ hợp trên bàn</span>
            ) : (
              <span className="text-emerald-400 font-semibold">★ Được tự do đánh bất kỳ tổ hợp nào (Mở vòng mới)</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePass}
              className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 shadow transition-all active:scale-95 cursor-pointer"
            >
              <SkipForward className="w-5 h-5 text-amber-400" />
              <span>Bỏ lượt (Pass)</span>
            </button>

            <button
              onClick={handlePlayCards}
              disabled={!isRevealed || selectedCards.length === 0}
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Đánh Bài Ra Bàn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
