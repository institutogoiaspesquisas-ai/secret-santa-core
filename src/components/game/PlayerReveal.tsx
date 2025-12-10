import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sparkles, PartyPopper } from 'lucide-react';
import type { GamePlayer } from '@/types/game';

interface PlayerRevealProps {
    player: GamePlayer | null;
    isOpen: boolean;
    onClose: () => void;
    onNextPlayer?: () => void;
    isGameEnded?: boolean;
}

export function PlayerReveal({ player, isOpen, onClose, onNextPlayer, isGameEnded }: PlayerRevealProps) {
    if (!player) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Pegar algumas respostas do perfil para exibir
    const profileHighlights = player.answers ? [
        { label: 'Três palavras', value: player.answers.tres_palavras },
        { label: 'Hobbies', value: player.answers.hobbies },
        { label: 'Algo inesperado', value: player.answers.algo_ninguem_imagina },
    ].filter(h => h.value) : [];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-[#1E1E1E] border-[#FFD166]/30">
                <DialogHeader>
                    <DialogTitle className="text-center text-[#FFD166] flex items-center justify-center gap-2">
                        <PartyPopper className="h-5 w-5" />
                        Identidade Revelada!
                        <PartyPopper className="h-5 w-5" />
                    </DialogTitle>
                </DialogHeader>

                <div className="text-center py-6">
                    {/* Avatar with glow */}
                    <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-[#FFD166]/30 rounded-full blur-xl animate-pulse" />
                        <Avatar className="h-28 w-28 border-4 border-[#FFD166] relative">
                            <AvatarImage src={player.avatar || undefined} />
                            <AvatarFallback className="bg-[#FFD166] text-[#1E1E1E] text-3xl font-bold">
                                {getInitials(player.name)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Name */}
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {player.name}
                    </h2>

                    <p className="text-white/60 mb-6">
                        Este era o ser misterioso descrito pela IA!
                    </p>

                    {/* Profile highlights */}
                    {profileHighlights.length > 0 && (
                        <div className="space-y-3 text-left bg-white/5 rounded-lg p-4 mb-6">
                            {profileHighlights.map((highlight, idx) => (
                                <div key={idx}>
                                    <p className="text-xs text-[#FFD166] uppercase tracking-wider mb-1">
                                        {highlight.label}
                                    </p>
                                    <p className="text-white/80 text-sm">
                                        {highlight.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        {isGameEnded ? (
                            <Button onClick={onClose} className="bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Finalizar Jogo
                            </Button>
                        ) : (
                            <Button onClick={onNextPlayer} className="bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Sortear Próximo Perfil
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
