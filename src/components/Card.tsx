import React from 'react';
import { Card as CardType } from '../types/game';
import { RANK_NAMES, SUIT_SYMBOLS } from '../engine/tienLenEngine';

interface CardProps {
  card?: CardType;
  isFacedDown?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
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
    sm: 'w-10 h-14 text-xs rounded-md shadow-sm',
    md: 'w-16 h-24 text-sm rounded-lg shadow-md',
    lg: 'w-24 h-36 text-base rounded-xl shadow-lg',
  };

  if (isFacedDown || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative flex items-center justify-center border-2 border-amber-300/40 bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-900 cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1 ${sizeClasses[size]} ${className}`}
      >
        <div className="w-4/5 h-4/5 border border-amber-400/20 rounded flex items-center justify-center">
          <span className="text-amber-400/50 text-xs font-bold font-serif">TL</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  const colorClass = isRed ? 'text-red-600' : 'text-slate-900';

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between p-1.5 bg-white border border-slate-300 select-none cursor-pointer transition-all duration-200 ${
        isSelected ? '-translate-y-4 ring-4 ring-amber-400 shadow-2xl scale-105' : 'hover:-translate-y-2 hover:shadow-lg'
      } ${sizeClasses[size]} ${className}`}
    >
      {/* Top Left */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="font-extrabold tracking-tighter text-sm sm:text-base">
          {RANK_NAMES[card.rank]}
        </span>
        <span className="text-xs sm:text-sm">{SUIT_SYMBOLS[card.suit]}</span>
      </div>

      {/* Center Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-2xl sm:text-4xl ${colorClass}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>

      {/* Bottom Right */}
      <div className={`flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="font-extrabold tracking-tighter text-sm sm:text-base">
          {RANK_NAMES[card.rank]}
        </span>
        <span className="text-xs sm:text-sm">{SUIT_SYMBOLS[card.suit]}</span>
      </div>
    </div>
  );
};
