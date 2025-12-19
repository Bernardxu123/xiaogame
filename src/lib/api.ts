// API client for communicating with backend

const API_BASE = 'http://localhost:3001/api';

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

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Generate or retrieve a unique player ID
export function getPlayerId(): string {
    let id = localStorage.getItem('rabbit-care-player-id');
    if (!id) {
        id = `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('rabbit-care-player-id', id);
    }
    return id;
}

// Load game state from server
const LOCAL_STORAGE_KEY_PREFIX = 'rabbit-care-save-';

// Helper to save locally
function saveLocally(playerId: string, state: SaveGameRequest) {
    try {
        const fullState: GameState = {
            id: playerId,
            ...state,
            lastSaveTime: Date.now()
        };
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${playerId}`, JSON.stringify(fullState));
        console.log('Saved to LocalStorage (Fallback)');
        return true;
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
        return false;
    }
}

// Helper to load locally
function loadLocally(playerId: string): GameState | null {
    try {
        const data = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${playerId}`);
        if (data) {
            console.log('Loaded from LocalStorage (Fallback)');
            return JSON.parse(data) as GameState;
        }
    } catch (e) {
        console.warn('LocalStorage load failed:', e);
    }
    return null;
}

// Load game state (Try Server -> Fail -> Try LocalStorage)
export async function loadGame(playerId: string): Promise<GameState | null> {
    // Try Server
    try {
        const response = await fetch(`${API_BASE}/game/${playerId}`);
        if (response.ok) {
            const result: ApiResponse<GameState> = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
        }
    } catch {
        // Server offline or unreachable
    }

    // Fallback to LocalStorage
    return loadLocally(playerId);
}

// Save game state to server
// Save game state (Try Server -> Always Save LocalStorage too for safety)
export async function saveGame(playerId: string, state: SaveGameRequest): Promise<boolean> {
    let serverSuccess = false;

    // Try Server
    try {
        const response = await fetch(`${API_BASE}/game/${playerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state)
        });
        const result: ApiResponse<GameState> = await response.json();
        serverSuccess = result.success;
    } catch {
        // Server offline
    }

    // Always save locally as backup/sync
    const localSuccess = saveLocally(playerId, state);

    return serverSuccess || localSuccess;
}

// Delete game save
export async function deleteGame(playerId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/game/${playerId}`, {
            method: 'DELETE'
        });
        const result: ApiResponse<{ deleted: boolean }> = await response.json();
        return result.success;
    } catch (error) {
        console.error('Failed to delete game:', error);
        return false;
    }
}
