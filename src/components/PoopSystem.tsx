import React from 'react';
import poopIcon from '../assets/poop.png';
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
    return (
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10">
            {poops.map((poop) => (
                <button
                    key={poop.id}
                    onClick={() => onClean(poop.id)}
                    className={cn(
                        "absolute w-16 h-16 transition-transform hover:scale-110 active:scale-90 pointer-events-auto cursor-pointer animate-in fade-in zoom-in duration-300"
                    )}
                    style={{
                        left: `${poop.x}%`,
                        bottom: `${poop.y}%`
                    }}
                >
                    <img src={poopIcon} alt="Poop" className="w-full h-full object-contain drop-shadow-md" />
                </button>
            ))}
        </div>
    );
};
