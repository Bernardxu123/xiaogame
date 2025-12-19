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
            case 'happy':
                return (
                    <img
                        src={rabbitHappy}
                        alt="Rabbit Happy"
                        className="w-full h-full object-contain drop-shadow-2xl animate-bounce"
                        style={{ imageRendering: 'pixelated' }}
                    />
                );
            case 'sad':
                return (
                    <img
                        src={rabbitSad}
                        alt="Rabbit Sad"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        style={{ imageRendering: 'pixelated' }}
                    />
                );
            default: // normal
                return (
                    <img
                        src={rabbitIdle}
                        alt="Rabbit Idle"
                        className="w-full h-full object-contain drop-shadow-2xl animate-pulse" // Subtle breathing
                        style={{ imageRendering: 'pixelated' }}
                    />
                );
        }
    };

    return (
        <div className={cn("relative w-96 h-96 flex justify-center items-center transition-transform duration-500", className)}>
            {/* Rabbit Content */}
            {renderContent()}

            {/* Dress Overlay - Only when not sleeping? Or always? Let's say NOT when sleeping for comfort :D */}
            {isDressed && state !== 'sleeping' && (
                <img
                    src={dress}
                    alt="Dress"
                    className="absolute bottom-0 w-[45%] h-[40%] object-contain translate-y-[-15%]"
                    style={{ imageRendering: 'pixelated' }}
                />
            )}
        </div>
    );
};
