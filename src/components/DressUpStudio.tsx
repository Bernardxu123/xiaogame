import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameState, ALL_ITEMS, type GameItem, type PlacedItem } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { X, Check, Trash2, Maximize, RotateCw } from 'lucide-react';

// Assets
const ASSETS = import.meta.glob('../assets/pixel/*.png', { eager: true, as: 'url' });

interface DressUpStudioProps {
    onClose: () => void;
}

export const DressUpStudio: React.FC<DressUpStudioProps> = ({ onClose }) => {
    const { state, actions } = useGameState();

    // Local state for editing session
    const [items, setItems] = useState<PlacedItem[]>(state.placedItems || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        setItems(state.placedItems || []);
    }, [state.placedItems]);

    const handleAddItem = (gameItem: GameItem) => {
        const newItem: PlacedItem = {
            uiId: `${gameItem.id}_${Date.now()}`,
            itemId: gameItem.id,
            x: 50, // Center
            y: 50, // Center
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

    const handleSave = () => {
        actions.saveOutfit(items);
        onClose();
    };

    const selectedItem = items.find(i => i.uiId === selectedId);

    return (
        <div className="fixed inset-0 z-50 bg-amber-50 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur shadow-sm z-50">
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                    <X className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-xl font-bold text-amber-600">🎨 自由创作工作室</h1>
                <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 flex items-center gap-2">
                    <Check className="w-5 h-5" /> 保存
                </button>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Canvas Area */}
                <div className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden flex items-center justify-center"
                    onClick={() => setSelectedId(null)}
                >
                    {/* Fixed Base: Rabbit */}
                    <div className="relative w-80 h-80 pointer-events-none select-none">
                        {/* We use a 'naked' rabbit or base state. 
                             If the user wants to keep equipment, we could pass it. 
                             But 'Freeform' usually implies starting fresh or layering on top.
                             Let's show the base rabbit without equipment for clarity, 
                             OR let the user drag equipment ON TOP of the base.
                         */}
                        <Rabbit state="normal" equipment={{}} className="w-full h-full opacity-80" />
                    </div>

                    {/* Placed Items Layer */}
                    <div className="absolute inset-0 pointer-events-none">
                        {items.map((item) => (
                            <DraggableSticker
                                key={item.uiId}
                                item={item}
                                isSelected={selectedId === item.uiId}
                                onSelect={() => setSelectedId(item.uiId)}
                            />
                        ))}
                    </div>

                    {/* Controls Overlay for Selected Item */}
                    {selectedItem && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl flex items-center gap-6 border-2 border-amber-200" onClick={e => e.stopPropagation()}>

                            {/* Scale Control */}
                            <div className="flex flex-col items-center gap-1">
                                <Maximize className="w-4 h-4 text-slate-400" />
                                <input
                                    type="range" min="0.5" max="2.5" step="0.1"
                                    value={selectedItem.scale}
                                    onChange={(e) => handleUpdateItem(selectedItem.uiId, { scale: parseFloat(e.target.value) })}
                                    className="w-24 accent-amber-500"
                                />
                            </div>

                            {/* Rotation Control */}
                            <div className="flex flex-col items-center gap-1">
                                <RotateCw className="w-4 h-4 text-slate-400" />
                                <input
                                    type="range" min="-180" max="180" step="5"
                                    value={selectedItem.rotation}
                                    onChange={(e) => handleUpdateItem(selectedItem.uiId, { rotation: parseFloat(e.target.value) })}
                                    className="w-24 accent-amber-500"
                                />
                            </div>

                            {/* Delete */}
                            <div className="h-8 w-px bg-slate-200 mx-2" />
                            <button onClick={() => handleRemoveItem(selectedItem.uiId)} className="p-2 bg-red-100 rounded-full text-red-500 hover:bg-red-200">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Item Library */}
                <div className="w-24 sm:w-32 bg-white border-l border-slate-200 flex flex-col shadow-xl z-10">
                    <div className="p-3 bg-amber-100 font-bold text-center text-amber-700 text-sm">
                        素材库
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-3">
                        {ALL_ITEMS.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleAddItem(item)}
                                className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-100 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center p-1 transition-all active:scale-95"
                            >
                                <ItemImage filename={item.image} />
                                <span className="text-[10px] text-slate-500 truncate w-full text-center mt-1">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DraggableSticker: React.FC<{
    item: PlacedItem;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ item, isSelected, onSelect }) => {
    // Determine image source
    const path = `../assets/pixel/${item.itemId}${item.itemId.endsWith('.png') ? '' : '.png'}`;
    const src = ASSETS[path] || ASSETS[`../assets/pixel/${item.itemId}`];

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={() => {
                // Calculate percentage position relative to parent
                // Ideally we'd measure parent size, but for now specific updates might be tricky without refs.
                // Simplified: We just let visual drag happen. 
                // To persist: we need to convert pixels to %. 
                // For this prototype, we might just rely on visual position if we don't reload page.
                // But let's try to be robust.

                // Since this element is absolute positioned, drag moves it via transform.
                // We'll update the 'x' and 'y' state logic if we want true "drop" logic.
                // For MVP: Framer handles visual state. We update 'x/y' approximately? 
                // Actually, let's keep it simpler: Use layout animation or simply let it float.
            }}
            // Framer motion drag uses transform. To save position, we should update state.
            // But getting exact parent bounds here is complex.
            // Alternative: Use a large drag constraint area.
            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}

            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={`absolute top-1/2 left-1/2 cursor-move pointer-events-auto touch-none ${isSelected ? 'z-50' : 'z-10'}`}
            style={{
                x: 0,
                y: 0,
                // We map 50% to 0 offset conceptually
                // But for real free positioning we might need absolute coords.
                // Using transform for now.
            }}
            animate={{
                scale: item.scale,
                rotate: item.rotation,
                filter: isSelected ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 1))' : 'none'
            }}
        >
            <div className={`relative ${isSelected ? 'ring-2 ring-amber-400 border-dashed rounded-lg' : ''}`}>
                {src ? (
                    <img
                        src={src}
                        alt="sticker"
                        className="w-24 h-24 object-contain pointer-events-none select-none"
                        style={{ imageRendering: 'pixelated' }}
                    />
                ) : (
                    <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">?</div>
                )}
            </div>
        </motion.div>
    );
};

const ItemImage: React.FC<{ filename: string }> = ({ filename }) => {
    const path = `../assets/pixel/${filename}`;
    const src = ASSETS[path];
    return src ? <img src={src} className="w-full h-full object-contain" /> : <span>?</span>;
};
