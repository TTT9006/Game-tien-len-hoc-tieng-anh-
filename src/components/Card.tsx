import React from 'react';
import { Card as CardType } from '../types/game';
import { RANK_NAMES, SUIT_SYMBOLS } from '../engine/tienLenEngine';

interface CardProps {
  card?: CardType;
  isFacedDown?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hand' | 'table';
  stackedHorizontal?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  isFacedDown = false,
  isSelected = false,
  onClick,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-12 text-xs rounded-md shadow-sm',
    md: 'w-14 h-20 text-sm rounded-lg shadow-md',
    lg: 'w-20 h-28 text-base rounded-xl shadow-lg',
    hand: 'w-16 h-28 sm:w-20 sm:h-32 text-base rounded-xl shadow-xl',
    table: 'w-18 h-28 sm:w-22 sm:h-32 text-base rounded-xl shadow-2xl',
  };

  if (isFacedDown || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center border-2 border-sky-300/60 bg-gradient-to-br from-blue-700 via-sky-800 to-indigo-900 cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1 shadow-lg ${sizeClasses[size]} ${className}`}
      >
        <div className="w-[85%] h-[85%] border-2 border-dashed border-sky-200/40 rounded flex flex-col items-center justify-center bg-blue-900/40">
          <span className="text-amber-300 text-[10px] sm:text-xs font-black tracking-widest font-serif">♠ 13</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const colorClass = isRed ? 'text-red-600' : 'text-slate-900';
  const rankDisplay = RANK_NAMES[card.rank];
  const suitDisplay = SUIT_SYMBOLS[card.suit];

  // Hình đại diện phong cách bài Tây cho J, Q, K
  const isFaceCard = card.rank >= 11 && card.rank <= 13;

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between p-1 sm:p-1.5 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-2 border-slate-300 select-none cursor-pointer transition-all duration-200 ${
        isSelected
          ? '-translate-y-6 ring-4 ring-amber-400 shadow-[0_15px_30px_rgba(251,191,36,0.4)] scale-105 z-30'
          : 'hover:-translate-y-3 hover:shadow-2xl z-10'
      } ${sizeClasses[size]} ${className}`}
    >
      {/* Top Left: Rank + Suit */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="font-black tracking-tighter text-base sm:text-lg drop-shadow-sm">
          {rankDisplay}
        </span>
        <span className="text-sm sm:text-base leading-none">{suitDisplay}</span>
      </div>

      {/* Center Figure / Big Suit */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none ${colorClass}`}>
        {isFaceCard ? (
          <div className="w-10 h-14 sm:w-12 sm:h-16 border border-slate-200 rounded flex flex-col items-center justify-center bg-slate-50/50 shadow-inner">
            <span className="text-2xl sm:text-3xl font-serif">
              {card.rank === 11 ? '🤴' : card.rank === 12 ? '👸' : '👑'}
            </span>
          </div>
        ) : (
          <span className="opacity-25 text-3xl sm:text-4xl font-serif">
            {suitDisplay}
          </span>
        )}
      </div>

      {/* Bottom Right: Rank + Suit (Inverted) */}
      <div className={`flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="font-black tracking-tighter text-base sm:text-lg drop-shadow-sm">
          {rankDisplay}
        </span>
        <span className="text-sm sm:text-base leading-none">{suitDisplay}</span>
      </div>
    </div>
  );
};
