import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, HelpCircle, Users } from 'lucide-react';
import type { GamePlayer } from '@/types/game';

interface GameSidebarProps {
    currentHintIndex: number;
    revealedPlayers: GamePlayer[];
    totalPlayers: number;
    hasCurrentPlayer: boolean;
}

export function GameSidebar({
    currentHintIndex,
    revealedPlayers,
    totalPlayers,
    hasCurrentPlayer
}: GameSidebarProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const remainingPlayers = totalPlayers - revealedPlayers.length;

    return (
        <Card className="bg-[#1E1E1E]/80 border-[#FFD166]/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#FFD166]" />
                    Status do Jogo
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current round status */}
                <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/60">Jogador atual</span>
                        <Badge variant="outline" className="border-[#FFD166]/30 text-[#FFD166]">
                            {hasCurrentPlayer ? (
                                <>
                                    <HelpCircle className="h-3 w-3 mr-1" />
                                    Oculto
                                </>
                            ) : 'Aguardando...'}
                        </Badge>
                    </div>

                    {hasCurrentPlayer && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/60">Dica exibida</span>
                            <span className="text-white font-medium">
                                {currentHintIndex > 0 ? `${currentHintIndex} / 3` : '—'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/60">Progresso</span>
                        <span className="text-white font-medium">
                            {revealedPlayers.length} / {totalPlayers}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#FFD166] transition-all duration-500"
                            style={{ width: `${totalPlayers > 0 ? (revealedPlayers.length / totalPlayers) * 100 : 0}%` }}
                        />
                    </div>

                    <p className="text-xs text-white/40 mt-2">
                        {remainingPlayers > 0
                            ? `${remainingPlayers} jogador${remainingPlayers > 1 ? 'es' : ''} restante${remainingPlayers > 1 ? 's' : ''}`
                            : 'Todos revelados!'
                        }
                    </p>
                </div>

                {/* Revealed players list */}
                {revealedPlayers.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-white/60 mb-2">
                            Revelados
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {revealedPlayers.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={player.avatar || undefined} />
                                        <AvatarFallback className="bg-[#FFD166]/20 text-[#FFD166] text-xs">
                                            {getInitials(player.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-white/80 flex-1 truncate">
                                        {player.name}
                                    </span>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
