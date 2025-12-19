import React, { useState, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { CarrotGame } from './CarrotGame';
import { Wardrobe } from './Wardrobe';

// Background images (using gradients for now)
const BACKGROUNDS: Record<string, string> = {
    room: 'linear-gradient(to bottom, #fce7f3, #fbcfe8)',
    garden: 'linear-gradient(to bottom, #bbf7d0, #86efac)',
    beach: 'linear-gradient(to bottom, #7dd3fc, #fde68a)',
};

// Emoji for mood levels
const MOOD_EMOJI = ['😢', '😐', '😊'];
const HUNGER_EMOJI = ['🍽️', '😋', '🥰'];
const CLEAN_EMOJI = ['🛁', '🧼', '✨'];

export const GameContainerV2: React.FC = () => {
    const { state, actions } = useGameState();
    const [showGame, setShowGame] = useState(false);
    const [showWardrobe, setShowWardrobe] = useState(false);
    const [rabbitAnimation, setRabbitAnimation] = useState<'idle' | 'happy' | 'eating'>('idle');
    const [speechBubble, setSpeechBubble] = useState<string | null>(null);

    // Show speech bubble temporarily
    const showBubble = useCallback((text: string) => {
        setSpeechBubble(text);
        setTimeout(() => setSpeechBubble(null), 2000);
    }, []);

    // Action handlers with animations
    const handleFeed = useCallback(() => {
        actions.feed();
        setRabbitAnimation('eating');
        showBubble('好吃！🥕');
        setTimeout(() => setRabbitAnimation('idle'), 2000);
    }, [actions, showBubble]);

    const handleClean = useCallback(() => {
        actions.clean();
        setRabbitAnimation('happy');
        showBubble('好舒服！✨');
        setTimeout(() => setRabbitAnimation('idle'), 1500);
    }, [actions, showBubble]);

    const handlePet = useCallback(() => {
        actions.pet();
        setRabbitAnimation('happy');
        showBubble('谢谢！❤️');
        setTimeout(() => setRabbitAnimation('idle'), 1500);
    }, [actions, showBubble]);

    const handleGameComplete = useCallback((score: number) => {
        actions.earnHearts(score * 2);
        actions.feed(); // Also feed the rabbit
    }, [actions]);

    // Determine rabbit state based on stats
    const getRabbitState = (): 'normal' | 'happy' | 'sad' | 'eating' | 'sleeping' => {
        if (rabbitAnimation === 'eating') return 'eating';
        if (rabbitAnimation === 'happy') return 'happy';
        if (state.hungerLevel === 0 || state.cleanLevel === 0) return 'sad';
        if (state.happyLevel === 2) return 'happy';
        return 'normal';
    };

    return (
        <>
            {/* Main Game */}
            <div
                className="relative w-full h-screen overflow-hidden select-none"
                style={{ background: BACKGROUNDS[state.currentBackground] }}
            >
                {/* Hearts Counter (Top Left) */}
                <button
                    onClick={() => setShowWardrobe(true)}
                    className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <span className="text-2xl">❤️</span>
                    <span className="text-xl font-bold text-pink-500">{state.hearts}</span>
                </button>

                {/* Status Indicators (Top Right) */}
                <div className="absolute top-4 right-4 z-40 flex gap-2">
                    <div className="bg-white/90 backdrop-blur rounded-full px-3 py-2 shadow-lg text-2xl" title="饱食度">
                        {HUNGER_EMOJI[state.hungerLevel]}
                    </div>
                    <div className="bg-white/90 backdrop-blur rounded-full px-3 py-2 shadow-lg text-2xl" title="清洁度">
                        {CLEAN_EMOJI[state.cleanLevel]}
                    </div>
                    <div className="bg-white/90 backdrop-blur rounded-full px-3 py-2 shadow-lg text-2xl" title="心情">
                        {MOOD_EMOJI[state.happyLevel]}
                    </div>
                </div>

                {/* Speech Bubble */}
                {speechBubble && (
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 bg-white rounded-2xl px-6 py-3 shadow-xl animate-bounce">
                        <div className="text-2xl font-bold text-center">{speechBubble}</div>
                        {/* Bubble tail */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-transparent border-t-white" />
                    </div>
                )}

                {/* Rabbit (Clickable) */}
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={handlePet}
                >
                    <div className="transform hover:scale-105 transition-transform">
                        <Rabbit
                            state={getRabbitState()}
                            isDressed={state.currentOutfit !== 'default'}
                        />
                    </div>
                </div>

                {/* Needs Indicators (Floating near rabbit) */}
                {state.hungerLevel === 0 && (
                    <div className="absolute top-1/2 left-1/4 animate-bounce text-4xl">
                        🥕❓
                    </div>
                )}
                {state.cleanLevel === 0 && (
                    <div className="absolute top-1/2 right-1/4 animate-bounce text-4xl">
                        🛁❓
                    </div>
                )}

                {/* Action Buttons (Bottom) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-4">
                    <ActionButton
                        emoji="🥕"
                        label="喂食"
                        onClick={handleFeed}
                        color="bg-orange-400 hover:bg-orange-500"
                    />
                    <ActionButton
                        emoji="🛁"
                        label="洗澡"
                        onClick={handleClean}
                        color="bg-blue-400 hover:bg-blue-500"
                    />
                    <ActionButton
                        emoji="👗"
                        label="衣柜"
                        onClick={() => setShowWardrobe(true)}
                        color="bg-pink-400 hover:bg-pink-500"
                    />
                    <ActionButton
                        emoji="🎮"
                        label="游戏"
                        onClick={() => setShowGame(true)}
                        color="bg-green-400 hover:bg-green-500"
                    />
                </div>

                {/* Decorative elements based on background */}
                {state.currentBackground === 'garden' && (
                    <>
                        <div className="absolute bottom-0 left-4 text-6xl">🌷</div>
                        <div className="absolute bottom-0 right-4 text-6xl">🌻</div>
                        <div className="absolute top-20 right-10 text-4xl">🦋</div>
                    </>
                )}
                {state.currentBackground === 'beach' && (
                    <>
                        <div className="absolute bottom-0 left-4 text-6xl">🏄</div>
                        <div className="absolute bottom-0 right-4 text-6xl">🐚</div>
                        <div className="absolute top-20 right-10 text-4xl">☀️</div>
                    </>
                )}
            </div>

            {/* Mini Game Modal */}
            {showGame && (
                <CarrotGame
                    onComplete={handleGameComplete}
                    onClose={() => setShowGame(false)}
                />
            )}

            {/* Wardrobe Modal */}
            {showWardrobe && (
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
            )}
        </>
    );
};

// Reusable big action button
const ActionButton: React.FC<{
    emoji: string;
    label: string;
    onClick: () => void;
    color: string;
}> = ({ emoji, label, onClick, color }) => (
    <button
        onClick={onClick}
        className={`
      ${color} 
      w-20 h-20 rounded-2xl shadow-lg 
      flex flex-col items-center justify-center gap-1
      transform hover:scale-110 active:scale-95 transition-all
      border-4 border-white/50
    `}
    >
        <span className="text-3xl">{emoji}</span>
        <span className="text-xs font-bold text-white">{label}</span>
    </button>
);
