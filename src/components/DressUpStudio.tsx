import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState, ALL_ITEMS, ALL_BACKGROUNDS, type GameItem, type PlacedItem, UNLOCK_COSTS } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { Check, Trash2, Maximize, RotateCw, Image as ImageIcon, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Assets: Backgrounds
import bgRoom from '../assets/pixel/bg_room.jpg';
import bgGarden from '../assets/pixel/bg_garden.png';
import bgBeach from '../assets/pixel/bg_beach.png';
import bgCandy from '../assets/pixel/bg_candy.png';
import bgNight from '../assets/pixel/bg_night.png';
import bgStudio from '../assets/pixel/bg_studio.jpg';

// Assets: Items
const ASSETS = import.meta.glob('../assets/pixel/*.png', { eager: true, as: 'url' });

const BACKGROUND_IMAGES: Record<string, string> = {
    room: bgRoom,
    garden: bgGarden,
    beach: bgBeach,
    candy: bgCandy,
    night: bgNight,
    studio: bgStudio,
};

interface DressUpStudioProps {
    onClose: () => void;
}

type Tab = 'items' | 'backgrounds';

export const DressUpStudio: React.FC<DressUpStudioProps> = ({ onClose }) => {
    const { state, actions } = useGameState();

    // Local state
    const [items, setItems] = useState<PlacedItem[]>(state.placedItems || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('items');
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const [initialIdBase] = useState(() => Date.now());
    const idCounter = useRef(initialIdBase);

    // Sync Item State
    useEffect(() => {
        setItems(state.placedItems || []);
    }, [state.placedItems]);

    // Handlers
    const handleAddItem = (gameItem: GameItem) => {
        idCounter.current += 1;
        const newItem: PlacedItem = {
            uiId: `${gameItem.id}_${idCounter.current}`,
            itemId: gameItem.id,
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0,
            zIndex: items.length + 1
        };
        setItems([...items, newItem]);
        setSelectedId(newItem.uiId);
    };

    const handleUpdateItem = (uiId: string, updates: Partial<PlacedItem>) => {
        setItems(prev => prev.map(item =>
            item.uiId === uiId ? { ...item, ...updates } : item
        ));
    };

    const handleRemoveItem = (uiId: string) => {
        setItems(prev => prev.filter(i => i.uiId !== uiId));
        setSelectedId(null);
    };

    const handleBringToFront = (uiId: string) => {
        setItems(prev => {
            const item = prev.find(i => i.uiId === uiId);
            if (!item) return prev;
            return [...prev.filter(i => i.uiId !== uiId), item];
        });
        setSelectedId(uiId);
    };

    const handleReset = () => {
        if (window.confirm('确定要清空所有贴纸吗？(背景不会重置)')) {
            setItems([]);
            setSelectedId(null);
        }
    };

    const handleSave = () => {
        actions.saveOutfit(items);
        onClose();
    };

    const handleSetBackground = (bgId: string) => {
        const bg = ALL_BACKGROUNDS.find(b => b.id === bgId);
        if (!bg) return;

        if (bg.unlocked || state.unlockedBackgrounds.includes(bgId)) {
            actions.setBackground(bgId);
        } else {
            if (state.hearts >= UNLOCK_COSTS.background) {
                if (window.confirm(`解锁 "${bg.name}" 需要 ${UNLOCK_COSTS.background} 爱心，确定解锁吗？`)) {
                    actions.unlockBackground(bgId);
                    actions.setBackground(bgId);
                }
            } else {
                alert(`爱心不足！需要 ${UNLOCK_COSTS.background} ❤️`);
            }
        }
    };

    const selectedItem = items.find(i => i.uiId === selectedId);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans"
        >
            {/* Header - Glassmorphism */}
            <div className="flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 z-50 shadow-sm">
                <button onClick={onClose} className="p-2 px-4 bg-white/50 hover:bg-white rounded-full text-slate-600 font-bold transition-all shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95">
                    <X className="w-5 h-5" /> 取消
                </button>

                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
                        创意工坊
                    </h1>
                    <span className="text-xs text-slate-400 font-medium tracking-widest">CREATIVE STUDIO</span>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleReset} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors" title="清空贴纸">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={handleSave} className="px-8 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Check className="w-5 h-5 stroke-[3]" /> 保存设计
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. Canvas Area */}
                <div
                    ref={containerRef}
                    className="flex-1 relative overflow-hidden group shadow-inner bg-slate-200/20"
                    onClick={() => setSelectedId(null)}
                >
                    {/* Sidebar Toggle Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setSidebarVisible(!sidebarVisible); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-white/50 hover:bg-white transition-all hover:scale-110 active:scale-95 text-slate-500 group-hover:opacity-100 opacity-80"
                    >
                        {sidebarVisible ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                    </button>

                    {/* Dynamic Background Image */}
                    <div className="absolute inset-0 z-0 transition-all duration-700">
                        <img
                            src={BACKGROUND_IMAGES[state.currentBackground] || BACKGROUND_IMAGES.room}
                            alt="bg"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Rabbit (Fixed Base) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                        <div className="w-[28vh] h-[28vh] max-w-2xl max-h-2xl relative transition-transform duration-500">
                            <Rabbit state="normal" equipment={{}} className="w-full h-full drop-shadow-2xl" />
                        </div>
                    </div>

                    {/* Placed Items Layer */}
                    <div className="absolute inset-0 z-10">
                        {items.map((item) => (
                            <DraggableSticker
                                key={item.uiId}
                                item={item}
                                isSelected={selectedId === item.uiId}
                                containerRef={containerRef}
                                onSelect={() => handleBringToFront(item.uiId)}
                                onUpdate={(updates) => handleUpdateItem(item.uiId, updates)}
                            />
                        ))}
                    </div>

                    {/* Controls Overlay (Floating Island) */}
                    <AnimatePresence>
                        {selectedItem && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-white/60 z-50"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Scale */}
                                <div className="flex flex-col items-center gap-2">
                                    <Maximize className="w-5 h-5 text-slate-500" />
                                    <input
                                        type="range" min="0.5" max="6.0" step="0.1"
                                        value={selectedItem.scale}
                                        onChange={(e) => handleUpdateItem(selectedItem.uiId, { scale: parseFloat(e.target.value) })}
                                        className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                </div>

                                <div className="w-px h-10 bg-slate-300/50" />

                                {/* Rotation */}
                                <div className="flex flex-col items-center gap-2">
                                    <RotateCw className="w-5 h-5 text-slate-500" />
                                    <input
                                        type="range" min="-180" max="180" step="5"
                                        value={selectedItem.rotation}
                                        onChange={(e) => handleUpdateItem(selectedItem.uiId, { rotation: parseFloat(e.target.value) })}
                                        className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                </div>

                                <div className="w-px h-10 bg-slate-300/50" />

                                {/* Delete */}
                                <button
                                    onClick={() => handleRemoveItem(selectedItem.uiId)}
                                    className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Sidebar */}
                <AnimatePresence>
                    {sidebarVisible && (
                        <motion.div
                            initial={{ x: 320 }}
                            animate={{ x: 0 }}
                            exit={{ x: 320 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-80 bg-white/95 backdrop-blur-xl border-l border-white/50 flex flex-col shadow-2xl z-20"
                        >
                            {/* Tabs */}
                            <div className="flex p-2 gap-2 bg-slate-50 border-b border-slate-100">
                                <button
                                    onClick={() => setActiveTab('items')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'items' ? 'bg-white shadow-md text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <Sparkles className="w-4 h-4" /> 贴纸素材
                                </button>
                                <button
                                    onClick={() => setActiveTab('backgrounds')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'backgrounds' ? 'bg-white shadow-md text-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <ImageIcon className="w-4 h-4" /> 场景切换
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">

                                {/* Items Grid */}
                                {activeTab === 'items' && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {ALL_ITEMS.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleAddItem(item)}
                                                className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-amber-400 hover:shadow-md cursor-pointer flex flex-col items-center justify-center p-2 group relative transition-all"
                                            >
                                                <div className="flex-1 w-full flex items-center justify-center relative">
                                                    <ItemImage filename={item.image} />
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium mt-1 group-hover:text-amber-500 transition-colors">{item.name}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Backgrounds Grid */}
                                {activeTab === 'backgrounds' && (
                                    <div className="space-y-3">
                                        {ALL_BACKGROUNDS.map((bg) => {
                                            const isUnlocked = bg.unlocked || state.unlockedBackgrounds.includes(bg.id);
                                            const isCurrent = state.currentBackground === bg.id;

                                            return (
                                                <motion.div
                                                    key={bg.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleSetBackground(bg.id)}
                                                    className={`
                                                relative h-32 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all shadow-sm
                                                ${isCurrent ? 'border-green-500 ring-2 ring-green-200' : 'border-white hover:border-blue-300'}
                                            `}
                                                >
                                                    <img src={BACKGROUND_IMAGES[bg.id]} alt={bg.name} className={`w-full h-full object-cover transition-all ${!isUnlocked ? 'grayscale blur-[1px]' : ''}`} />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                                                        <div className="font-bold text-white text-sm flex items-center justify-between">
                                                            <span>{bg.name}</span>
                                                            {isCurrent && <Check className="w-4 h-4 text-green-400" />}
                                                            {!isUnlocked && <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded-full">🔒 {UNLOCK_COSTS.background}</span>}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const DraggableSticker: React.FC<{
    item: PlacedItem;
    isSelected: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onSelect: () => void;
    onUpdate: (updates: Partial<PlacedItem>) => void;
}> = ({ item, isSelected, containerRef, onSelect, onUpdate }) => {
    const path = `../assets/pixel/${item.itemId}${item.itemId.endsWith('.png') ? '' : '.png'}`;
    const src = ASSETS[path] || ASSETS[`../assets/pixel/${item.itemId}`];

    // High-precision pointer logic
    const handleDragEnd = (_: unknown, info: { point: { x: number; y: number } }) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate percentages based on exact pointer release position relative to container
        const px = ((info.point.x - rect.left) / rect.width) * 100;
        const py = ((info.point.y - rect.top) / rect.height) * 100;

        onUpdate({
            x: Math.max(0, Math.min(100, px)),
            y: Math.max(0, Math.min(100, py))
        });
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => onSelect()}
            onDragEnd={handleDragEnd}
            style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                x: '-50%',
                y: '-50%',
                zIndex: isSelected ? 100 : item.zIndex,
                touchAction: 'none',
            }}
            animate={{
                scale: item.scale,
                rotate: item.rotation,
                filter: isSelected ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="cursor-grab active:cursor-grabbing pointer-events-auto group/sticker"
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            <div className={`relative transition-all duration-300 ${isSelected ? 'ring-4 ring-amber-400 ring-offset-4 rounded-2xl shadow-2xl scale-105' : 'hover:scale-105'}`}>
                {src ? (
                    <img
                        src={src as string}
                        alt="sticker"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-contain pointer-events-none select-none"
                        style={{ imageRendering: 'pixelated' }}
                    />
                ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-400 font-mono">?</div>
                )}
            </div>

            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center"
                >
                    <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
            )}
        </motion.div>
    );
};
const ItemImage: React.FC<{ filename: string }> = ({ filename }) => {
    const path = `../assets/pixel/${filename}`;
    const src = ASSETS[path];
    return src ? <img src={src} className="w-full h-full object-contain" /> : <span>?</span>;
};
