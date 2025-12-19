import React from 'react';
import rabbitIdle from '../assets/pixel/rabbit-idle.png';
import rabbitHappy from '../assets/pixel/rabbit-happy.png';
import rabbitSad from '../assets/pixel/rabbit-sad.png';
import rabbitEat1 from '../assets/pixel/rabbit-eat-1.png';
import rabbitEat2 from '../assets/pixel/rabbit-eat-2.png';
import rabbitSleep from '../assets/pixel/rabbit-sleep.png';
import dress from '../assets/pixel/dress.png';
import { cn } from '../lib/utils';
import { FrameAnimation } from './FrameAnimation';

export type RabbitState = 'normal' | 'happy' | 'sad' | 'eating' | 'sleeping';

interface RabbitProps {
    state: RabbitState;
    isDressed: boolean;
    className?: string;
}

export const Rabbit: React.FC<RabbitProps> = ({ state, isDressed, className }) => {
    // Logic to determine what to render
    const renderContent = () => {
        // If dressed, we assume the dress image is the full character (as per user feedback)
        // IMPORTANT: If sleeping or eating, we might still want the specific animations.
        // However, if the user says "the dress itself has the rabbit", we use the dress image as a replacement for normal/happy/sad states.

        if (isDressed && state !== 'sleeping' && state !== 'eating') {
            return (
                <div className="relative w-full h-full">
                    <img
                        src={dress}
                        alt="Dressed Rabbit"
                        className={`w-full h-full object-contain drop-shadow-2xl ${state === 'happy' ? 'animate-bounce' : 'animate-pulse'}`}
                        style={{ imageRendering: 'pixelated' }}
                    />
                </div>
            );
        }

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
                    </div>
                );
            default:
                // Normal / Happy / Sad
                let imageSrc = rabbitIdle;
                if (state === 'happy') imageSrc = rabbitHappy;
                if (state === 'sad') imageSrc = rabbitSad;

                return (
                    <div className="relative w-full h-full">
                        <img
                            src={imageSrc}
                            alt="Rabbit"
                            className={`w-full h-full object-contain drop-shadow-2xl ${state === 'happy' ? 'animate-bounce' : 'animate-pulse'}`}
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                );
        }
    };

    return (
        <div
            className={cn("w-64 h-64 relative transition-all duration-300", className)}
        >
            {renderContent()}
        </div>
    );
};
