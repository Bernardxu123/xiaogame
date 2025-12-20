// Shared types between frontend and backend

export interface Poop {
    id: number;
    x: number;
    y: number;
}

export interface PlacedItem {
    uiId: string;
    itemId: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    zIndex: number;
}

export interface Equipment {
    head?: string;
    body?: string;
    hand?: string;
}

export interface GameState {
    id: string;
    // Core stats (0-2 scale)
    hungerLevel: number;
    cleanLevel: number;
    happyLevel: number;
    // Progression
    hearts: number;
    level: number;
    totalHeartsEarned: number;
    // Equipment & Inventory
    equipment: Equipment;
    placedItems: PlacedItem[];
    poops: Poop[];
    // Backgrounds & Unlocks
    currentBackground: string;
    unlockedItems: string[];
    unlockedBackgrounds: string[];
    // Timestamps
    lastInteraction: number;
    lastGiftClaimed: number;
    lastSaveTime: number;
}

export interface SaveGameRequest {
    hungerLevel: number;
    cleanLevel: number;
    happyLevel: number;
    hearts: number;
    level: number;
    totalHeartsEarned: number;
    equipment: Equipment;
    placedItems: PlacedItem[];
    poops: Poop[];
    currentBackground: string;
    unlockedItems: string[];
    unlockedBackgrounds: string[];
    lastInteraction: number;
    lastGiftClaimed: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
