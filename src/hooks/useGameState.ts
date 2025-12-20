import { useState, useEffect, useCallback } from 'react';
import assetMap from '../assets/asset_map.json';

// Types
export interface GameItem {
    id: string;
    name: string;
    type: 'head' | 'body' | 'hand';
    cost: number; // cost in hearts
    icon: string; // Emoji fallback, but we primarily use images now
    image: string; // Filename for the asset
}


export interface Background {
    id: string;
    name: string;
    unlocked: boolean;
}

export interface GameState {
    // Core stats (simplified: 0=sad, 1=neutral, 2=happy)
    hungerLevel: number; // 0-2
    cleanLevel: number;  // 0-2
    happyLevel: number;  // 0-2

    // Progression
    hearts: number;
    level: number;
    totalHeartsEarned: number;

    // Equipment & Inventory
    equipment: {
        head?: string;
        body?: string;
        hand?: string;
    };
    currentBackground: string;
    unlockedItems: string[]; // IDs of unlocked items
    unlockedBackgrounds: string[]; // IDs of unlocked backgrounds

    // Timestamps
    lastInteraction: number;
    lastGiftClaimed: number; // Unix timestamp
}

const DEFAULT_STATE: GameState = {
    hungerLevel: 2,
    cleanLevel: 2,
    happyLevel: 2,
    hearts: 0,
    level: 1,
    totalHeartsEarned: 0,
    equipment: {},
    currentBackground: 'room',
    unlockedItems: ['default'],
    unlockedBackgrounds: ['room'],
    lastInteraction: Date.now(),
    lastGiftClaimed: 0,
};

const STORAGE_KEY = 'rabbit-care-kids-v3';

// All available content populated from asset map
export const ALL_ITEMS: GameItem[] = assetMap
    .filter(item => item.type === 'head' || item.type === 'body' || item.type === 'hand')
    .map(item => ({
        id: item.new.replace('.png', ''), // ID is filename without extension
        name: item.name,
        type: item.type as 'head' | 'body' | 'hand',
        cost: item.cost,
        icon: item.icon,
        image: item.new // Now located in standard pixel folder
    }));


export const ALL_BACKGROUNDS: Background[] = [
    { id: 'room', name: '温馨小屋', unlocked: true },
    { id: 'garden', name: '花园', unlocked: false },
    { id: 'beach', name: '海边', unlocked: false },
];

export const UNLOCK_COSTS = {
    background: 100,
};

export function useGameState() {
    const [state, setState] = useState<GameState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                // Merge with default ensuring new fields exist
                return { ...DEFAULT_STATE, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load game state:', e);
        }
        return DEFAULT_STATE;
    });

    // Auto-save
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save game state:', e);
        }
    }, [state]);

    // Decay stats over time
    useEffect(() => {
        const timer = setInterval(() => {
            setState(prev => {
                const timeSinceLastInteraction = Date.now() - prev.lastInteraction;
                if (timeSinceLastInteraction > 120000) {
                    return {
                        ...prev,
                        hungerLevel: Math.max(0, prev.hungerLevel - 1),
                        cleanLevel: Math.max(0, prev.cleanLevel - 1),
                        happyLevel: prev.hungerLevel === 0 || prev.cleanLevel === 0
                            ? Math.max(0, prev.happyLevel - 1)
                            : prev.happyLevel,
                        lastInteraction: Date.now(),
                    };
                }
                return prev;
            });
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Progression Utils
    const getRequiredXP = (lvl: number) => lvl * 100;

    const updateProgression = useCallback((amount: number) => {
        setState(prev => {
            const newHearts = prev.hearts + amount;
            const newTotal = prev.totalHeartsEarned + amount;

            let currentLvl = prev.level;
            let needed = getRequiredXP(currentLvl);
            while (newTotal >= needed) {
                currentLvl++;
                needed += getRequiredXP(currentLvl);
            }

            return {
                ...prev,
                hearts: newHearts,
                totalHeartsEarned: newTotal,
                level: currentLvl,
                lastInteraction: Date.now(),
            };
        });
    }, []);

    // Actions
    const feed = useCallback(() => {
        updateProgression(5);
        setState(prev => ({ ...prev, hungerLevel: 2, happyLevel: Math.min(2, prev.happyLevel + 1) }));
    }, [updateProgression]);

    const clean = useCallback(() => {
        updateProgression(5);
        setState(prev => ({ ...prev, cleanLevel: 2, happyLevel: Math.min(2, prev.happyLevel + 1) }));
    }, [updateProgression]);

    const pet = useCallback(() => {
        updateProgression(3);
        setState(prev => ({ ...prev, happyLevel: 2 }));
    }, [updateProgression]);

    const earnHearts = useCallback((amount: number) => updateProgression(amount), [updateProgression]);

    const claimDailyGift = useCallback(() => {
        const now = Date.now();
        if (now - state.lastGiftClaimed > 24 * 60 * 60 * 1000) {
            const giftAmount = 50 + Math.floor(Math.random() * 51);
            updateProgression(giftAmount);
            setState(prev => ({ ...prev, lastGiftClaimed: now }));
            return giftAmount;
        }
        return 0;
    }, [state.lastGiftClaimed, updateProgression]);

    const unlockItem = useCallback((itemId: string) => {
        const item = ALL_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        setState(prev => {
            if (prev.hearts < item.cost || prev.unlockedItems.includes(itemId)) return prev;
            return {
                ...prev,
                hearts: prev.hearts - item.cost,
                unlockedItems: [...prev.unlockedItems, itemId],
            };
        });
    }, []);

    const equipItem = useCallback((itemId: string | null, type: 'head' | 'body' | 'hand') => {
        setState(prev => ({
            ...prev,
            equipment: {
                ...prev.equipment,
                [type]: itemId || undefined,
            }
        }));
    }, []);

    const unlockBackground = useCallback((id: string) => {
        setState(prev => {
            if (prev.hearts < UNLOCK_COSTS.background || prev.unlockedBackgrounds.includes(id)) return prev;
            return {
                ...prev,
                hearts: prev.hearts - UNLOCK_COSTS.background,
                unlockedBackgrounds: [...prev.unlockedBackgrounds, id]
            };
        });
    }, []);

    const setBackground = useCallback((id: string) => {
        setState(prev => ({ ...prev, currentBackground: id }));
    }, []);

    return {
        state,
        actions: {
            feed, clean, pet, earnHearts, claimDailyGift,
            unlockItem, equipItem,
            unlockBackground, setBackground,
        },
    };
}
