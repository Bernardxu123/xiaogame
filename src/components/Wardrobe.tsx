import React from 'react';
import { ALL_OUTFITS, ALL_BACKGROUNDS, UNLOCK_COSTS } from '../hooks/useGameState';

interface WardrobeProps {
    hearts: number;
    currentOutfit: string;
    currentBackground: string;
    unlockedOutfits: string[];
    unlockedBackgrounds: string[];
    onEquipOutfit: (id: string) => void;
    onSetBackground: (id: string) => void;
    onUnlock: (type: 'outfit' | 'background', id: string) => void;
    onClose: () => void;
}

export const Wardrobe: React.FC<WardrobeProps> = ({
    hearts,
    currentOutfit,
    currentBackground,
    unlockedOutfits,
    unlockedBackgrounds,
    onEquipOutfit,
    onSetBackground,
    onUnlock,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-pink-100 to-purple-100 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-auto shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-700">👗 衣柜</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-xl">❤️ {hearts}</span>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-red-400 hover:bg-red-500 rounded-full text-white text-xl shadow"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Outfits Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-purple-600 mb-3">🎀 衣服</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {ALL_OUTFITS.map(outfit => {
                            const isUnlocked = unlockedOutfits.includes(outfit.id);
                            const isEquipped = currentOutfit === outfit.id;

                            return (
                                <button
                                    key={outfit.id}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            onEquipOutfit(outfit.id);
                                        } else if (hearts >= UNLOCK_COSTS.outfit) {
                                            onUnlock('outfit', outfit.id);
                                        }
                                    }}
                                    disabled={!isUnlocked && hearts < UNLOCK_COSTS.outfit}
                                    className={`
                    p-4 rounded-2xl text-center transition-all
                    ${isEquipped
                                            ? 'bg-purple-500 text-white ring-4 ring-yellow-400'
                                            : isUnlocked
                                                ? 'bg-white hover:bg-purple-100'
                                                : hearts >= UNLOCK_COSTS.outfit
                                                    ? 'bg-gray-200 hover:bg-yellow-100 cursor-pointer'
                                                    : 'bg-gray-300 opacity-50 cursor-not-allowed'
                                        }
                  `}
                                >
                                    <div className="text-3xl mb-1">
                                        {outfit.id === 'default' && '🐰'}
                                        {outfit.id === 'pink-dress' && '👗'}
                                        {outfit.id === 'blue-hat' && '🎩'}
                                        {outfit.id === 'star-cape' && '🌟'}
                                    </div>
                                    <div className="text-sm font-medium">{outfit.name}</div>
                                    {!isUnlocked && (
                                        <div className="text-xs text-orange-500 mt-1">
                                            🔒 {UNLOCK_COSTS.outfit} ❤️
                                        </div>
                                    )}
                                    {isEquipped && (
                                        <div className="text-xs mt-1">✓ 穿着中</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Backgrounds Section */}
                <div>
                    <h3 className="text-lg font-bold text-purple-600 mb-3">🏠 背景</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {ALL_BACKGROUNDS.map(bg => {
                            const isUnlocked = unlockedBackgrounds.includes(bg.id);
                            const isActive = currentBackground === bg.id;

                            return (
                                <button
                                    key={bg.id}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            onSetBackground(bg.id);
                                        } else if (hearts >= UNLOCK_COSTS.background) {
                                            onUnlock('background', bg.id);
                                        }
                                    }}
                                    disabled={!isUnlocked && hearts < UNLOCK_COSTS.background}
                                    className={`
                    p-3 rounded-xl text-center transition-all
                    ${isActive
                                            ? 'bg-purple-500 text-white ring-4 ring-yellow-400'
                                            : isUnlocked
                                                ? 'bg-white hover:bg-purple-100'
                                                : hearts >= UNLOCK_COSTS.background
                                                    ? 'bg-gray-200 hover:bg-yellow-100 cursor-pointer'
                                                    : 'bg-gray-300 opacity-50 cursor-not-allowed'
                                        }
                  `}
                                >
                                    <div className="text-2xl mb-1">
                                        {bg.id === 'room' && '🏠'}
                                        {bg.id === 'garden' && '🌸'}
                                        {bg.id === 'beach' && '🏖️'}
                                    </div>
                                    <div className="text-xs font-medium">{bg.name}</div>
                                    {!isUnlocked && (
                                        <div className="text-[10px] text-orange-500 mt-1">
                                            🔒 {UNLOCK_COSTS.background}❤️
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
