// Shared types between frontend and backend

export interface Poop {
    id: number;
    x: number;
    y: number;
}

export interface GameState {
    id: string;
    hunger: number;
    cleanliness: number;
    happiness: number;
    isDressed: boolean;
    isSleeping: boolean;
    poops: Poop[];
    lastSaveTime: number;
}

export interface SaveGameRequest {
    hunger: number;
    cleanliness: number;
    happiness: number;
    isDressed: boolean;
    isSleeping: boolean;
    poops: Poop[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
