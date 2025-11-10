/**
 * Draggable and resizable YouTube video player
 * Persists position and size in localStorage
 */

import { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingVideoCardProps {
    videoId: string;
    onClose: () => void;
}

interface VideoState {
    x: number;
    y: number;
    width: number;
    height: number;
}

const FloatingVideoCard = ({ videoId, onClose }: FloatingVideoCardProps) => {
    const storageKey = `video-position-${videoId}`;

    const [isMaximized, setIsMaximized] = useState(false);
    const [normalState, setNormalState] = useState<VideoState>({
        x: window.innerWidth - 500 - 20,
        y: 100,
        width: 500,
        height: 281, // 16:9 ratio
    });

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const state = JSON.parse(saved);
                setNormalState(state);
            } catch (e) {
                console.error('Failed to load video position', e);
            }
        }
    }, [storageKey]);

    const handleDragStop = (_e: any, d: { x: number; y: number }) => {
        const newState = { ...normalState, x: d.x, y: d.y };
        setNormalState(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
    };

    const handleResizeStop = (
        _e: any,
        _direction: any,
        ref: HTMLElement,
        _delta: any,
        position: { x: number; y: number }
    ) => {
        const newState = {
            x: position.x,
            y: position.y,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
        };
        setNormalState(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
        document.dispatchEvent(
            new CustomEvent('aurora:pulse', {
                detail: { amplitude: 1.6, duration: 500 },
            })
        );
    };

    const currentState = isMaximized
        ? { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
        : normalState;

    const getEmbedUrl = (id: string) =>
        `https://www.youtube.com/embed/${id}?autoplay=1`;

    return (
        <Rnd
            position={{ x: currentState.x, y: currentState.y }}
            size={{ width: currentState.width, height: currentState.height }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            minWidth={300}
            minHeight={169}
            bounds="window"
            enableResizing={!isMaximized}
            disableDragging={isMaximized}
            className="video-player-rnd"
            style={{ zIndex: 1000 }}
        >
            <div className="h-full w-full glass-strong rounded-lg overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all hover:glow-primary group">
                {/* Controls Bar */}
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMaximize}
                            className="h-7 w-7 p-0 hover:bg-white/20"
                        >
                            {isMaximized ? (
                                <Minimize2 className="w-4 h-4 text-white" />
                            ) : (
                                <Maximize2 className="w-4 h-4 text-white" />
                            )}
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-7 w-7 p-0 hover:bg-destructive/80"
                    >
                        <X className="w-4 h-4 text-white" />
                    </Button>
                </div>

                {/* Video Iframe */}
                <iframe
                    src={getEmbedUrl(videoId)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                />
            </div>
        </Rnd>
    );
};

export default FloatingVideoCard;
