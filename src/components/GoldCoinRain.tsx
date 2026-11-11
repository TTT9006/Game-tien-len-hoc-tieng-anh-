import React from 'react';

// Tạo hiệu ứng đồng xu vàng bay lơ lửng trên bàn chơi phong cách Casino
export const GoldCoinRain: React.FC = () => {
  const coins = [
    { top: '8%', left: '12%', size: 'w-10 h-10', rotate: 'rotate-12', delay: '0s' },
    { top: '15%', left: '80%', size: 'w-16 h-16', rotate: '-rotate-45', delay: '1s' },
    { top: '25%', left: '2%', size: 'w-12 h-12', rotate: 'rotate-45', delay: '0.5s' },
    { top: '65%', left: '4%', size: 'w-14 h-14', rotate: '-rotate-12', delay: '1.2s' },
    { top: '75%', left: '18%', size: 'w-12 h-12', rotate: 'rotate-24', delay: '0.2s' },
    { top: '68%', left: '48%', size: 'w-10 h-10', rotate: 'rotate-12', delay: '0.8s' },
    { top: '72%', left: '68%', size: 'w-14 h-14', rotate: '-rotate-30', delay: '1.5s' },
    { top: '82%', left: '82%', size: 'w-16 h-16', rotate: 'rotate-45', delay: '0.4s' },
    { top: '50%', left: '96%', size: 'w-12 h-12', rotate: '-rotate-12', delay: '0.9s' },
    { top: '2%', left: '76%', size: 'w-8 h-8', rotate: 'rotate-12', delay: '0.7s' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {coins.map((coin, idx) => (
        <div
          key={idx}
          className={`absolute ${coin.size} ${coin.rotate} transition-transform duration-1000 animate-pulse`}
          style={{ top: coin.top, left: coin.left, animationDelay: coin.delay }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-[3px] shadow-[0_10px_20px_rgba(245,158,11,0.6)] flex items-center justify-center border border-amber-300">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 flex items-center justify-center shadow-inner">
              <span className="text-amber-800 text-lg font-black font-serif drop-shadow-sm">♠</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
