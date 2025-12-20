import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';

// Background
import bgGarden from '../assets/pixel/bg_garden.png';

interface Plot {
    id: number;
    status: 'empty' | 'planted' | 'growing' | 'ripe';
    plantTime: number; // Timestamp
    variant: number; // For diverse visuals
}

const GROWTH_TIME = 10000; // 10 seconds for testing (User wants "fun", instant gratification first)
const PLANT_COST = 10;
const HARVEST_REWARD_MIN = 30;
const HARVEST_REWARD_MAX = 60;

export const FarmGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, actions } = useGameState();
    const [plots, setPlots] = useState<Plot[]>(Array(6).fill(null).map((_, i) => ({
        id: i,
        status: 'empty',
        plantTime: 0,
        variant: 0
    })));

    const [flyText, setFlyText] = useState<{ id: number, x: number, y: number, text: string }[]>([]);

    // Tick for growth
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            setPlots(prev => prev.map(plot => {
                if (plot.status === 'planted' && now - plot.plantTime > GROWTH_TIME / 2) {
                    return { ...plot, status: 'growing' };
                }
                if (plot.status === 'growing' && now - plot.plantTime > GROWTH_TIME) {
                    return { ...plot, status: 'ripe' };
                }
                return plot;
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const addFlyText = (x: number, y: number, text: string) => {
        const id = Date.now() + Math.random();
        setFlyText(prev => [...prev, { id, x, y, text }]);
        setTimeout(() => setFlyText(prev => prev.filter(t => t.id !== id)), 1000);
    };

    const handlePlotClick = (plot: Plot, e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top;

        if (plot.status === 'empty') {
            // Plant
            if (state.hearts >= PLANT_COST) {
                // Deduct cost (Need a specific action or just misuse earnHearts with negative?)
                // Since updateProgression adds, we can pass negative? 
                // Wait, earnHearts is likely protected or generic. 
                // Let's assume earnHearts handles negative or we need a 'spend' action.
                // Looking at useGameState, earnHearts -> updateProgression -> adds amount. 
                // Yes, negative works mathematically.
                actions.earnHearts(-PLANT_COST);
                addFlyText(centerX, centerY, `-${PLANT_COST}❤️`);

                setPlots(prev => prev.map(p => p.id === plot.id ? {
                    ...p,
                    status: 'planted',
                    plantTime: Date.now(),
                    variant: Math.floor(Math.random() * 3)
                } : p));
            } else {
                addFlyText(centerX, centerY, `爱心不足!`);
            }
        } else if (plot.status === 'ripe') {
            // Harvest
            const reward = Math.floor(Math.random() * (HARVEST_REWARD_MAX - HARVEST_REWARD_MIN) + HARVEST_REWARD_MIN);
            actions.earnHearts(reward);
            // Also feed rabbit?
            actions.feed(); // Bonus feed effect

            addFlyText(centerX, centerY, `+${reward}❤️ 🥕`);
            setPlots(prev => prev.map(p => p.id === plot.id ? { ...p, status: 'empty' } : p));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <div className="relative w-full max-w-2xl aspect-[4/3] bg-[#8bc34a] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#558b2f] flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/30 to-transparent">
                    <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                        <span className="text-2xl">🌱</span>
                        <span className="font-bold text-green-800">开心农场</span>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/90 rounded-full hover:bg-white text-slate-600 transition-colors shadow-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Garden Area */}
                <div className="flex-1 relative">
                    <img src={bgGarden} className="absolute inset-0 w-full h-full object-cover" />

                    {/* Plots Grid */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 grid grid-cols-3 gap-6 w-3/4 max-w-md perspective-600">
                        {plots.map(plot => (
                            <PlotView
                                key={plot.id}
                                plot={plot}
                                onClick={(e) => handlePlotClick(plot, e)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#33691e] p-3 flex justify-between items-center text-white/90 z-20 font-bold border-t-4 border-[#1b5e20] shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center">❤️</div>
                        {state.hearts}
                    </div>
                    <div className="text-sm opacity-80">
                        种植消耗 {PLANT_COST} ❤️ / 收获随机奖励
                    </div>
                </div>

                {/* Fly Text */}
                <AnimatePresence>
                    {flyText.map(ft => (
                        <motion.div
                            key={ft.id}
                            initial={{ opacity: 1, x: ft.x, y: ft.y }}
                            animate={{ opacity: 0, y: ft.y - 100 }}
                            exit={{ opacity: 0 }}
                            className="fixed pointer-events-none z-[60] font-black text-2xl text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                            style={{ left: ft.x, top: ft.y, position: 'fixed' }}
                        >
                            {ft.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const PlotView: React.FC<{ plot: Plot, onClick: (e: React.MouseEvent) => void }> = ({ plot, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
                aspect-[4/3] rounded-[2rem] relative cursor-pointer shadow-xl transition-all border-b-8 border-r-4 group
                ${plot.status === 'empty' ? 'bg-[#795548] border-[#5d4037]' : ''}
                ${plot.status === 'planted' ? 'bg-[#6d4c41] border-[#4e342e]' : ''}
                ${plot.status === 'growing' ? 'bg-[#5d4037] border-[#3e2723]' : ''}
                ${plot.status === 'ripe' ? 'bg-[#4caf50] border-[#2e7d32] ring-4 ring-yellow-300 animate-pulse' : ''}
            `}
        >
            {/* Visual Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                {plot.status === 'empty' && (
                    <div className="opacity-0 group-hover:opacity-50 text-white font-bold flex flex-col items-center">
                        <span className="text-2xl">➕</span>
                        <span className="text-xs">种植</span>
                    </div>
                )}

                {plot.status === 'planted' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <span className="text-4xl text-green-300 drop-shadow-md">🌱</span>
                    </motion.div>
                )}

                {plot.status === 'growing' && (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} transition={{ duration: 0.5 }}>
                        <span className="text-5xl text-green-400 drop-shadow-md">🌿</span>
                    </motion.div>
                )}

                {plot.status === 'ripe' && (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <span className="text-6xl drop-shadow-xl">🥕</span>
                    </motion.div>
                )}
            </div>

            {/* Timer Overlay */}
            {plot.status === 'planted' && (
                <div className="absolute top-2 right-2">
                    <Timer className="w-4 h-4 text-white/50 animate-spin-slow" />
                </div>
            )}
        </motion.div>
    );
};
