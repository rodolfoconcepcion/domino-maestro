import React from 'react';

interface DominoTileProps {
  top: number;
  bottom: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
  badge?: string;
  badgeColor?: string;
  orderBadge?: number | string;
}

export const DominoTile: React.FC<DominoTileProps> = ({
  top,
  bottom,
  orientation = 'vertical',
  size = 'md',
  selected = false,
  disabled = false,
  highlighted = false,
  onClick,
  className = '',
  badge,
  badgeColor = 'bg-amber-500 text-slate-950',
  orderBadge,
}) => {
  const isHorizontal = orientation === 'horizontal';

  // Size configurations [width, height] in px
  const sizeMap = {
    sm: isHorizontal ? { w: 'w-[72px]', h: 'h-[40px]', pip: 'w-2 h-2', pin: 'w-2 h-2' } : { w: 'w-[40px]', h: 'h-[72px]', pip: 'w-2 h-2', pin: 'w-2 h-2' },
    md: isHorizontal ? { w: 'w-20', h: 'h-12', pip: 'w-2.5 h-2.5', pin: 'w-2.5 h-2.5' } : { w: 'w-12', h: 'h-20', pip: 'w-2.5 h-2.5', pin: 'w-2.5 h-2.5' },
    lg: isHorizontal ? { w: 'w-28', h: 'h-16', pip: 'w-3 h-3', pin: 'w-3 h-3' } : { w: 'w-16', h: 'h-28', pip: 'w-3 h-3', pin: 'w-3 h-3' },
    xl: isHorizontal ? { w: 'w-36', h: 'h-20', pip: 'w-3.5 h-3.5', pin: 'w-3 h-3' } : { w: 'w-20', h: 'h-36', pip: 'w-3.5 h-3.5', pin: 'w-3 h-3' },
  };

  const currentSize = sizeMap[size];

  const renderPips = (value: number) => {
    // 3x3 grid for pips
    const grid: boolean[] = Array(9).fill(false);

    switch (value) {
      case 1:
        grid[4] = true;
        break;
      case 2:
        grid[0] = true;
        grid[8] = true;
        break;
      case 3:
        grid[0] = true;
        grid[4] = true;
        grid[8] = true;
        break;
      case 4:
        grid[0] = true;
        grid[2] = true;
        grid[6] = true;
        grid[8] = true;
        break;
      case 5:
        grid[0] = true;
        grid[2] = true;
        grid[4] = true;
        grid[6] = true;
        grid[8] = true;
        break;
      case 6:
        grid[0] = true;
        grid[2] = true;
        grid[3] = true;
        grid[5] = true;
        grid[6] = true;
        grid[8] = true;
        break;
      default:
        break;
    }

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 place-items-center">
        {grid.map((active, i) => (
          <div key={i} className="flex items-center justify-center w-full h-full">
            {active && (
              <span
                className={`domino-pip rounded-full bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#252525] shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.95),0_0.5px_0.5px_rgba(255,255,255,0.6)] ${currentSize.pip}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="domino-tile relative inline-block select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`
          relative flex items-center justify-between
          ${isHorizontal ? 'flex-row' : 'flex-col'}
          ${currentSize.w} ${currentSize.h}
          bg-gradient-to-b from-[#fbf8f0] via-[#f5edd8] to-[#e8dcb8]
          border border-[#d1c2a5] rounded-lg
          transition-all duration-150
          shadow-[0_6px_14px_-2px_rgba(0,0,0,0.5),0_2px_4px_-1px_rgba(0,0,0,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.95),inset_0_-1.5px_1px_rgba(0,0,0,0.1)]
          ${selected ? 'ring-4 ring-amber-400 scale-105 -translate-y-1.5 shadow-amber-500/50' : ''}
          ${highlighted ? 'border-amber-400 ring-2 ring-amber-400/80 -translate-y-1 shadow-[0_12px_22px_-3px_rgba(0,0,0,0.6),0_4px_8px_-2px_rgba(0,0,0,0.4),inset_0_2px_1.5px_rgba(255,255,255,1)]' : ''}
          ${disabled ? 'cursor-default opacity-85' : 'active:scale-95 sm:hover:-translate-y-1.5 sm:hover:shadow-[0_12px_22px_-3px_rgba(0,0,0,0.6),0_4px_8px_-2px_rgba(0,0,0,0.4),inset_0_2px_1.5px_rgba(255,255,255,1)] cursor-pointer'}
          ${className}
        `}
      >
        {/* Top / Left Half */}
        <div className="flex-1 w-full h-full flex items-center justify-center">
          {renderPips(top)}
        </div>

        {/* Middle Divider with Golden/Brass Spin Pin */}
        <div
          className={`
            relative z-10 flex items-center justify-center
            ${isHorizontal ? 'w-[2px] h-full' : 'w-full h-[2px]'}
            bg-gradient-to-r from-[#b3a898] via-[#8c8273] to-[#b3a898] shadow-[0_0.5px_0_rgba(255,255,255,0.7)]
          `}
        >
          {/* Classic Caribbean Domino Brass Pin */}
          <div
            className={`
              absolute rounded-full bg-gradient-to-tr from-amber-700 via-amber-300 to-yellow-100
              border border-amber-900/80 shadow-[0_1px_2.5px_rgba(0,0,0,0.7),inset_0_0.5px_0.5px_rgba(255,255,255,0.9)]
              ${currentSize.pin}
            `}
          />
        </div>

        {/* Bottom / Right Half */}
        <div className="flex-1 w-full h-full flex items-center justify-center">
          {renderPips(bottom)}
        </div>
      </button>

      {badge && (
        <span
          className={`absolute -top-1.5 -right-1 z-30 text-[8px] leading-tight font-extrabold px-1 py-0.5 rounded shadow-md pointer-events-none ${badgeColor}`}
        >
          {badge}
        </span>
      )}

      {orderBadge !== undefined && orderBadge !== null && (
        <span
          className="absolute -bottom-1.5 -left-1 z-30 text-[8px] leading-none font-black min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full bg-slate-950 text-amber-300 border border-amber-400/90 shadow-md pointer-events-none font-mono"
        >
          {typeof orderBadge === 'number' ? `#${orderBadge}` : orderBadge}
        </span>
      )}
    </div>
  );
};
