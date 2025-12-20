import React from 'react';
import poopIcon from '../assets/pixel/poop.png';
import { cn } from '../lib/utils';

export interface Poop {
    id: number;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
}

interface PoopSystemProps {
    poops: Poop[];
    onClean: (id: number) => void;
}

export const PoopSystem: React.FC<PoopSystemProps> = ({ poops, onClean }) => {
    if (poops.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            {/* Guidance hint when poops exist */}
            <div className="absolute top-32 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce pointer-events-none">
                小兔子把屋子弄脏了，快点击 💩 清理一下！
            </div>

            {poops.map((poop) => (
                <button
                    key={poop.id}
                    onClick={() => onClean(poop.id)}
                    className={cn(
                        "absolute w-20 h-20 transition-transform hover:scale-125 active:scale-90 pointer-events-auto cursor-pointer animate-in fade-in zoom-in duration-300"
                    )}
                    style={{
                        left: `${poop.x}%`,
                        bottom: `${poop.y}%`,
                        transform: 'translateX(-50%)' // Center the poop relative to its percentage
                    }}
                >
                    <img src={poopIcon} alt="Poop" className="w-full h-full object-contain drop-shadow-xl" />
                </button>
            ))}
        </div>
    );
};
