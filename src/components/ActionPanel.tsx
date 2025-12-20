import React from 'react';
import pixelCarrot from '../assets/pixel/hand_carrot.png';
import scoopIcon from '../assets/scoop.png'; // Fallback
import pixelDress from '../assets/pixel/body_dress_pink.png';
import pixelSleep from '../assets/pixel/effect_zzz.png'; // Use Zzz effect icon for button
import { Moon } from 'lucide-react';

interface ActionPanelProps {
    onFeed: () => void;
    onClean: () => void;
    onDress: () => void;
    onSleep: () => void;
    isSleeping: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onFeed, onClean, onDress, onSleep, isSleeping }) => {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-purple-900/80 backdrop-blur-md px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] border-4 border-white z-50">
            <ActionButton onClick={onFeed} icon={pixelCarrot} label="喂食" color="hover:bg-orange-400" disabled={isSleeping} />
            <ActionButton onClick={onClean} icon={scoopIcon} label="铲屎" color="hover:bg-blue-400" disabled={isSleeping} />
            <ActionButton onClick={onDress} icon={pixelDress} label="换装" color="hover:bg-pink-400" disabled={isSleeping} />
            <ActionButton
                onClick={onSleep}
                icon={pixelSleep}
                label={isSleeping ? "醒来" : "睡觉"}
                color="hover:bg-indigo-400"
                customIcon={isSleeping ? <Moon className="w-10 h-10 text-yellow-300 animate-pulse" /> : undefined}
            />
        </div>
    );
};

const ActionButton: React.FC<{ onClick: () => void; icon: string; label: string; color: string; disabled?: boolean; customIcon?: React.ReactNode }> = ({ onClick, icon, label, color, disabled, customIcon }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        group flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-100 
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : `hover:scale-105 active:scale-95 active:translate-y-1 ${color}`}
      `}
        >
            <div className="w-12 h-12 relative flex items-center justify-center bg-white/20 rounded-md p-1 border-2 border-white/50">
                {customIcon ? customIcon : (
                    <img
                        src={icon}
                        alt={label}
                        className="w-full h-full object-contain drop-shadow-sm"
                        style={{ imageRendering: 'pixelated' }}
                    />
                )}
            </div>
            <span className="font-bold text-xs text-white uppercase tracking-widest font-mono" style={{ textShadow: '1px 1px 0 #000' }}>{label}</span>
        </button>
    );
};
