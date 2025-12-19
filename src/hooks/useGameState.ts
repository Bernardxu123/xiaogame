import { useState, useEffect, useCallback } from 'react';

// Types
export interface Outfit {
    id: string;
    name: string;
    unlocked: boolean;
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
    currentOutfit: string;
    currentBackground: string;
    unlockedOutfits: string[];
    unlockedBackgrounds: string[];

    // Timestamps
    lastInteraction: number;
    lastGiftClaimed: number; // Unix timestamp for daily gift
}

const DEFAULT_STATE: GameState = {
    hungerLevel: 2,
    cleanLevel: 2,
    happyLevel: 2,
    hearts: 0,
    level: 1,
    totalHeartsEarned: 0,
    currentOutfit: 'default',
    currentBackground: 'room',
    unlockedOutfits: ['default'],
    unlockedBackgrounds: ['room'],
    lastInteraction: Date.now(),
    lastGiftClaimed: 0,
};

const STORAGE_KEY = 'rabbit-care-kids-v2';

// All available content
export const ALL_OUTFITS: Outfit[] = [
    { id: 'default', name: '默认', unlocked: true },
    { id: 'pink-dress', name: '粉色裙子', unlocked: false },
    { id: 'blue-hat', name: '蓝色帽子', unlocked: false },
    { id: 'star-cape', name: '星星披风', unlocked: false },
];

export const ALL_BACKGROUNDS: Background[] = [
    { id: 'room', name: '温馨小屋', unlocked: true },
    { id: 'garden', name: '花园', unlocked: false },
    { id: 'beach', name: '海边', unlocked: false },
];

export const UNLOCK_COSTS = {
    outfit: 50,
    background: 100,
};

export function useGameState() {
    const [state, setState] = useState<GameState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_STATE, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load game state:', e);
        }
        return DEFAULT_STATE;
    });

    // Auto-save on state change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save game state:', e);
        }
    }, [state]);

    // Decay stats over time (very slow, kid-friendly)
    useEffect(() => {
        const timer = setInterval(() => {
            setState(prev => {
                const timeSinceLastInteraction = Date.now() - prev.lastInteraction;
                // Only decay if no interaction for 2 minutes
                if (timeSinceLastInteraction > 120000) {
                    return {
                        ...prev,
                        hungerLevel: Math.max(0, prev.hungerLevel - 1),
                        cleanLevel: Math.max(0, prev.cleanLevel - 1),
                        // Happiness decays slower
                        happyLevel: prev.hungerLevel === 0 || prev.cleanLevel === 0
                            ? Math.max(0, prev.happyLevel - 1)
                            : prev.happyLevel,
                        lastInteraction: Date.now(), // Reset timer after decay
                    };
                }
                return prev;
            });
        }, 60000); // Check every minute

        return () => clearInterval(timer);
    }, []);

    // Progression Logic: Level Up
    const getRequiredXP = (lvl: number) => lvl * 100;

    const updateProgression = useCallback((amount: number) => {
        setState(prev => {
            const newHearts = prev.hearts + amount;
            const newTotal = prev.totalHeartsEarned + amount;

            // Calculate level based on total earned
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
        setState(prev => ({
            ...prev,
            hungerLevel: 2,
            happyLevel: Math.min(2, prev.happyLevel + 1),
        }));
    }, [updateProgression]);

    const clean = useCallback(() => {
        updateProgression(5);
        setState(prev => ({
            ...prev,
            cleanLevel: 2,
            happyLevel: Math.min(2, prev.happyLevel + 1),
        }));
    }, [updateProgression]);

    const pet = useCallback(() => {
        updateProgression(3);
        setState(prev => ({
            ...prev,
            happyLevel: 2,
        }));
    }, [updateProgression]);

    const earnHearts = useCallback((amount: number) => {
        updateProgression(amount);
    }, [updateProgression]);

    const claimDailyGift = useCallback(() => {
        const now = Date.now();
        const canClaim = now - state.lastGiftClaimed > 24 * 60 * 60 * 1000;

        if (canClaim) {
            const giftAmount = 50 + Math.floor(Math.random() * 51); // 50-100 hearts
            updateProgression(giftAmount);
            setState(prev => ({ ...prev, lastGiftClaimed: now }));
            return giftAmount;
        }
        return 0;
    }, [state.lastGiftClaimed, updateProgression]);

    const unlockItem = useCallback((type: 'outfit' | 'background', id: string) => {
        const cost = type === 'outfit' ? UNLOCK_COSTS.outfit : UNLOCK_COSTS.background;

        setState(prev => {
            if (prev.hearts < cost) return prev;

            const key = type === 'outfit' ? 'unlockedOutfits' : 'unlockedBackgrounds';
            if (prev[key].includes(id)) return prev;

            return {
                ...prev,
                hearts: prev.hearts - cost,
                [key]: [...prev[key], id],
            };
        });
    }, []);

    const equipOutfit = useCallback((id: string) => {
        setState(prev => {
            if (!prev.unlockedOutfits.includes(id)) return prev;
            return { ...prev, currentOutfit: id };
        });
    }, []);

    const setBackground = useCallback((id: string) => {
        setState(prev => {
            if (!prev.unlockedBackgrounds.includes(id)) return prev;
            return { ...prev, currentBackground: id };
        });
    }, []);

    return {
        state,
        actions: {
            feed,
            clean,
            pet,
            earnHearts,
            claimDailyGift,
            unlockItem,
            equipOutfit,
            setBackground,
        },
    };
}
