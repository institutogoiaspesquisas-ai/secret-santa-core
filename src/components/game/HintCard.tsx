import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface HintCardProps {
    hint: string;
    hintIndex: number;
    isRevealing?: boolean;
}

export function HintCard({ hint, hintIndex, isRevealing = false }: HintCardProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isRevealing) {
            setIsVisible(false);
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [hint, isRevealing]);

    return (
        <Card
            className={`
        relative overflow-hidden border-2 border-[#FFD166]/30 bg-[#1E1E1E]
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD166]/5 via-[#FFD166]/10 to-[#FFD166]/5 animate-pulse" />

            {/* Sparkle decorations */}
            <div className="absolute top-4 right-4">
                <Sparkles className="h-5 w-5 text-[#FFD166] animate-pulse" />
            </div>

            <CardContent className="relative pt-8 pb-8 px-8">
                <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD166] text-[#1E1E1E] font-bold text-sm">
                        {hintIndex}
                    </span>
                    <span className="text-sm text-[#FFD166] font-medium uppercase tracking-wider">
                        Dica
                    </span>
                </div>

                <p className="text-xl text-white/90 font-light italic leading-relaxed">
                    "{hint}"
                </p>
            </CardContent>
        </Card>
    );
}
