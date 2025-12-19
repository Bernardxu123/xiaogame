import React, { useState, useEffect, useCallback } from 'react';

interface FallingCarrot {
    id: number;
    x: number;
    y: number;
}

interface CarrotGameProps {
    onComplete: (carrots: number) => void;
    onClose: () => void;
}

export const CarrotGame: React.FC<CarrotGameProps> = ({ onComplete, onClose }) => {
    const [carrots, setCarrots] = useState<FallingCarrot[]>([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15); // 15 seconds game
    const [gameOver, setGameOver] = useState(false);

    // Spawn carrots
    useEffect(() => {
        if (gameOver) return;

        const spawnTimer = setInterval(() => {
            setCarrots(prev => [
                ...prev,
                {
                    id: Date.now(),
                    x: 10 + Math.random() * 80, // 10-90% of screen width
                    y: -10, // Start above screen
                }
            ]);
        }, 1500); // New carrot every 1.5s (very slow for kids)

        return () => clearInterval(spawnTimer);
    }, [gameOver]);

    // Move carrots down
    useEffect(() => {
        if (gameOver) return;

        const moveTimer = setInterval(() => {
            setCarrots(prev =>
                prev
                    .map(c => ({ ...c, y: c.y + 2 })) // Very slow falling
                    .filter(c => c.y < 110) // Remove if off screen
            );
        }, 100);

        return () => clearInterval(moveTimer);
    }, [gameOver]);

    // Countdown
    useEffect(() => {
        if (gameOver) return;

        const countdownTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownTimer);
    }, [gameOver]);

    const catchCarrot = useCallback((id: number) => {
        setCarrots(prev => prev.filter(c => c.id !== id));
        setScore(s => s + 1);
    }, []);

    const handleFinish = () => {
        onComplete(score);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-sky-400 to-sky-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6">
                <div className="bg-white/80 rounded-full px-6 py-3 text-2xl font-bold shadow-lg">
                    🥕 {score}
                </div>
                <div className="bg-white/80 rounded-full px-6 py-3 text-2xl font-bold shadow-lg">
                    ⏱️ {timeLeft}s
                </div>
            </div>

            {/* Falling Carrots */}
            {carrots.map(c => (
                <button
                    key={c.id}
                    onClick={() => catchCarrot(c.id)}
                    className="absolute text-6xl transition-transform hover:scale-125 active:scale-90 cursor-pointer select-none"
                    style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    🥕
                </button>
            ))}

            {/* Game Over Modal */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-orange-500 mb-2">太棒了！</h2>
                        <p className="text-2xl mb-6">你抓到了 <span className="text-orange-500 font-bold">{score}</span> 个胡萝卜！</p>
                        <button
                            onClick={handleFinish}
                            className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
                        >
                            ✨ 获得 {score * 2} 爱心！
                        </button>
                    </div>
                </div>
            )}

            {/* Close button (always visible) */}
            {!gameOver && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full text-white text-2xl shadow-lg"
                >
                    ✕
                </button>
            )}

            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-600 to-green-400" />
        </div>
    );
};
