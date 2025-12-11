import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Loader2 } from 'lucide-react';
import { HintCard } from './HintCard';
import type { GamePlayer, HintData } from '@/types/game';

interface DualPlayerPanelProps {
    side: 'left' | 'right';
    currentHintIndex: number;
    currentHint: HintData | null;
    selectedGuess: string;
    availablePlayers: GamePlayer[];
    hasCorrectGuess: boolean;
    onShowHint: (hintIndex: number) => void;
    onSelectGuess: (userId: string) => void;
    onVerifyGuess: () => void;
    loading: boolean;
}

export function DualPlayerPanel({
    side,
    currentHintIndex,
    currentHint,
    selectedGuess,
    availablePlayers,
    hasCorrectGuess,
    onShowHint,
    onSelectGuess,
    onVerifyGuess,
    loading
}: DualPlayerPanelProps) {
    const label = side === 'left' ? 'Esquerda' : 'Direita';
    const colorClass = side === 'left' ? 'border-blue-500/30' : 'border-purple-500/30';
    const accentColor = side === 'left' ? 'bg-blue-500' : 'bg-purple-500';

    return (
        <Card className={`bg-[#1E1E1E]/80 ${colorClass}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${accentColor}`} />
                    {label}
                    {hasCorrectGuess && <Check className="h-5 w-5 text-green-500" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Botões de dicas */}
                <div className="flex gap-2 flex-wrap justify-center">
                    {[1, 2, 3].map((idx) => (
                        <Button
                            key={idx}
                            onClick={() => onShowHint(idx)}
                            disabled={loading || currentHintIndex >= idx}
                            variant={currentHintIndex >= idx ? 'default' : 'outline'}
                            className={
                                currentHintIndex >= idx
                                    ? `${accentColor} text-white hover:opacity-80`
                                    : `border-[#FFD166]/30 text-[#FFD166] hover:bg-[#FFD166]/10`
                            }
                        >
                            Dica {idx}
                        </Button>
                    ))}
                </div>

                {/* Exibir dica atual */}
                {currentHint && (
                    <HintCard
                        hint={currentHint.hint}
                        hintIndex={currentHint.hintIndex}
                        isRevealing={true}
                    />
                )}

                {/* Seletor de palpite */}
                {!hasCorrectGuess && (
                    <div className="space-y-3 pt-2">
                        <Select value={selectedGuess} onValueChange={onSelectGuess}>
                            <SelectTrigger className="bg-[#1E1E1E] border-[#FFD166]/30 text-white">
                                <SelectValue placeholder="Selecione um jogador..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1E1E1E] border-[#FFD166]/30">
                                {availablePlayers.map((p) => (
                                    <SelectItem
                                        key={p.id}
                                        value={p.id}
                                        className="text-white hover:bg-white/10"
                                    >
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={onVerifyGuess}
                            disabled={loading || !selectedGuess}
                            className={`w-full ${accentColor} hover:opacity-80`}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Verificar Palpite
                        </Button>
                    </div>
                )}

                {/* Palpite correto */}
                {hasCorrectGuess && (
                    <div className="text-center py-4 px-3 rounded-lg bg-green-500/20 border border-green-500/30">
                        <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                            <Check className="h-5 w-5" />
                            Palpite Correto!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
