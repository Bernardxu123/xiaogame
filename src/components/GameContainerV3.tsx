import React, { useState, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { CarrotGame } from './CarrotGame';
import { Wardrobe } from './Wardrobe';
import { motion, AnimatePresence } from 'framer-motion';

// Backgrounds
const BACKGROUNDS: Record<string, string> = {
    room: 'linear-gradient(to bottom, #fce7f3, #fbcfe8)',
    garden: 'linear-gradient(to bottom, #bbf7d0, #86efac)',
    beach: 'linear-gradient(to bottom, #7dd3fc, #fde68a)',
};

// Emojis
const MOOD_EMOJI = ['😢', '😐', '😊'];
const HUNGER_EMOJI = ['🍽️', '😋', '🥰'];
const CLEAN_EMOJI = ['🛁', '🧼', '✨'];

export const GameContainerV3: React.FC = () => {
    const { state, actions } = useGameState();
    const [showGame, setShowGame] = useState(false);
    const [showWardrobe, setShowWardrobe] = useState(false);
    const [rabbitAnimation, setRabbitAnimation] = useState<'idle' | 'happy' | 'eating'>('idle');
    const [speechBubble, setSpeechBubble] = useState<string | null>(null);

    // Particle effects (clicks)
    const [clicks, setClicks] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

    const addClickEffect = (x: number, y: number, text: string) => {
        const id = Date.now();
        setClicks(prev => [...prev, { id, x, y, text }]);
        setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 1000);
    };

    const showBubble = useCallback((text: string) => {
        setSpeechBubble(text);
        setTimeout(() => setSpeechBubble(null), 2000);
    }, []);

    const handleFeed = useCallback((e?: React.MouseEvent) => {
        actions.feed();
        setRabbitAnimation('eating');
        showBubble('好吃！🥕');
        if (e) addClickEffect(e.clientX, e.clientY, '❤️ +5');
        setTimeout(() => setRabbitAnimation('idle'), 2000);
    }, [actions, showBubble]);

    const handleClean = useCallback((e?: React.MouseEvent) => {
        actions.clean();
        setRabbitAnimation('happy');
        showBubble('好舒服！✨');
        if (e) addClickEffect(e.clientX, e.clientY, '❤️ +5');
        setTimeout(() => setRabbitAnimation('idle'), 1500);
    }, [actions, showBubble]);

    const handlePet = useCallback((e: React.MouseEvent) => {
        actions.pet();
        setRabbitAnimation('happy');
        showBubble('谢谢！❤️');
        addClickEffect(e.clientX, e.clientY, '❤️ +3');
        setTimeout(() => setRabbitAnimation('idle'), 1500);
    }, [actions, showBubble]);

    const handleGameComplete = useCallback((score: number) => {
        actions.earnHearts(score * 2);
        actions.feed();
    }, [actions]);

    // Derived state
    const getRabbitState = (): 'normal' | 'happy' | 'sad' | 'eating' | 'sleeping' => {
        if (rabbitAnimation === 'eating') return 'eating';
        if (rabbitAnimation === 'happy') return 'happy';
        if (state.hungerLevel === 0 || state.cleanLevel === 0) return 'sad';
        if (state.happyLevel === 2) return 'happy';
        return 'normal';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen overflow-hidden select-none font-sans"
            style={{ background: BACKGROUNDS[state.currentBackground] }}
        >
            {/* 1. Top Bar (Hearts & Settings) */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWardrobe(true)}
                    className="bg-white/80 backdrop-blur-md rounded-full px-5 py-2 shadow-xl border-4 border-white/50 flex items-center gap-2"
                >
                    <span className="text-3xl text-red-500 drop-shadow-sm">❤️</span>
                    <span className="text-2xl font-black text-pink-600 tracking-wider font-mono">{state.hearts}</span>
                </motion.button>

                {/* Status Pills */}
                <div className="flex gap-2">
                    {[
                        { value: state.hungerLevel, emoji: HUNGER_EMOJI, label: '饿了', warning: state.hungerLevel === 0 },
                        { value: state.cleanLevel, emoji: CLEAN_EMOJI, label: '脏了', warning: state.cleanLevel === 0 },
                        { value: state.happyLevel, emoji: MOOD_EMOJI, label: '心情', warning: false },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            animate={stat.warning ? { y: [0, -5, 0] } : {}}
                            transition={stat.warning ? { repeat: Infinity, duration: 1 } : {}}
                            className={`
                bg-white/80 backdrop-blur-md rounded-2xl px-3 py-2 shadow-lg border-2 
                ${stat.warning ? 'border-red-400 bg-red-50' : 'border-white/50'}
                flex flex-col items-center min-w-[60px]
              `}
                        >
                            <div className="text-2xl">{stat.emoji[stat.value]}</div>
                            {stat.warning && <div className="text-[10px] font-bold text-red-500">{stat.label}</div>}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 2. Main Character Area */}
            <div className="absolute inset-0 flex items-center justify-center pt-10 z-10">
                {/* Helper Indicators (when needs are critical) */}
                <AnimatePresence>
                    {state.hungerLevel === 0 && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -translate-x-24 -translate-y-24 bg-white/90 rounded-full p-4 shadow-xl border-4 border-orange-300 pointer-events-none"
                        >
                            <div className="text-4xl animate-pulse">🥕</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Speech Bubble */}
                <AnimatePresence>
                    {speechBubble && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: -180, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute z-50 bg-white rounded-3xl px-8 py-4 shadow-2xl border-4 border-blue-200"
                        >
                            <div className="text-2xl font-bold text-slate-700">{speechBubble}</div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[16px] border-transparent border-t-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rabbit */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePet}
                    className="cursor-pointer drop-shadow-2xl filter"
                >
                    <Rabbit
                        state={getRabbitState()}
                        isDressed={state.currentOutfit !== 'default'}
                    />
                </motion.div>
            </div>

            {/* 3. Action Dock (Bottom) */}
            <div className="absolute bottom-8 left-0 right-0 z-40 px-6">
                <div className="max-w-md mx-auto bg-white/40 backdrop-blur-xl rounded-[2rem] p-4 shadow-2xl border border-white/50 flex justification-around gap-2">
                    <MenuButton
                        emoji="🥕"
                        label="喂食"
                        onClick={handleFeed}
                        color="bg-orange-400"
                        bounce={state.hungerLevel === 0}
                    />
                    <MenuButton
                        emoji="🛁"
                        label="洗澡"
                        onClick={handleClean}
                        color="bg-sky-400"
                        bounce={state.cleanLevel === 0}
                    />
                    <MenuButton
                        emoji="🎮"
                        label="玩耍"
                        onClick={() => setShowGame(true)}
                        color="bg-green-400"
                    />
                    <MenuButton
                        emoji="👗"
                        label="装扮"
                        onClick={() => setShowWardrobe(true)}
                        color="bg-purple-400"
                    />
                </div>
            </div>

            {/* 4. Click Particles */}
            <AnimatePresence>
                {clicks.map(click => (
                    <motion.div
                        key={click.id}
                        initial={{ opacity: 1, y: click.y, x: click.x }}
                        animate={{ opacity: 0, y: click.y - 100 }}
                        exit={{ opacity: 0 }}
                        className="fixed pointer-events-none z-50 text-2xl font-bold text-red-500 drop-shadow-md"
                        style={{ left: 0, top: 0 }} // Position handled by translate in animate? No, using layout props.
                    >
                        {/* Using absolute fixed positioning wrapper might be better, let's just use style */}
                        <div style={{ position: 'fixed', left: click.x, top: click.y, transform: 'translate(-50%, -50%)' }}>
                            {click.text}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showGame && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-0 z-50"
                    >
                        <CarrotGame onComplete={handleGameComplete} onClose={() => setShowGame(false)} />
                    </motion.div>
                )}

                {showWardrobe && (
                    // Wardrobe component handles its own overlay, but we can wrap it for transitions if we modify it.
                    // For now let's just render it, it has a fixed overlay.
                    <div className="fixed inset-0 z-50">
                        <Wardrobe
                            hearts={state.hearts}
                            currentOutfit={state.currentOutfit}
                            currentBackground={state.currentBackground}
                            unlockedOutfits={state.unlockedOutfits}
                            unlockedBackgrounds={state.unlockedBackgrounds}
                            onEquipOutfit={actions.equipOutfit}
                            onSetBackground={actions.setBackground}
                            onUnlock={actions.unlockItem}
                            onClose={() => setShowWardrobe(false)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const MenuButton: React.FC<{
    emoji: string;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    color: string;
    bounce?: boolean;
}> = ({ emoji, label, onClick, color, bounce }) => (
    <motion.button
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        animate={bounce ? { y: [0, -10, 0] } : {}}
        transition={bounce ? { repeat: Infinity, duration: 0.8 } : {}}
        onClick={onClick}
        className={`
      ${color} flex-1 aspect-square rounded-2xl shadow-lg border-b-4 border-black/10
      flex flex-col items-center justify-center gap-1
    `}
    >
        <span className="text-4xl filter drop-shadow-md">{emoji}</span>
        <span className="text-xs font-bold text-white tracking-wide">{label}</span>
    </motion.button>
);
