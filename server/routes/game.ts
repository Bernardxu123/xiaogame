import { Router, Request, Response } from 'express';
import db from '../db.js';
import type { GameState, SaveGameRequest, ApiResponse, Poop } from '../types.js';

const router = Router();

// GET /api/game/:id - Load game state
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const row = db.prepare('SELECT * FROM game_saves WHERE id = ?').get(id) as any;

        if (!row) {
            // Return default state if no save exists
            const defaultState: GameState = {
                id,
                hunger: 80,
                cleanliness: 80,
                happiness: 80,
                isDressed: false,
                isSleeping: false,
                poops: [],
                lastSaveTime: Date.now()
            };

            const response: ApiResponse<GameState> = { success: true, data: defaultState };
            res.json(response);
            return;
        }

        const gameState: GameState = {
            id: row.id,
            hunger: row.hunger,
            cleanliness: row.cleanliness,
            happiness: row.happiness,
            isDressed: Boolean(row.is_dressed),
            isSleeping: Boolean(row.is_sleeping),
            poops: JSON.parse(row.poops) as Poop[],
            lastSaveTime: row.last_save_time
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
      INSERT INTO game_saves (id, hunger, cleanliness, happiness, is_dressed, is_sleeping, poops, last_save_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        hunger = excluded.hunger,
        cleanliness = excluded.cleanliness,
        happiness = excluded.happiness,
        is_dressed = excluded.is_dressed,
        is_sleeping = excluded.is_sleeping,
        poops = excluded.poops,
        last_save_time = excluded.last_save_time
    `);

        stmt.run(
            id,
            body.hunger,
            body.cleanliness,
            body.happiness,
            body.isDressed ? 1 : 0,
            body.isSleeping ? 1 : 0,
            JSON.stringify(body.poops),
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
