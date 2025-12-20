import React from 'react';
import { motion } from 'framer-motion';
import { ALL_ITEMS, ALL_BACKGROUNDS, UNLOCK_COSTS, type GameItem } from '../hooks/useGameState';

// Background Assets for Thumbnails
import bgRoom from '../assets/pixel/bg_room.jpg';
import bgGarden from '../assets/pixel/bg_garden.png';
import bgBeach from '../assets/pixel/bg_beach.png';
import bgCandy from '../assets/pixel/bg_candy.png';
import bgNight from '../assets/pixel/bg_night.png';

const BG_THUMBS: Record<string, string> = {
    room: bgRoom,
    garden: bgGarden,
    beach: bgBeach,
    candy: bgCandy,
    night: bgNight,
};

// Item Assets for Thumbnails
const ITEM_ASSETS = import.meta.glob('../assets/pixel/*.png', { eager: true, as: 'url' });

interface WardrobeProps {
    hearts: number;
    unlockedItems: string[];
    unlockedBackgrounds: string[];
    equipment: { head?: string; body?: string; hand?: string };
    currentBackground: string;
    onUnlockItem: (id: string) => void;
    onEquipItem: (id: string | null, type: 'head' | 'body' | 'hand') => void;
    onUnlockBackground: (id: string) => void;
    onSetBackground: (id: string) => void;
    onClose: () => void;
}

export const Wardrobe: React.FC<WardrobeProps> = ({
    hearts,
    unlockedItems,
    unlockedBackgrounds,
    equipment,
    currentBackground,
    onUnlockItem,
    onEquipItem,
    onUnlockBackground,
    onSetBackground,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-4xl h-[80vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-red-100 p-2 rounded-full hover:bg-red-200 transition-colors"
                >
                    ❌
                </button>

                {/* Left Side: Wardrobe / Items */}
                <div className="flex-1 bg-pink-50/50 p-6 overflow-y-auto">
                    <h2 className="text-3xl font-black text-pink-500 mb-6 flex items-center gap-2">
                        <span>👗</span> 魔法衣橱
                        <span className="text-lg text-pink-400 ml-auto">❤️ {hearts}</span>
                    </h2>

                    <div className="space-y-8">
                        {/* Clothing & Accessories */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-600 mb-4">我的服饰</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {ALL_ITEMS.map((item) => {
                                    const isUnlocked = unlockedItems.includes(item.id);
                                    const isEquipped = equipment[item.type] === item.id;

                                    return (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            isUnlocked={isUnlocked}
                                            isEquipped={isEquipped}
                                            onUnlock={() => onUnlockItem(item.id)}
                                            onEquip={() => onEquipItem(isEquipped ? null : item.id, item.type)}
                                        />
                                    );
                                })}
                            </div>
                        </section>

                        {/* Backgrounds */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-600 mb-4">场景切换</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {ALL_BACKGROUNDS.map((bg) => {
                                    const isUnlocked = unlockedBackgrounds.includes(bg.id);
                                    const isCurrent = currentBackground === bg.id;

                                    return (
                                        <div
                                            key={bg.id}
                                            onClick={() => {
                                                if (isUnlocked) onSetBackground(bg.id);
                                                else onUnlockBackground(bg.id);
                                            }}
                                            className={`
                                                relative h-24 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all
                                                ${isCurrent ? 'border-green-500 scale-105 shadow-lg' : 'border-white hover:border-blue-300'}
                                                ${!isUnlocked ? 'grayscale opacity-70' : ''}
                                            `}
                                        >
                                            <img
                                                src={BG_THUMBS[bg.id]}
                                                alt={bg.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-md text-lg bg-black/20">
                                                {bg.name}
                                            </div>
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold flex-col">
                                                    <span>🔒</span>
                                                    <span className="text-xs">{UNLOCK_COSTS.background} ❤️</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="w-full md:w-1/3 bg-blue-50/30 p-6 flex flex-col items-center justify-center border-l border-white/50">
                    <div className="text-center text-slate-500 mb-4">
                        点一点衣服试穿哦！
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ItemCard: React.FC<{
    item: GameItem;
    isUnlocked: boolean;
    isEquipped: boolean;
    onUnlock: () => void;
    onEquip: () => void;
}> = ({ item, isUnlocked, isEquipped, onUnlock, onEquip }) => {
    // Get image URL from glob
    const imgPath = `../assets/pixel/${item.image}`;
    const imgSrc = ITEM_ASSETS[imgPath];

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isUnlocked ? onEquip : onUnlock}
            className={`
                aspect-square rounded-xl p-1.5 flex flex-col items-center justify-center gap-0.5 cursor-pointer
                border-2 shadow-sm transition-colors relative
                ${isEquipped ? 'bg-green-100 border-green-500' : 'bg-white border-white hover:border-pink-300'}
            `}
        >
            <div className="w-10 h-10 flex items-center justify-center">
                {imgSrc ? (
                    <img src={imgSrc} alt={item.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                ) : (
                    <span className="text-2xl">{item.icon}</span>
                )}
            </div>
            <div className="text-[9px] font-bold text-slate-600 truncate w-full text-center">{item.name}</div>

            {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                    <span className="text-sm">🔒</span>
                    <span className="text-[10px] font-bold">{item.cost}</span>
                </div>
            )}

            {isEquipped && (
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-white">
                    ✓
                </div>
            )}
        </motion.div>
    );
};
