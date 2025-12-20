import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState, ALL_ITEMS, type GameItem, type PlacedItem } from '../hooks/useGameState';
import { Rabbit } from './Rabbit';
import { Check, Trash2, Maximize, RotateCw } from 'lucide-react';

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
    const containerRef = useRef<HTMLDivElement>(null);

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
        // Add to end (top) and select
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
        // Move item to end of array to render last (on top)
        setItems(prev => {
            const item = prev.find(i => i.uiId === uiId);
            if (!item) return prev;
            const others = prev.filter(i => i.uiId !== uiId);
            return [...others, item];
        });
        setSelectedId(uiId);
    };

    const handleReset = () => {
        if (window.confirm('确定要清空画布吗？')) {
            setItems([]);
            setSelectedId(null);
        }
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
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 font-bold px-4">
                    🔙 返回
                </button>
                <h1 className="text-xl font-bold text-amber-600 flex items-center gap-2">
                    🎨 自由创作工作室
                </h1>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200" title="清空">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 flex items-center gap-2">
                        <Check className="w-5 h-5" /> 保存
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Canvas Area */}
                <div
                    ref={containerRef}
                    className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden group"
                    onClick={() => setSelectedId(null)}
                >
                    {/* Center Reference Guide (Optional, visible on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
                        <div className="w-full h-px bg-red-400 absolute" />
                        <div className="h-full w-px bg-red-400 absolute" />
                    </div>

                    {/* Fixed Base: Rabbit - Centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-80">
                        {/* Scale down slightly to leave room for stickers */}
                        <div className="w-80 h-80 relative">
                            <Rabbit state="normal" equipment={{}} className="w-full h-full" />
                        </div>
                    </div>

                    {/* Placed Items Layer */}
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

                    {/* Controls Overlay for Selected Item */}
                    {selectedItem && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl flex items-center gap-6 border-2 border-amber-200 z-[100]" onClick={e => e.stopPropagation()}>

                            {/* Scale Control */}
                            <div className="flex flex-col items-center gap-1">
                                <Maximize className="w-4 h-4 text-slate-400" />
                                <input
                                    type="range" min="0.5" max="3.0" step="0.1"
                                    value={selectedItem.scale}
                                    onChange={(e) => handleUpdateItem(selectedItem.uiId, { scale: parseFloat(e.target.value) })}
                                    className="w-24 accent-amber-500 cursor-pointer"
                                />
                            </div>

                            {/* Rotation Control */}
                            <div className="flex flex-col items-center gap-1">
                                <RotateCw className="w-4 h-4 text-slate-400" />
                                <input
                                    type="range" min="-180" max="180" step="5"
                                    value={selectedItem.rotation}
                                    onChange={(e) => handleUpdateItem(selectedItem.uiId, { rotation: parseFloat(e.target.value) })}
                                    className="w-24 accent-amber-500 cursor-pointer"
                                />
                            </div>

                            {/* Delete */}
                            <div className="h-8 w-px bg-slate-200 mx-2" />
                            <button onClick={() => handleRemoveItem(selectedItem.uiId)} className="p-2 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Item Library */}
                <div className="w-24 sm:w-32 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
                    <div className="p-3 bg-amber-100 font-bold text-center text-amber-700 text-sm shadow-sm">
                        素材库
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                        {ALL_ITEMS.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleAddItem(item)}
                                className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-100 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center p-1 transition-all active:scale-95 group relative"
                            >
                                <ItemImage filename={item.image} />
                                <span className="text-[10px] text-slate-500 truncate w-full text-center mt-1 group-hover:text-amber-600">{item.name}</span>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                    +
                                </div>
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
    containerRef: React.RefObject<HTMLDivElement | null>;
    onSelect: () => void;
    onUpdate: (updates: Partial<PlacedItem>) => void;
}> = ({ item, isSelected, containerRef, onSelect, onUpdate }) => {
    // Determine image source
    const path = `../assets/pixel/${item.itemId}${item.itemId.endsWith('.png') ? '' : '.png'}`;
    const src = ASSETS[path] || ASSETS[`../assets/pixel/${item.itemId}`];

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            // Temporarily disable visual position while dragging to avoid fighting with state?
            // Actually framer motion handles visual. We just need to update state on end.
            // We use initial x/y in style to position it.
            // When iterating, we want it to stay where it is.
            // We need to map item.x% to pixel position for 'initial' or 'style'.
            // But since parent is relative, we can just use left/top %.
            style={{
                position: 'absolute',
                top: `${item.y}%`,
                left: `${item.x}%`,
                // Center the anchor point
                x: '-50%',
                y: '-50%',
                touchAction: 'none'
            }}
            onDragStart={() => onSelect()}
            onDragEnd={(_event, info) => {
                if (!containerRef.current) return;

                const containerRect = containerRef.current.getBoundingClientRect();
                const point = info.point; // Absolute page coordinates of pointer

                // Calculate relative position within container
                // We typically want the center of the element to be at the pointer, or keep the offset.
                // Simplified: Update position based on where the drag ended relative to container.
                const relativeX = point.x - containerRect.left;
                const relativeY = point.y - containerRect.top;

                // Convert to percentage
                const percentX = (relativeX / containerRect.width) * 100;
                const percentY = (relativeY / containerRect.height) * 100;

                // Clamp to reasonable bounds (-20% to 120%) to allow partial off-screen
                // const clampedX = Math.min(Math.max(percentX, -20), 120);
                // const clampedY = Math.min(Math.max(percentY, -20), 120);

                onUpdate({ x: percentX, y: percentY });
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            className={`cursor-move pointer-events-auto ${isSelected ? 'z-[50]' : 'z-auto'}`}
            animate={{
                scale: item.scale,
                rotate: item.rotation,
                filter: isSelected ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'drop-shadow(0 0 2px rgba(0,0,0,0.2))'
            }}
        >
            <div className={`relative ${isSelected ? 'ring-2 ring-amber-400 border-dashed rounded-lg p-1' : ''}`}>
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
