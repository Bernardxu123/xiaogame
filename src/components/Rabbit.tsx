import React from 'react';
import { motion } from 'framer-motion';

// Base Rabbits
import rabbitIdle from '../assets/pixel/rabbit_base_idle.png';
import rabbitSad from '../assets/pixel/rabbit_sad.png';
import rabbitEat1 from '../assets/pixel/rabbit-eat-1.png'; // Kept
import rabbitEat2 from '../assets/pixel/rabbit-eat-2.png'; // Kept
import rabbitSleep from '../assets/pixel/rabbit_sleeping.png'; // Recovered
import effectZzz from '../assets/pixel/effect_zzz.png';

// Dynamic Asset Loading
const ASSETS = import.meta.glob('../assets/pixel/*.png', { eager: true, as: 'url' });

import { cn } from '../lib/utils';
import { FrameAnimation } from './FrameAnimation';

export type RabbitState = 'normal' | 'happy' | 'sad' | 'eating' | 'sleeping';

interface RabbitProps {
    state: RabbitState;
    equipment: {
        head?: string;
        body?: string;
        hand?: string;
    };
    className?: string;
}

export const Rabbit: React.FC<RabbitProps> = ({ state, equipment, className }) => {

    // Helper to get asset URL by ID
    const getAssetUrl = (id?: string) => {
        if (!id) return null;
        // Map ID to filename
        const path = `../assets/pixel/final/${id}.png`;
        return ASSETS[path] || null;
    };

    const renderBaseRabbit = () => {
        switch (state) {
            case 'eating':
                return (
                    <FrameAnimation
                        frames={[rabbitEat1, rabbitEat2]}
                        interval={200}
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                );
            case 'sleeping':
                return (
                    <div className="relative w-full h-full">
                        <img
                            src={rabbitSleep}
                            alt="Rabbit Sleeping"
                            className="w-full h-full object-contain drop-shadow-2xl opacity-90"
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <img
                            src={effectZzz}
                            className="absolute top-0 right-0 w-16 h-16 animate-pulse"
                            alt="zzz"
                        />
                    </div>
                );
            default:
                let imageSrc = rabbitIdle;
                if (state === 'happy') imageSrc = rabbitHappy;
                if (state === 'sad') imageSrc = rabbitSad;

                return (
                    <img
                        src={imageSrc}
                        alt="Rabbit Base"
                        className={`w-full h-full object-contain drop-shadow-2xl ${state === 'happy' ? 'animate-bounce' : 'animate-pulse'}`}
                        style={{ imageRendering: 'pixelated' }}
                    />
                );
        }
    };

    return (
        <div className={cn("relative w-64 h-64", className)}>
            {/* 1. Base Rabbit Layer */}
            <div className="absolute inset-0 z-0">
                {renderBaseRabbit()}
            </div>

            {/* 2. Clothing Layers - Only show if not sleeping to avoid weird overlay on lying down rabbit */}
            {state !== 'sleeping' && (
                <>
                    {/* Body Layer */}
                    {getAssetUrl(equipment.body) && (
                        <motion.img
                            src={getAssetUrl(equipment.body)!}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none translate-y-[2px]" // slight adjust
                            style={{ imageRendering: 'pixelated', transform: 'scale(1.05)' }}
                        />
                    )}

                    {/* Head Layer */}
                    {getAssetUrl(equipment.head) && (
                        <motion.img
                            src={getAssetUrl(equipment.head)!}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none -translate-y-[8px]" // slight lift for hats
                            style={{ imageRendering: 'pixelated' }}
                        />
                    )}

                    {/* Hand Layer */}
                    {getAssetUrl(equipment.hand) && (
                        <motion.img
                            src={getAssetUrl(equipment.hand)!}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none translate-x-[10px]" // slight offset
                            style={{ imageRendering: 'pixelated' }}
                        />
                    )}
                </>
            )}
        </div>
    );
};
