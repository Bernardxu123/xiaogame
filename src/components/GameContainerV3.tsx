import React, { useState, useCallback, useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { CarrotGame } from './CarrotGame';
import { MemoryGame } from './MemoryGame';
import { DressUpStudio } from './DressUpStudio';
import { FarmGame } from './FarmGame';
import { PoopSystem } from './PoopSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, BrainCircuit, Flower, RotateCw } from 'lucide-react';

// Background Assets
import bgRoom from '../assets/pixel/bg_room.jpg';
import bgGarden from '../assets/pixel/bg_garden.png';
import bgBeach from '../assets/pixel/bg_beach.png';
import bgCandy from '../assets/pixel/bg_candy.png';
import bgNight from '../assets/pixel/bg_night.png';
import bgStudio from '../assets/pixel/bg_studio.jpg';

const BACKGROUND_IMAGES: Record<string, string> = {
    room: bgRoom,
    garden: bgGarden,
    beach: bgBeach,
    candy: bgCandy,
    night: bgNight,
    studio: bgStudio,
};

// Emojis
const MOOD_EMOJI = ['😢', '😐', '😊'];

// Assets: Items
const ASSETS = import.meta.glob('../assets/pixel/*.png', { eager: true, as: 'url' });

export const GameContainerV3: React.FC = () => {
    const { state, actions } = useGameState();

    // Status initialization
    const [canClaimGift] = useState(() => Date.now() - state.lastGiftClaimed > 24 * 60 * 60 * 1000);

    // UI State
    const [activeGame, setActiveGame] = useState<'carrot' | 'memory' | 'farm' | null>(null);
    const [showGameMenu, setShowGameMenu] = useState(false);
    const [showWardrobe, setShowWardrobe] = useState(false);

    const [rabbitAnimation, setRabbitAnimation] = useState<'idle' | 'happy' | 'eating'>('idle');
    const [speechBubble, setSpeechBubble] = useState<string | null>(null);
    const [giftEffect, setGiftEffect] = useState<number | null>(null);

    // Time of Day Logic
    const [timeOfDay] = useState(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) return 'morning';
        if (hour >= 10 && hour < 17) return 'day';
        if (hour >= 17 && hour < 20) return 'evening';
        return 'night';
    });

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
        actions.earnHearts(score);
        showBubble(`游戏胜利！+${score} ❤️`);
        setActiveGame(null); // Close game
        // Optional: show victory effect here
    }, [actions, showBubble]);

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
        const currentXP = state.totalHeartsEarned % required;
        return (currentXP / required) * 100;
    }, [state.level, state.totalHeartsEarned]);

    const currentBackground = state.currentBackground;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen overflow-hidden select-none font-sans"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={BACKGROUND_IMAGES[currentBackground] || BACKGROUND_IMAGES['room']}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Day/Night Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10 transition-colors duration-[5000ms]"
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

                {/* Status Progress Bars */}
                <div className="flex flex-col items-end gap-3 w-48">
                    {/* Hunger Bar */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border-2 border-white/50 w-full">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                            <span>饱食度 {state.hungerLevel === 0 && '⚠️'}</span>
                            <span>{state.hungerLevel}/2</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${(state.hungerLevel / 2) * 100}%` }}
                                className={`h-full ${state.hungerLevel === 0 ? 'bg-red-500' : 'bg-orange-400'}`}
                            />
                        </div>
                    </div>

                    {/* Cleanliness Bar */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border-2 border-white/50 w-full">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                            <span>清洁度 {state.cleanLevel === 0 && '⚠️'}</span>
                            <span>{state.cleanLevel}/2</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${(state.cleanLevel / 2) * 100}%` }}
                                className={`h-full ${state.cleanLevel === 0 ? 'bg-red-500' : 'bg-blue-400'}`}
                            />
                        </div>
                    </div>

                    {/* Happy Bar (Optional, was mood) */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border-2 border-white/50 w-full">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                            <span>心情</span>
                            <span>{MOOD_EMOJI[state.happyLevel]}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: `${(state.happyLevel / 2) * 100}%` }}
                                className="h-full bg-pink-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Gift Icon */}
            <AnimatePresence>
                {canClaimGift && (
                    <motion.button
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1.2, rotate: 0 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.4 }}
                        onClick={handleClaimGift}
                        className="absolute top-24 right-4 bg-yellow-400 rounded-2xl p-3 shadow-xl border-4 border-white animate-bounce z-40"
                    >
                        <span className="text-4xl">🎁</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Refresh Button */}
            <button
                onClick={() => window.location.reload()}
                className="absolute top-24 left-4 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border-2 border-white/50 text-slate-500 hover:text-blue-500 active:scale-95 transition-all z-40"
                title="刷新版本"
            >
                <RotateCw className="w-6 h-6" />
            </button>

            {/* 2. Main Character Area */}
            <div className="absolute inset-0 flex items-center justify-center pt-10 z-20">
                {/* Gift Animation Effect */}
                <AnimatePresence>
                    {giftEffect !== null && (
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

                {/* Unified Rabbit and Stickers Container */}
                <div className="relative w-[28vh] h-[28vh] max-w-2xl max-h-2xl flex items-center justify-center">
                    {/* Rabbit (Base Layer) */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePet}
                        className="absolute inset-0 cursor-pointer drop-shadow-2xl filter z-10 flex items-center justify-center"
                    >
                        <Rabbit
                            state={getRabbitState()}
                            equipment={state.equipment}
                            className="w-full h-full"
                        />
                    </motion.div>

                    {/* Freeform Stickers (Saved Outfits) - Layered OVER Rabbit */}
                    {state.placedItems?.map((item) => {
                        const path = `../assets/pixel/${item.itemId}${item.itemId.endsWith('.png') ? '' : '.png'}`;
                        const src = ASSETS[path] || ASSETS[`../assets/pixel/${item.itemId}`];
                        if (!src) return null;

                        return (
                            <motion.div
                                key={item.uiId}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: item.scale,
                                    rotate: item.rotation,
                                    x: '-50%',
                                    y: '-50%',
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                }}
                                className="absolute pointer-events-none"
                                style={{
                                    zIndex: 20 + item.zIndex,
                                }}
                            >
                                <img
                                    src={src as string}
                                    alt="sticker"
                                    className="w-32 h-32 object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Poop System Layer - On top of main area */}
            <PoopSystem
                poops={state.poops}
                onClean={(id) => {
                    actions.scoopPoop(id);
                    addClickEffect(window.innerWidth / 2, window.innerHeight - 150, '💩 铲走了 +2❤️');
                }}
            />

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
                        onClick={() => setShowGameMenu(true)}
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
            {
                timeOfDay === 'night' && (
                    <div className="absolute inset-0 pointer-events-none z-5">
                        <Starfield />
                    </div>
                )
            }

            {/* Modals */}
            <AnimatePresence>
                {/* Game Selection Menu */}
                {showGameMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => setShowGameMenu(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
                                🎮 选择小游戏
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => { setActiveGame('carrot'); setShowGameMenu(false); }}
                                    className="aspect-square bg-orange-50 rounded-2xl border-4 border-orange-200 hover:border-orange-400 hover:bg-orange-100 transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Gamepad2 className="w-10 h-10 text-orange-400 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-xs text-orange-600">接萝卜</span>
                                </button>
                                <button
                                    onClick={() => { setActiveGame('memory'); setShowGameMenu(false); }}
                                    className="aspect-square bg-blue-50 rounded-2xl border-4 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    <BrainCircuit className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-xs text-blue-600">记忆翻牌</span>
                                </button>
                                <button
                                    onClick={() => { setActiveGame('farm'); setShowGameMenu(false); }}
                                    className="aspect-square bg-green-50 rounded-2xl border-4 border-green-200 hover:border-green-400 hover:bg-green-100 transition-all flex flex-col items-center justify-center gap-2 group"
                                >
                                    <Flower className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-xs text-green-600">开心农场</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowGameMenu(false)}
                                className="mt-6 w-full py-3 bg-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-200"
                            >
                                关闭
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Active Game */}
                {activeGame === 'carrot' && (
                    <motion.div
                        key="carrot-game"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="fixed inset-0 z-50"
                    >
                        <CarrotGame onComplete={handleGameComplete} onClose={() => setActiveGame(null)} />
                    </motion.div>
                )}

                {activeGame === 'memory' && (
                    <motion.div
                        key="memory-game"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed inset-0 z-50"
                    >
                        <MemoryGame onComplete={handleGameComplete} onClose={() => setActiveGame(null)} />
                    </motion.div>
                )}

                {activeGame === 'farm' && (
                    <motion.div
                        key="farm-game"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed inset-0 z-50"
                    >
                        <FarmGame onClose={() => setActiveGame(null)} />
                    </motion.div>
                )}

                {showWardrobe && (
                    <DressUpStudio onClose={() => setShowWardrobe(false)} />
                )}
            </AnimatePresence>
        </motion.div >
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

interface Star {
    id: number;
    duration: number;
    delay: number;
    width: number;
    height: number;
    top: number;
    left: number;
}

const Starfield: React.FC = () => {
    const [stars] = useState<Star[]>(() =>
        [...Array(20)].map((_, i) => ({
            id: i,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: Math.random() * 60,
            left: Math.random() * 100,
        }))
    );

    return (
        <div className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: star.duration, delay: star.delay }}
                    className="absolute bg-white rounded-full"
                    style={{
                        width: star.width,
                        height: star.height,
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                    }}
                />
            ))}
        </div>
    );
};
