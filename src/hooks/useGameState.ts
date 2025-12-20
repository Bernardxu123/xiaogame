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
    // New Freeform System
    placedItems: PlacedItem[];
    // Poop System
    poops: { id: number; x: number; y: number }[];

    currentBackground: string;
    unlockedItems: string[]; // IDs of unlocked items
    unlockedBackgrounds: string[]; // IDs of unlocked backgrounds

    // Timestamps
    lastInteraction: number;
    lastGiftClaimed: number; // Unix timestamp
}

export interface PlacedItem {
    uiId: string;       // Unique ID for this instance (timestamp + random)
    itemId: string;     // Asset ID
    x: number;          // Relative X %
    y: number;          // Relative Y %
    scale: number;      // Scale multiplier
    rotation: number;   // Rotation degrees
    zIndex: number;     // Layer order
}

const DEFAULT_STATE: GameState = {
    hungerLevel: 2,
    cleanLevel: 2,
    happyLevel: 2,
    hearts: 0,
    level: 1,
    totalHeartsEarned: 0,
    equipment: {},
    placedItems: [],
    poops: [{ id: 1, x: 50, y: 25 }],
    currentBackground: 'room',
    unlockedItems: ['default'],
    unlockedBackgrounds: ['room'],
    lastInteraction: Date.now(),
    lastGiftClaimed: 0,
};

const STORAGE_KEY = 'rabbit-care-kids-v3';
const API_BASE = 'http://localhost:3001/api/game';

// Helper: Generate or retrieve a unique device ID for cloud sync
function getDeviceId(): string {
    const key = 'rabbit-care-device-id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(key, id);
    }
    return id;
}

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
    { id: 'garden', name: '阳光花园', unlocked: false },
    { id: 'beach', name: '夏日海滩', unlocked: false },
    { id: 'candy', name: '糖果乐园', unlocked: false },
    { id: 'night', name: '梦幻星空', unlocked: false },
    { id: 'studio', name: '时尚工坊', unlocked: true },
];

export const UNLOCK_COSTS = {
    background: 100,
};

export function useGameState() {
    const [state, setState] = useState<GameState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure poops exists and is an array. If empty, give it the default test poop for now.
                const poops = (parsed.poops && Array.isArray(parsed.poops) && parsed.poops.length > 0)
                    ? parsed.poops
                    : DEFAULT_STATE.poops;

                return { ...DEFAULT_STATE, ...parsed, poops };
            }
        } catch (e) {
            console.warn('Failed to load game state:', e);
        }
        return DEFAULT_STATE;
    });

    // Auto-save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save game state:', e);
        }
    }, [state]);

    // Cloud sync: Save to server (debounced)
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(0);

    const syncToCloud = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const deviceId = getDeviceId();
            const response = await fetch(`${API_BASE}/${deviceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hungerLevel: state.hungerLevel,
                    cleanLevel: state.cleanLevel,
                    happyLevel: state.happyLevel,
                    hearts: state.hearts,
                    level: state.level,
                    totalHeartsEarned: state.totalHeartsEarned,
                    equipment: state.equipment,
                    placedItems: state.placedItems,
                    poops: state.poops,
                    currentBackground: state.currentBackground,
                    unlockedItems: state.unlockedItems,
                    unlockedBackgrounds: state.unlockedBackgrounds,
                    lastInteraction: state.lastInteraction,
                    lastGiftClaimed: state.lastGiftClaimed,
                }),
            });
            if (response.ok) {
                setLastSyncTime(Date.now());
                console.log('[Cloud] Synced successfully');
            }
        } catch (e) {
            console.warn('[Cloud] Sync failed:', e);
        } finally {
            setIsSyncing(false);
        }
    }, [state, isSyncing]);

    const loadFromCloud = useCallback(async () => {
        try {
            const deviceId = getDeviceId();
            const response = await fetch(`${API_BASE}/${deviceId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const cloudState = result.data;
                    // Merge cloud state, prioritizing newer data
                    if (cloudState.lastSaveTime > state.lastInteraction) {
                        setState(prev => ({ ...prev, ...cloudState }));
                        console.log('[Cloud] Loaded from cloud');
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn('[Cloud] Load failed:', e);
        }
        return false;
    }, [state.lastInteraction]);

    // Auto-sync to cloud every 30 seconds if state changed
    useEffect(() => {
        const timer = setInterval(() => {
            if (Date.now() - lastSyncTime > 30000) {
                syncToCloud();
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [syncToCloud, lastSyncTime]);

    // Decay stats over time
    useEffect(() => {
        const timer = setInterval(() => {
            setState(prev => {
                const newHunger = Math.max(0, prev.hungerLevel - 1);
                const newClean = Math.max(0, prev.cleanLevel - 1);

                let newPoops = prev.poops;
                // Aggressive spawning for testing: always spawn if cleanLevel < 2
                if (newClean < 2 && prev.poops.length < 10) {
                    newPoops = [
                        ...prev.poops,
                        {
                            id: Date.now() + Math.random(),
                            x: 10 + Math.random() * 80,
                            y: 25 + Math.random() * 20 // Move up a bit (25-45% of bottom half)
                        }
                    ];
                }

                return {
                    ...prev,
                    hungerLevel: newHunger,
                    cleanLevel: newClean,
                    poops: newPoops,
                    happyLevel: newHunger === 0 || newClean === 0
                        ? Math.max(0, prev.happyLevel - 1)
                        : prev.happyLevel,
                };
            });
        }, 45000); // 45 seconds for a balanced gameplay loop
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
        setState(prev => ({
            ...prev,
            cleanLevel: 2,
            poops: [], // Cleaning removes all poops
            happyLevel: Math.min(2, prev.happyLevel + 1)
        }));
    }, [updateProgression]);

    const scoopPoop = useCallback((id: number) => {
        updateProgression(2); // Small reward for scooping
        setState(prev => ({
            ...prev,
            poops: prev.poops.filter(p => p.id !== id),
            // Scooping improves cleanliness slightly? Maybe not full level up, but helps.
            // For now, simple interaction.
        }));
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
        isSyncing,
        actions: {
            feed, clean, pet, earnHearts, claimDailyGift, scoopPoop,
            unlockItem, equipItem,
            unlockBackground, setBackground,
            saveOutfit: (items: PlacedItem[]) => setState(prev => ({ ...prev, placedItems: items })),
            syncToCloud,
            loadFromCloud,
        },
    };
}
