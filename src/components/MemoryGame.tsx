import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RefreshCcw, Check } from 'lucide-react';

// Card content assets (reuse existing pixel art)
const ASSETS = import.meta.glob('../assets/pixel/*.png', { eager: true, as: 'url' });

// Select some specific items for card faces
const CARD_ICONS = [
    'hand_carrot',
    'hand_icecream',
    'hand_coffee',
    'head_beanie',
    'head_flower_crown',
    'body_dress_pink',
    'body_overalls_blue',
    'bg_garden'
];

interface Card {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface MemoryGameProps {
    onClose: () => void;
    onComplete: (score: number) => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onClose, onComplete }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [isLocked, setIsLocked] = useState(false);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    // Game Logic
    const checkForMatch = useCallback((id1: number, id2: number, currentCards: Card[]) => {
        const card1 = currentCards.find(c => c.id === id1);
        const card2 = currentCards.find(c => c.id === id2);

        if (card1 && card2 && card1.icon === card2.icon) {
            // Match!
            setTimeout(() => {
                setCards(prev => {
                    const newCards = prev.map(c =>
                        (c.id === id1 || c.id === id2) ? { ...c, isMatched: true, isFlipped: true } : c
                    );

                    // Check win inside the update to ensure we have latest state
                    const matchedCount = newCards.filter(c => c.isMatched).length;
                    if (matchedCount === newCards.length) {
                        setGameWon(true);
                        // Score calculation logic is handled in handleClaim
                        // But here we set gameWon to show modal.
                    }
                    return newCards;
                });
                setFlippedCards([]);
                setIsLocked(false);
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                setCards(prev => prev.map(c =>
                    (c.id === id1 || c.id === id2) ? { ...c, isFlipped: false } : c
                ));
                setFlippedCards([]);
                setIsLocked(false);
            }, 1000);
        }
    }, [moves]);

    const startNewGame = useCallback(() => {
        // Create pairs
        const initialCards: Card[] = [];
        const gameIcons = CARD_ICONS.slice(0, 6); // 6 pairs

        gameIcons.forEach((icon) => {
            initialCards.push({ id: Math.random(), icon, isFlipped: false, isMatched: false });
            initialCards.push({ id: Math.random(), icon, isFlipped: false, isMatched: false });
        });

        // Shuffle
        initialCards.sort(() => Math.random() - 0.5);

        // Re-assign distinct IDs
        setCards(initialCards.map((c, i) => ({ ...c, id: i })));
        setFlippedCards([]);
        setMoves(0);
        setGameWon(false);
        setIsLocked(false);
    }, []);

    // Initialize
    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    const handleCardClick = (id: number) => {
        if (isLocked) return;
        if (flippedCards.includes(id)) return;

        const card = cards.find(c => c.id === id);
        if (!card || card.isMatched) return;

        // Flip logic
        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

        if (newFlipped.length === 2) {
            setIsLocked(true);
            setMoves(m => m + 1);
            checkForMatch(newFlipped[0], newFlipped[1], cards);
        }
    };

    const handleClaim = () => {
        const reward = Math.max(10, 50 - moves * 2);
        onComplete(reward);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-amber-50 rounded-3xl p-6 shadow-2xl w-full max-w-lg border-4 border-amber-200 relative flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-amber-600">🥕 记忆大考验</h2>
                        <span className="text-amber-400 font-bold">步数: {moves}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={startNewGame} className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-4 gap-3 bg-amber-100 p-3 rounded-2xl">
                    {cards.map(card => (
                        <CardView
                            key={card.id}
                            card={card}
                            onClick={() => handleCardClick(card.id)}
                        />
                    ))}
                </div>

                {/* Win Modal Overlay */}
                <AnimatePresence>
                    {gameWon && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-white/95 backdrop-blur rounded-3xl flex flex-col items-center justify-center z-10 m-2 border-2 border-amber-100 shadow-xl"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-lg mb-4 fill-yellow-100" />
                            </motion.div>
                            <h3 className="text-3xl font-black text-slate-700 mb-2">挑战成功！</h3>
                            <p className="text-slate-500 mb-6 font-medium">使用了 {moves} 步，获得 {Math.max(10, 50 - moves * 2)} 爱心</p>
                            <button
                                onClick={handleClaim}
                                className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Check className="w-6 h-6 stroke-[3]" /> 领取奖励
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

const CardView: React.FC<{ card: Card; onClick: () => void }> = ({ card, onClick }) => {
    // Helper to get image
    const getAssetSrc = (name: string) => {
        // Handle explicit paths or IDs. 
        // Our assets map might use slightly different keys depending on glob result.
        // Try exact match, then relative path match.
        const path = `../assets/pixel/${name}.png`;
        return ASSETS[path];
    };

    return (
        <motion.div
            className="aspect-square relative cursor-pointer group"
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="w-full h-full rounded-xl transition-all duration-500 relative preserve-3d"
                animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front (Card Back design) */}
                <div
                    className="absolute inset-0 backface-hidden bg-amber-300 rounded-xl border-b-[4px] border-r-[4px] border-amber-400 flex items-center justify-center shadow-sm"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <span className="text-3xl opacity-50 select-none">🐇</span>
                </div>

                {/* Back (Revealed Icon) */}
                <div
                    className="absolute inset-0 backface-hidden bg-white rounded-xl border-2 border-amber-200 flex items-center justify-center shadow-inner overflow-hidden"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                    {card.isMatched && (
                        <div className="absolute inset-0 bg-green-400/20 z-10 flex items-center justify-center">
                            <Check className="w-8 h-8 text-green-500 drop-shadow-md stroke-[3]" />
                        </div>
                    )}
                    <img src={getAssetSrc(card.icon)} className="w-[70%] h-[70%] object-contain pixelated" style={{ imageRendering: 'pixelated' }} />
                </div>
            </motion.div>
        </motion.div>
    );
};
