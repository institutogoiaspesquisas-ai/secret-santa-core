import { useState, useEffect } from 'react';
import { Trophy, XCircle, Info } from 'lucide-react';
import type { GameFeedbackType } from '@/types/game';

interface GameFeedbackProps {
    type: GameFeedbackType;
    message: string;
    isVisible: boolean;
    onComplete?: () => void;
}

export function GameFeedback({ type, message, isVisible, onComplete }: GameFeedbackProps) {
    const [showFlash, setShowFlash] = useState(false);
    const [showShake, setShowShake] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowFlash(true);

            if (type === 'error') {
                setShowShake(true);
                setTimeout(() => setShowShake(false), 800);
            }

            const flashTimer = setTimeout(() => setShowFlash(false), 500);
            const completeTimer = setTimeout(() => onComplete?.(), type === 'success' ? 2500 : 1500);

            return () => {
                clearTimeout(flashTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [isVisible, type, onComplete]);

    if (!isVisible) return null;

    const iconMap = {
        success: <Trophy className="h-16 w-16 text-[#FFD166] animate-bounce" />,
        error: <XCircle className="h-16 w-16 text-red-500" />,
        info: <Info className="h-16 w-16 text-blue-400" />,
    };

    const bgColorMap = {
        success: 'from-[#FFD166]/20 to-transparent',
        error: 'from-red-500/20 to-transparent',
        info: 'from-blue-500/20 to-transparent',
    };

    return (
        <>
            {/* Flash overlay */}
            {showFlash && (
                <div
                    className={`
            fixed inset-0 z-40 pointer-events-none
            ${type === 'success' ? 'bg-[#FFD166]/30' : type === 'error' ? 'bg-red-500/30' : 'bg-blue-500/30'}
            animate-pulse
          `}
                    style={{ animationDuration: '0.3s' }}
                />
            )}

            {/* Feedback card */}
            <div
                className={`
          fixed inset-0 z-30 flex items-center justify-center pointer-events-none
          ${showShake ? 'animate-shake' : ''}
        `}
            >
                <div
                    className={`
            p-8 rounded-2xl bg-gradient-to-b ${bgColorMap[type]} backdrop-blur-sm
            border border-white/10 text-center
            transform transition-all duration-300
            ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
                >
                    <div className="flex justify-center mb-4">
                        {iconMap[type]}
                    </div>
                    <p className="text-2xl font-bold text-white mb-2">
                        {type === 'success' ? '🎉 Acerto!' : type === 'error' ? '❌ Errou!' : '💡'}
                    </p>
                    <p className="text-lg text-white/80 italic max-w-md">
                        "{message}"
                    </p>
                </div>
            </div>
        </>
    );
}
