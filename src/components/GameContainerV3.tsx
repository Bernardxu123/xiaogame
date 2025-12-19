import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { CarrotGame } from './CarrotGame';
import { Wardrobe } from './Wardrobe';
import { motion, AnimatePresence } from 'framer-motion';

// Pixel Art Backgrounds (CSS)
const BACKGROUNDS: Record<string, string> = {
    room: `
    linear-gradient(to bottom, #ffe4e6 0%, #ffe4e6 70%, #fecdd3 70%, #fecdd3 100%),
    radial-gradient(circle at 20% 20%, #fff0f5 10px, transparent 11px),
    radial-gradient(circle at 80% 40%, #fff0f5 15px, transparent 16px)
  `,
    garden: `
    linear-gradient(to bottom, #bae6fd 0%, #bae6fd 60%, #86efac 60%, #86efac 100%),
    radial-gradient(circle at 10% 20%, white 20px, transparent 21px),
    radial-gradient(circle at 15% 25%, white 15px, transparent 16px),
    repeating-linear-gradient(45deg, #4ade80 0, #4ade80 10px, #22c55e 10px, #22c55e 20px)
  `,
    beach: `
    linear-gradient(to bottom, #7dd3fc 0%, #7dd3fc 50%, #fde047 50%, #fde047 100%),
    radial-gradient(circle at 90% 10%, #facc15 40px, transparent 41px),
    repeating-linear-gradient(90deg, #60a5fa 0, #60a5fa 20px, #3b82f6 20px, #3b82f6 40px)
  `,
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
    const [giftEffect, setGiftEffect] = useState<number | null>(null);

    // Time of Day Logic
    const timeOfDay = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) return 'morning';
        if (hour >= 10 && hour < 17) return 'day';
        if (hour >= 17 && hour < 20) return 'evening';
        return 'night';
    }, []);

    const dayNightOverlay = useMemo(() => {
        switch (timeOfDay) {
            case 'morning': return 'rgba(255, 200, 150, 0.1)';
            case 'evening': return 'rgba(255, 100, 50, 0.2)';
            case 'night': return 'rgba(0, 0, 50, 0.4)';
            default: return 'transparent';
        }
    }, [timeOfDay]);

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

    const handleClaimGift = useCallback(() => {
        const amount = actions.claimDailyGift();
        if (amount > 0) {
            setGiftEffect(amount);
            showBubble(`获得大礼包！❤️+${amount}`);
            setTimeout(() => setGiftEffect(null), 3000);
        }
    }, [actions, showBubble]);

    const handleGameComplete = useCallback((score: number) => {
        actions.earnHearts(score * 2);
        actions.feed();
    }, [actions]);

    // Derived state for rabbit image
    const getRabbitState = (): 'normal' | 'happy' | 'sad' | 'eating' | 'sleeping' => {
        if (rabbitAnimation === 'eating') return 'eating';
        if (rabbitAnimation === 'happy') return 'happy';
        if (state.hungerLevel === 0 || state.cleanLevel === 0) return 'sad';
        if (state.happyLevel === 2) return 'happy';
        return 'normal';
    };

    // Progression XP Progress
    const xpProgress = useMemo(() => {
        const required = state.level * 100;
        const currentXP = state.totalHeartsEarned % required; // Simplification
        return (currentXP / required) * 100;
    }, [state.level, state.totalHeartsEarned]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen overflow-hidden select-none font-sans"
            style={{ background: BACKGROUNDS[state.currentBackground] }}
        >
            {/* Day/Night Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-20 transition-colors duration-[5000ms]"
                style={{ backgroundColor: dayNightOverlay }}
            />

            {/* 1. Top Bar (Hearts, Level, XP) */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40">
                <div className="flex flex-col gap-2">
                    {/* Hearts Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowWardrobe(true)}
                        className="bg-white/80 backdrop-blur-md rounded-full px-5 py-2 shadow-xl border-4 border-white/50 flex items-center gap-2"
                    >
                        <span className="text-3xl text-red-500 drop-shadow-sm">❤️</span>
                        <span className="text-2xl font-black text-pink-600 tracking-wider font-mono">{state.hearts}</span>
                    </motion.button>

                    {/* Level Bar */}
                    <div className="bg-white/80 backdrop-blur-md rounded-xl p-2 shadow-lg border-2 border-white/50 w-48">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-purple-600">LV.{state.level} 兔兔达人</span>
                            <span className="text-[10px] text-purple-400">XP</span>
                        </div>
                        <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${xpProgress}%` }}
                                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Pills & Daily Gift */}
                <div className="flex flex-col items-end gap-3">
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

                    {/* Daily Gift Icon */}
                    <AnimatePresence>
                        {(Date.now() - state.lastGiftClaimed > 24 * 60 * 60 * 1000) && (
                            <motion.button
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1.2, rotate: 0 }}
                                exit={{ scale: 0 }}
                                whileHover={{ scale: 1.4 }}
                                onClick={handleClaimGift}
                                className="bg-yellow-400 rounded-2xl p-3 shadow-xl border-4 border-white animate-bounce"
                            >
                                <span className="text-4xl">🎁</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. Main Character Area */}
            <div className="absolute inset-0 flex items-center justify-center pt-10 z-10">
                {/* Gift Animation Effect */}
                <AnimatePresence>
                    {giftEffect && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 0 }}
                            animate={{ opacity: 1, scale: 2, y: -200 }}
                            exit={{ opacity: 0 }}
                            className="absolute z-50 text-6xl font-black text-yellow-500 drop-shadow-2xl"
                        >
                            🎉 +{giftEffect} ❤️
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
                        equipment={state.equipment}
                    />
                </motion.div>
            </div>

            {/* 3. Action Dock (Bottom) */}
            <div className="absolute bottom-8 left-0 right-0 z-40 px-6">
                <div className="max-w-md mx-auto bg-white/40 backdrop-blur-xl rounded-[2rem] p-4 shadow-2xl border border-white/50 flex justify-around gap-2">
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
                    >
                        <div style={{ position: 'fixed', left: click.x, top: click.y, transform: 'translate(-50%, -50%)' }}>
                            {click.text}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Night Stars (if night) */}
            {timeOfDay === 'night' && (
                <div className="absolute inset-0 pointer-events-none">
                    <Starfield />
                </div>
            )}

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
                    <div className="fixed inset-0 z-50">
                        <Wardrobe
                            hearts={state.hearts}
                            unlockedItems={state.unlockedItems}
                            unlockedBackgrounds={state.unlockedBackgrounds}
                            equipment={state.equipment}
                            currentBackground={state.currentBackground}
                            onUnlockItem={actions.unlockItem}
                            onEquipItem={actions.equipItem}
                            onUnlockBackground={actions.unlockBackground}
                            onSetBackground={actions.setBackground}
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

const Starfield: React.FC = () => {
    return (
        <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: Math.random() * 3 + 2, delay: Math.random() * 2 }}
                    className="absolute bg-white rounded-full"
                    style={{
                        width: Math.random() * 3 + 1,
                        height: Math.random() * 3 + 1,
                        top: `${Math.random() * 60}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                />
            ))}
        </div>
    );
}
