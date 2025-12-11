import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Shuffle, Eye, Check, Sparkles, Loader2, Trophy, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameMode } from '@/hooks/useGameMode';
import { ConfettiEffect } from '@/components/game/ConfettiEffect';
import { HintCard } from '@/components/game/HintCard';
import { GameFeedback } from '@/components/game/GameFeedback';
import { PlayerReveal } from '@/components/game/PlayerReveal';
import { GameSidebar } from '@/components/game/GameSidebar';
import { ReactionsAdminPanel } from '@/components/game/ReactionsAdminPanel';
import { DualPlayerPanel } from '@/components/game/DualPlayerPanel';
import { DualRevealModal } from '@/components/game/DualRevealModal';

interface GroupMember {
    id: string;
    user_id: string;
    user_profiles: {
        id: string;
        full_name: string | null;
    } | null;
}

export default function GameMode() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isOwner, setIsOwner] = useState(false);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [selectedGuess, setSelectedGuess] = useState<string>('');
    const [awaitingReveal, setAwaitingReveal] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [showReactionsPanel, setShowReactionsPanel] = useState(false);

    const {
        status,
        currentHint,
        loading,
        error,
        feedback,
        revealedPlayer,
        showConfetti,
        isGameEnded,
        fetchStatus,
        startGame,
        nextPlayer,
        showHint,
        verifyGuess,
        revealPlayer,
        clearFeedback,
        clearConfetti,
        clearRevealedPlayer,
    } = useGameMode({ groupId: groupId || '' });

    // Check if user is owner
    useEffect(() => {
        const checkOwner = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            const { data: group } = await supabase
                .from('groups')
                .select('owner_id')
                .eq('id', groupId)
                .single();

            if (!group || group.owner_id !== user.id) {
                toast({
                    title: 'Acesso negado',
                    description: 'Apenas o dono do grupo pode acessar o Modo Jogo.',
                    variant: 'destructive',
                });
                navigate(`/grupo/${groupId}`);
                return;
            }

            setIsOwner(true);
            setCheckingAuth(false);
        };

        checkOwner();
    }, [groupId, navigate, toast]);

    // Fetch game status and members
    useEffect(() => {
        if (!isOwner || !groupId) return;

        fetchStatus();

        const fetchMembers = async () => {
            // 1. Fetch group members
            const { data: membersData } = await supabase
                .from('group_members')
                .select('id, user_id')
                .eq('group_id', groupId)
                .eq('status', 'approved');

            if (!membersData) return;

            // 2. Fetch user profiles for these members
            const userIds = membersData.map(m => m.user_id);
            const { data: profilesData } = await supabase
                .from('user_profiles')
                .select('id, full_name')
                .in('id', userIds);

            // 3. Map profiles to members
            const profilesMap = new Map(
                profilesData?.map(p => [p.id, p]) || []
            );

            const joinedMembers = membersData.map(member => ({
                id: member.id,
                user_id: member.user_id,
                user_profiles: profilesMap.get(member.user_id) || null
            }));

            setMembers(joinedMembers);
        };

        fetchMembers();
    }, [isOwner, groupId, fetchStatus]);

    useEffect(() => {
        if (error) {
            toast({
                title: 'Erro',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, toast]);

    const handleVerifyGuess = async () => {
        if (!selectedGuess) {
            toast({
                title: 'Selecione um jogador',
                description: 'Escolha um nome no menu antes de verificar.',
            });
            return;
        }

        const isCorrect = await verifyGuess(selectedGuess);
        if (isCorrect) {
            setAwaitingReveal(true);
        }
        setSelectedGuess('');
    };

    const handleReveal = async () => {
        await revealPlayer();
        setAwaitingReveal(false);
    };

    const handleNextAfterReveal = () => {
        clearRevealedPlayer();
        if (!isGameEnded) {
            nextPlayer();
        }
    };

    // Filter out already revealed players from selection
    const availablePlayers = members.filter(
        m => !status?.revealedPlayers.some(rp => rp.id === m.user_id)
    );

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#101820]">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFD166]" />
            </div>
        );
    }

    const gameNotStarted = !status?.inProgress && !isGameEnded;
    const hasCurrentPlayer = !!status?.currentPlayerId;

    return (
        <div className="min-h-screen game-bg particles-bg">
            {/* Confetti effect */}
            <ConfettiEffect
                isActive={showConfetti}
                onComplete={clearConfetti}
            />

            {/* Feedback overlay */}
            {feedback && (
                <GameFeedback
                    type={feedback.type}
                    message={feedback.message}
                    isVisible={feedback.isVisible}
                    onComplete={clearFeedback}
                />
            )}

            {/* Player reveal modal */}
            <PlayerReveal
                player={revealedPlayer}
                isOpen={!!revealedPlayer}
                onClose={clearRevealedPlayer}
                onNextPlayer={handleNextAfterReveal}
                isGameEnded={isGameEnded}
            />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#101820]/90 backdrop-blur-md border-b border-[#FFD166]/20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={`/grupo/${groupId}`}>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-[#FFD166] icon-pulse" />
                            <span className="font-display font-bold text-lg text-white">Modo Jogo</span>
                        </div>
                    </div>

                    {status?.inProgress && (
                        <div className="text-sm text-white/60">
                            {status.revealedCount} / {status.totalPlayers} revelados
                        </div>
                    )}

                    {/* Admin button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowReactionsPanel(true)}
                        className="text-white/60 hover:text-white hover:bg-white/10 btn-hover-scale"
                        title="Gerenciar frases"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-[1fr_300px] gap-6">
                    {/* Main game area */}
                    <div className="space-y-6">
                        {/* Game not started */}
                        {gameNotStarted && (
                            <Card className="bg-[#1E1E1E] border-[#FFD166]/20">
                                <CardContent className="pt-8 pb-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-[#FFD166]/20 flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="h-10 w-10 text-[#FFD166]" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                                        Modo Jogo
                                    </h2>
                                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                                        Inicie o jogo para começar a revelar as identidades secretas!
                                        Cada participante terá 3 dicas enigmáticas geradas pela IA.
                                    </p>
                                    <Button
                                        onClick={startGame}
                                        disabled={loading}
                                        className="bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80 gap-2 btn-hover-scale"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Play className="h-5 w-5" />
                                        )}
                                        Iniciar Jogo
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Game ended */}
                        {isGameEnded && !revealedPlayer && (
                            <Card className="bg-[#1E1E1E] border-[#FFD166]/20">
                                <CardContent className="pt-8 pb-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-[#FFD166] flex items-center justify-center mx-auto mb-6">
                                        <Trophy className="h-10 w-10 text-[#1E1E1E]" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                                        🎉 Jogo Finalizado!
                                    </h2>
                                    <p className="text-white/60 mb-6">
                                        Todos os mistérios foram revelados. Que comece a troca de presentes!
                                    </p>
                                    <Link to={`/grupo/${groupId}`}>
                                        <Button variant="outline" className="border-[#FFD166]/30 text-[#FFD166] hover:bg-[#FFD166]/10 btn-hover-scale">
                                            Voltar ao Grupo
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Game in progress - no current player */}
                        {status?.inProgress && !hasCurrentPlayer && (
                            <Card className="bg-[#1E1E1E] border-[#FFD166]/20">
                                <CardContent className="pt-8 pb-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-[#2E8BFF]/20 flex items-center justify-center mx-auto mb-4">
                                        <Shuffle className="h-8 w-8 text-[#2E8BFF]" />
                                    </div>
                                    <h3 className="text-xl font-display font-semibold text-white mb-2">
                                        Pronto para a próxima rodada?
                                    </h3>
                                    <p className="text-white/60 mb-6">
                                        Clique abaixo para sortear o próximo perfil misterioso.
                                    </p>
                                    <Button
                                        onClick={nextPlayer}
                                        disabled={loading}
                                        className="bg-[#2E8BFF] hover:bg-[#2E8BFF]/80 gap-2 btn-hover-scale"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Shuffle className="h-4 w-4" />
                                        )}
                                        Sortear Próximo Perfil
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Game in progress - has current player */}
                        {status?.inProgress && hasCurrentPlayer && (
                            <>
                                {/* Hint display area */}
                                <Card className="bg-[#1E1E1E]/50 border-[#FFD166]/10">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-[#FFD166]" />
                                            Dicas do Mistério
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Hint buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            {[1, 2, 3].map((idx) => (
                                                <Button
                                                    key={idx}
                                                    onClick={() => showHint(idx)}
                                                    disabled={loading || (status.currentHintIndex >= idx && currentHint?.hintIndex === idx)}
                                                    variant={status.currentHintIndex >= idx ? 'default' : 'outline'}
                                                    className={
                                                        status.currentHintIndex >= idx
                                                            ? 'bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80'
                                                            : 'border-[#FFD166]/30 text-[#FFD166] hover:bg-[#FFD166]/10'
                                                    }
                                                >
                                                    Mostrar Dica {idx}
                                                </Button>
                                            ))}
                                        </div>

                                        {/* Current hint display */}
                                        {currentHint && (
                                            <HintCard
                                                hint={currentHint.hint}
                                                hintIndex={currentHint.hintIndex}
                                                isRevealing={true}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Guess area */}
                                {!awaitingReveal && (
                                    <Card className="bg-[#1E1E1E]/50 border-[#FFD166]/10">
                                        <CardHeader>
                                            <CardTitle className="text-white">Fazer Palpite</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Select value={selectedGuess} onValueChange={setSelectedGuess}>
                                                <SelectTrigger className="bg-[#1E1E1E] border-[#FFD166]/30 text-white">
                                                    <SelectValue placeholder="Selecione um jogador..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1E1E1E] border-[#FFD166]/30">
                                                    {availablePlayers.map((member) => (
                                                        <SelectItem
                                                            key={member.user_id}
                                                            value={member.user_id}
                                                            className="text-white hover:bg-white/10"
                                                        >
                                                            {member.user_profiles?.full_name || 'Jogador'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                onClick={handleVerifyGuess}
                                                disabled={loading || !selectedGuess}
                                                className="w-full bg-[#2E8BFF] hover:bg-[#2E8BFF]/80 gap-2"
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                                Verificar Palpite
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Awaiting reveal */}
                                {awaitingReveal && (
                                    <Card className="bg-[#1E1E1E] border-[#FFD166]/30">
                                        <CardContent className="pt-8 pb-8 text-center">
                                            <div className="w-16 h-16 rounded-full bg-[#FFD166] flex items-center justify-center mx-auto mb-4">
                                                <Trophy className="h-8 w-8 text-[#1E1E1E]" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                Palpite Correto! 🎉
                                            </h3>
                                            <p className="text-white/60 mb-6">
                                                Clique para revelar a identidade do jogador.
                                            </p>
                                            <Button
                                                onClick={handleReveal}
                                                disabled={loading}
                                                className="bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80 gap-2"
                                            >
                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4" />
                                                )}
                                                Revelar Identidade
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    {(status?.inProgress || (status?.revealedPlayers && status.revealedPlayers.length > 0)) && (
                        <div className="lg:block">
                            <GameSidebar
                                currentHintIndex={status?.currentHintIndex || 0}
                                revealedPlayers={status?.revealedPlayers || []}
                                totalPlayers={status?.totalPlayers || 0}
                                hasCurrentPlayer={hasCurrentPlayer}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* Reactions Admin Panel */}
            <ReactionsAdminPanel
                isOpen={showReactionsPanel}
                onClose={() => setShowReactionsPanel(false)}
            />
        </div>
    );
}
