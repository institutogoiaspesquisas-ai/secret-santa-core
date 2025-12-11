import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import type { GamePlayer } from '@/types/game';

interface DualRevealModalProps {
    leftPlayer: GamePlayer | null;
    rightPlayer: GamePlayer | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DualRevealModal({ leftPlayer, rightPlayer, isOpen, onClose }: DualRevealModalProps) {
    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-[#1E1E1E] border-[#FFD166]/30">
                <DialogHeader>
                    <DialogTitle className="text-center text-[#FFD166] text-2xl flex items-center justify-center gap-2">
                        <Trophy className="h-6 w-6" />
                        🎉 Revelação Final! 🎉
                        <Trophy className="h-6 w-6" />
                    </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-8 py-6">
                    {/* Jogador Esquerda */}
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                            <Avatar className="h-32 w-32  mx-auto border-4 border-blue-500 relative">
                                <AvatarImage src={leftPlayer?.avatar || undefined} />
                                <AvatarFallback className="bg-blue-500 text-white text-3xl font-bold">
                                    {getInitials(leftPlayer?.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <p className="text-sm text-white/60 mb-1">Esquerda</p>
                            <h2 className="text-2xl font-bold text-white">
                                {leftPlayer?.name}
                            </h2>
                        </div>
                    </div>

                    {/* Jogador Direita */}
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
                            <Avatar className="h-32 w-32 mx-auto border-4 border-purple-500 relative">
                                <AvatarImage src={rightPlayer?.avatar || undefined} />
                                <AvatarFallback className="bg-purple-500 text-white text-3xl font-bold">
                                    {getInitials(rightPlayer?.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <p className="text-sm text-white/60 mb-1">Direita</p>
                            <h2 className="text-2xl font-bold text-white">
                                {rightPlayer?.name}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-white/80 mb-4">
                        Todos os mistérios foram revelados. Que comece a troca de presentes!
                    </p>
                    <Button
                        onClick={onClose}
                        className="bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80 gap-2 px-8"
                    >
                        <Sparkles className="h-4 w-4" />
                        Finalizar Jogo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
