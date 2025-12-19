import React from 'react';
import { motion } from 'framer-motion';
// Base Rabbits
import rabbitIdle from '../assets/pixel/rabbit-idle.png';
import rabbitHappy from '../assets/pixel/rabbit-happy.png';
import rabbitSad from '../assets/pixel/rabbit-sad.png';
import rabbitEat1 from '../assets/pixel/rabbit-eat-1.png';
import rabbitEat2 from '../assets/pixel/rabbit-eat-2.png';
import rabbitSleep from '../assets/pixel/rabbit-sleep.png';

// Clothing Assets (Assumed to be transparent overlays)
import dressIcon from '../assets/pixel/dress.png';
import skirtIcon from '../assets/pixel/skirt.png';
import bowIcon from '../assets/pixel/bow.png';
import hatIcon from '../assets/pixel/to_fix/rabbit-idle.png'; // Placeholder if no hat yet
import carrotIcon from '../assets/pixel/carrot.png';
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

// Asset Mapping
const ASSETS: Record<string, string> = {
    'dress': dressIcon,
    'skirt': skirtIcon,
    'bow': bowIcon,
    'hat': hatIcon,
    'carrot': carrotIcon,
};

export const Rabbit: React.FC<RabbitProps> = ({ state, equipment, className }) => {
    // Logic to determine base rabbit image
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
                    <img
                        src={rabbitSleep}
                        alt="Rabbit Sleeping"
                        className="w-full h-full object-contain drop-shadow-2xl opacity-90"
                        style={{ imageRendering: 'pixelated' }}
                    />
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

            {/* 2. Clothing Layers (Only if not sleeping/eating for now, or maybe allow it?) */}
            {/* We usually want clothes to vanish when sleeping or eating special anims for simplicity, OR overlay them carefully. */}
            {state !== 'sleeping' && state !== 'eating' && (
                <>
                    {/* Body Layer */}
                    {equipment.body && ASSETS[equipment.body] && (
                        <motion.img
                            src={ASSETS[equipment.body]}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                            style={{ imageRendering: 'pixelated', transform: 'scale(1.05)' }}
                        />
                    )}

                    {/* Head Layer */}
                    {equipment.head && ASSETS[equipment.head] && (
                        <motion.img
                            src={ASSETS[equipment.head]}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                            style={{ imageRendering: 'pixelated' }} // Head items usually need offset, handling via CSS/Image
                        />
                    )}

                    {/* Hand Layer */}
                    {equipment.hand && ASSETS[equipment.hand] && (
                        <motion.img
                            src={ASSETS[equipment.hand]}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    )}
                </>
            )}
        </div>
    );
};
