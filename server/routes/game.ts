import { Router, Request, Response } from 'express';
import db from '../db.js';
import type { GameState, SaveGameRequest, ApiResponse, Poop, PlacedItem, Equipment } from '../types.js';

const router = Router();

// Default state for new saves
const DEFAULT_STATE = {
    hungerLevel: 2,
    cleanLevel: 2,
    happyLevel: 2,
    hearts: 0,
    level: 1,
    totalHeartsEarned: 0,
    equipment: {},
    placedItems: [],
    poops: [],
    currentBackground: 'room',
    unlockedItems: ['default'],
    unlockedBackgrounds: ['room'],
    lastInteraction: 0,
    lastGiftClaimed: 0,
};

// GET /api/game/:id - Load game state
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const row = db.prepare('SELECT * FROM game_saves WHERE id = ?').get(id) as Record<string, unknown> | undefined;

        if (!row) {
            // Return default state if no save exists
            const defaultState: GameState = {
                id,
                ...DEFAULT_STATE,
                lastSaveTime: Date.now()
            };

            const response: ApiResponse<GameState> = { success: true, data: defaultState };
            res.json(response);
            return;
        }

        const gameState: GameState = {
            id: row.id as string,
            hungerLevel: row.hunger_level as number,
            cleanLevel: row.clean_level as number,
            happyLevel: row.happy_level as number,
            hearts: row.hearts as number,
            level: row.level as number,
            totalHeartsEarned: row.total_hearts_earned as number,
            equipment: JSON.parse(row.equipment as string) as Equipment,
            placedItems: JSON.parse(row.placed_items as string) as PlacedItem[],
            poops: JSON.parse(row.poops as string) as Poop[],
            currentBackground: row.current_background as string,
            unlockedItems: JSON.parse(row.unlocked_items as string) as string[],
            unlockedBackgrounds: JSON.parse(row.unlocked_backgrounds as string) as string[],
            lastInteraction: row.last_interaction as number,
            lastGiftClaimed: row.last_gift_claimed as number,
            lastSaveTime: row.last_save_time as number
        };

        const response: ApiResponse<GameState> = { success: true, data: gameState };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<never> = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
});

// POST /api/game/:id - Save game state
router.post('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as SaveGameRequest;

    try {
        const now = Date.now();

        const stmt = db.prepare(`
            INSERT INTO game_saves (
                id, hunger_level, clean_level, happy_level,
                hearts, level, total_hearts_earned,
                equipment, placed_items, poops,
                current_background, unlocked_items, unlocked_backgrounds,
                last_interaction, last_gift_claimed, last_save_time
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                hunger_level = excluded.hunger_level,
                clean_level = excluded.clean_level,
                happy_level = excluded.happy_level,
                hearts = excluded.hearts,
                level = excluded.level,
                total_hearts_earned = excluded.total_hearts_earned,
                equipment = excluded.equipment,
                placed_items = excluded.placed_items,
                poops = excluded.poops,
                current_background = excluded.current_background,
                unlocked_items = excluded.unlocked_items,
                unlocked_backgrounds = excluded.unlocked_backgrounds,
                last_interaction = excluded.last_interaction,
                last_gift_claimed = excluded.last_gift_claimed,
                last_save_time = excluded.last_save_time
        `);

        stmt.run(
            id,
            body.hungerLevel,
            body.cleanLevel,
            body.happyLevel,
            body.hearts,
            body.level,
            body.totalHeartsEarned,
            JSON.stringify(body.equipment),
            JSON.stringify(body.placedItems),
            JSON.stringify(body.poops),
            body.currentBackground,
            JSON.stringify(body.unlockedItems),
            JSON.stringify(body.unlockedBackgrounds),
            body.lastInteraction,
            body.lastGiftClaimed,
            now
        );

        const savedState: GameState = {
            id,
            ...body,
            lastSaveTime: now
        };

        const response: ApiResponse<GameState> = { success: true, data: savedState };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<never> = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
});

// DELETE /api/game/:id - Delete game save
router.delete('/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        db.prepare('DELETE FROM game_saves WHERE id = ?').run(id);

        const response: ApiResponse<{ deleted: boolean }> = {
            success: true,
            data: { deleted: true }
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<never> = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(response);
    }
});

export default router;
