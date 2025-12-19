import React from 'react';
import { cn } from '../lib/utils';
import { Heart, Utensils, Sparkles } from 'lucide-react';

interface StatsHeaderProps {
    hunger: number;
    cleanliness: number;
    happiness: number;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ hunger, cleanliness, happiness }) => {
    return (
        <div className="absolute top-4 left-4 right-4 flex justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border-2 border-pink-100 max-w-2xl mx-auto z-50">
            <StatBar
                label="饱食度"
                value={hunger}
                icon={<Utensils className="w-5 h-5 text-orange-500" />}
                color="bg-orange-400"
            />
            <StatBar
                label="清洁度"
                value={cleanliness}
                icon={<Sparkles className="w-5 h-5 text-blue-500" />}
                color="bg-blue-400"
            />
            <StatBar
                label="心情"
                value={happiness}
                icon={<Heart className="w-5 h-5 text-pink-500" />}
                color="bg-pink-400"
            />
        </div>
    );
};

const StatBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => {
    return (
        <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                {icon}
                <span>{label}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <div
                    className={cn("h-full transition-all duration-500 ease-out", color)}
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
            </div>
        </div>
    );
};
