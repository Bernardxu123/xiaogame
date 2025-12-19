import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatsHeader } from './StatsHeader';
import { ActionPanel } from './ActionPanel';
import { Rabbit, type RabbitState } from './Rabbit';
import { PoopSystem, type Poop } from './PoopSystem';
import background from '../assets/background.png';
import { getPlayerId, loadGame, saveGame, type SaveGameRequest } from '../lib/api';
import { Save, Loader2 } from 'lucide-react';

export const GameContainer: React.FC = () => {
    // Player ID
    const playerIdRef = useRef<string>(getPlayerId());

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Game State
    const [hunger, setHunger] = useState(80);
    const [cleanliness, setCleanliness] = useState(80);
    const [happiness, setHappiness] = useState(80);
    const [poops, setPoops] = useState<Poop[]>([]);
    const [isDressed, setIsDressed] = useState(false);
    const [isSleeping, setIsSleeping] = useState(false);

    // Temporary interaction state
    const [tempState, setTempState] = useState<RabbitState | null>(null);

    // Load game on mount
    useEffect(() => {
        const load = async () => {
            const state = await loadGame(playerIdRef.current);
            if (state) {
                setHunger(state.hunger);
                setCleanliness(state.cleanliness);
                setHappiness(state.happiness);
                setPoops(state.poops);
                setIsDressed(state.isDressed);
                setIsSleeping(state.isSleeping);
                if (state.lastSaveTime) {
                    setLastSaved(new Date(state.lastSaveTime));
                }
            }
            setIsLoading(false);
        };
        load();
    }, []);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (isLoading) return; // Don't save while loading

        const saveState = async () => {
            setIsSaving(true);
            const state: SaveGameRequest = {
                hunger,
                cleanliness,
                happiness,
                poops,
                isDressed,
                isSleeping
            };
            const success = await saveGame(playerIdRef.current, state);
            if (success) {
                setLastSaved(new Date());
            }
            setIsSaving(false);
        };

        const timer = setInterval(saveState, 30000); // Save every 30s
        return () => clearInterval(timer);
    }, [isLoading, hunger, cleanliness, happiness, poops, isDressed, isSleeping]);

    // Manual save function
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        const state: SaveGameRequest = {
            hunger,
            cleanliness,
            happiness,
            poops,
            isDressed,
            isSleeping
        };
        const success = await saveGame(playerIdRef.current, state);
        if (success) {
            setLastSaved(new Date());
        }
        setIsSaving(false);
    }, [hunger, cleanliness, happiness, poops, isDressed, isSleeping]);

    // Derived State for Rabbit Expression
    const getRabbitState = (): RabbitState => {
        if (isSleeping) return 'sleeping';
        if (tempState) return tempState;
        if (tempState === 'eating') return 'eating'; // Redundant check but ok
        if (hunger < 30 || cleanliness < 30 || happiness < 30) return 'sad';
        if (happiness > 80) return 'happy';
        return 'normal';
    };

    // Game Loop
    useEffect(() => {
        const timer = setInterval(() => {
            // Logic varies if sleeping
            if (isSleeping) {
                // Sleep Mode: Recover happiness, hunger/cleanliness decay VERY slow
                setHappiness(h => Math.min(100, h + 1));
                setHunger(h => Math.max(0, h - 0.2)); // Slower decay
                // No poop generation while sleeping? Or minimal? Let's say none.
            } else {
                // Awake Mode
                setHunger(h => Math.max(0, h - 1));
                setCleanliness(c => Math.max(0, c - (poops.length * 2)));

                // Happiness decay logic
                setHappiness(h => {
                    let decay = 0.5;
                    if (hunger < 50) decay += 1;
                    if (cleanliness < 50) decay += 1;
                    return Math.max(0, h - decay);
                });

                // Random Poop Generation
                if (Math.random() < 0.05 && poops.length < 5) {
                    setPoops(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            x: 10 + Math.random() * 80,
                            y: 5 + Math.random() * 20
                        }
                    ]);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [poops.length, hunger, cleanliness, isSleeping]);

    // Interactions
    const handleFeed = useCallback(() => {
        if (isSleeping) return; // Cannot feed while sleeping
        setHunger(h => Math.min(100, h + 20));
        setHappiness(h => Math.min(100, h + 10));
        setTempState('eating'); // Use eating state
        setTimeout(() => setTempState(null), 2000);
    }, [isSleeping]);

    const handleClean = useCallback(() => {
        // This is global clean button, maybe cleans nearest or all?
        // Let's make it clean one poop if exists, or just do nothing if no poop.
        // Actually, PoopSystem handles clicking SPECIFIC poop.
        // This button might be "Deep Clean" or just a shortcut?
        // Let's make the "Scoop" button generic clean (removes random poop)
        if (poops.length > 0) {
            setPoops(prev => prev.slice(1));
            setCleanliness(c => Math.min(100, c + 15));
            setTempState('happy');
            setTimeout(() => setTempState(null), 1000);
        }
    }, [poops]);

    const handleCleanSpecific = useCallback((id: number) => {
        if (isSleeping) return; // Wake up first? Or allow cleaning around? Let's allow cleaning but wake up? No, prevent.
        setPoops(prev => prev.filter(p => p.id !== id));
        setCleanliness(c => Math.min(100, c + 20));
        setHappiness(h => Math.min(100, h + 5));
        setTempState('happy');
        setTimeout(() => setTempState(null), 1000);
    }, [isSleeping]);

    const handleDress = useCallback(() => {
        if (isSleeping) return;
        setIsDressed(d => !d);
        setHappiness(h => Math.min(100, h + 15));
        setTempState('happy');
        setTimeout(() => setTempState(null), 1000);
    }, [isSleeping]);

    const handleSleep = useCallback(() => {
        setIsSleeping(s => !s);
    }, []);

    return (
        <>
            {/* Loading Screen */}
            {isLoading && (
                <div className="fixed inset-0 bg-purple-900 flex items-center justify-center z-50">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                        <p className="text-white text-xl font-mono">加载中...</p>
                    </div>
                </div>
            )}

            <div
                className="relative w-full h-screen bg-cover bg-center overflow-hidden select-none font-sans"
                style={{ backgroundImage: `url(${background})`, imageRendering: 'pixelated' }}
            >
                {/* Night Overlay */}
                <div
                    className={`absolute inset-0 bg-black/60 z-20 pointer-events-none transition-opacity duration-1000 ${isSleeping ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-purple-700/80 hover:bg-purple-600 px-3 py-2 rounded-lg border-2 border-white text-white text-xs font-mono transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? '保存中...' : '保存'}</span>
                    {lastSaved && !isSaving && (
                        <span className="text-white/60 text-[10px]">
                            {lastSaved.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </button>

                {/* HUD */}
                {!isSleeping && <StatsHeader hunger={hunger} cleanliness={cleanliness} happiness={happiness} />}

                {/* Game Scene */}
                <div className="absolute inset-0 flex items-center justify-center pt-20 z-10">
                    <Rabbit state={getRabbitState()} isDressed={isDressed} />
                </div>

                {/* Interactive Elements */}
                <PoopSystem poops={poops} onClean={handleCleanSpecific} />

                {/* Controls */}
                <ActionPanel
                    onFeed={handleFeed}
                    onClean={handleClean}
                    onDress={handleDress}
                    onSleep={handleSleep}
                    isSleeping={isSleeping}
                />
            </div>
        </>
    );
};
