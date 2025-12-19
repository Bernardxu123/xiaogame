import express from 'express';
import cors from 'cors';
import gameRouter from './routes/game.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/game', gameRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🐰 Rabbit Care API server running on http://localhost:${PORT}`);
});
