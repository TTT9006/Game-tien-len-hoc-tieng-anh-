import React from 'react';
import { Card } from './Card';

interface ShuffleOverlayProps {
  isVisible: boolean;
}

export const ShuffleOverlay: React.FC<ShuffleOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center w-80 h-64">
        {/* Nửa bộ bài bên trái */}
        <div className="absolute animate-shuffle-left flex -space-x-8">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="transform -rotate-6">
              <Card isFacedDown size="md" />
            </div>
          ))}
        </div>

        {/* Nửa bộ bài bên phải */}
        <div className="absolute animate-shuffle-right flex -space-x-8">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="transform rotate-6">
              <Card isFacedDown size="md" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <h2 className="text-2xl font-black text-amber-300 tracking-wider font-serif uppercase">
            Đang Xáo & Chia Bài...
          </h2>
        </div>
        <p className="text-slate-400 text-xs font-semibold">
          Thuật toán Fisher-Yates xáo bài ngẫu nhiên 100% cho 4 đội
        </p>
      </div>
    </div>
  );
};
