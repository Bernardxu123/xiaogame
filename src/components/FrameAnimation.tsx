import React, { useEffect, useState } from 'react';

interface FrameAnimationProps {
    frames: string[];
    interval?: number; // ms per frame
    isPlaying?: boolean;
    className?: string;
}

export const FrameAnimation: React.FC<FrameAnimationProps> = ({
    frames,
    interval = 200,
    isPlaying = true,
    className
}) => {
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

    useEffect(() => {
        if (!isPlaying || frames.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, frames.length, interval]);

    return (
        <img
            src={frames[currentFrameIndex]}
            alt="Animation"
            className={className}
            style={{ imageRendering: 'pixelated' }} // Ensure pixel art looks crisp
        />
    );
};
