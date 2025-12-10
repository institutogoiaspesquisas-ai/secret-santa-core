import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GameStatus, HintData, VerifyResult, RevealResult, GamePlayer, GameFeedbackType } from '@/types/game';
import { getRandomMessage } from '@/constants/gameMessages';

interface UseGameModeProps {
    groupId: string;
}

interface GameModeState {
    status: GameStatus | null;
    currentHint: HintData | null;
    loading: boolean;
    error: string | null;
    feedback: {
        type: GameFeedbackType;
        message: string;
        isVisible: boolean;
    } | null;
    revealedPlayer: GamePlayer | null;
    showConfetti: boolean;
    isGameEnded: boolean;
}

export function useGameMode({ groupId }: UseGameModeProps) {
    const [state, setState] = useState<GameModeState>({
        status: null,
        currentHint: null,
        loading: false,
        error: null,
        feedback: null,
        revealedPlayer: null,
        showConfetti: false,
        isGameEnded: false,
    });

    const callGameControl = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
        const { data, error } = await supabase.functions.invoke('game-control', {
            body: { action, groupId, ...params }
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error || 'Erro desconhecido');

        return data;
    }, [groupId]);

    const fetchStatus = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('status');

            setState(s => ({
                ...s,
                status: {
                    inProgress: data.inProgress,
                    currentPlayerId: data.currentPlayerId,
                    currentHintIndex: data.currentHintIndex,
                    revealedCount: data.revealedCount,
                    totalPlayers: data.totalPlayers,
                    revealedPlayers: data.revealedPlayers || [],
                },
                loading: false,
            }));
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao carregar status'
            }));
        }
    }, [callGameControl]);

    const startGame = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            await callGameControl('start');

            setState(s => ({
                ...s,
                loading: false,
                feedback: {
                    type: 'info',
                    message: getRandomMessage('START'),
                    isVisible: true,
                },
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao iniciar jogo'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const nextPlayer = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null, currentHint: null }));
            await callGameControl('next');

            setState(s => ({
                ...s,
                loading: false,
                feedback: {
                    type: 'info',
                    message: getRandomMessage('NEW_ROUND'),
                    isVisible: true,
                },
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao sortear próximo jogador'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const showHint = useCallback(async (hintIndex: number) => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('getHint', { hintIndex });

            setState(s => ({
                ...s,
                loading: false,
                currentHint: {
                    hint: data.hint,
                    hintIndex: data.hintIndex,
                    message: data.message,
                },
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao exibir dica'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const verifyGuess = useCallback(async (guessUserId: string) => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('verify', { guessUserId }) as VerifyResult & { success: boolean };

            if (data.correct) {
                setState(s => ({
                    ...s,
                    loading: false,
                    showConfetti: true,
                    feedback: {
                        type: 'success',
                        message: getRandomMessage('CORRECT_GUESS'),
                        isVisible: true,
                    },
                }));
            } else {
                setState(s => ({
                    ...s,
                    loading: false,
                    feedback: {
                        type: 'error',
                        message: getRandomMessage('WRONG_GUESS'),
                        isVisible: true,
                    },
                }));
            }

            return data.correct;
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao verificar palpite'
            }));
            return false;
        }
    }, [callGameControl]);

    const revealPlayer = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('reveal') as RevealResult & { success: boolean };

            setState(s => ({
                ...s,
                loading: false,
                revealedPlayer: data.player,
                isGameEnded: data.gameEnded,
                currentHint: null,
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao revelar jogador'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const endGame = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            await callGameControl('end');

            setState(s => ({
                ...s,
                loading: false,
                status: null,
                currentHint: null,
                isGameEnded: true,
            }));
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao finalizar jogo'
            }));
        }
    }, [callGameControl]);

    const clearFeedback = useCallback(() => {
        setState(s => ({ ...s, feedback: null }));
    }, []);

    const clearConfetti = useCallback(() => {
        setState(s => ({ ...s, showConfetti: false }));
    }, []);

    const clearRevealedPlayer = useCallback(() => {
        setState(s => ({ ...s, revealedPlayer: null }));
    }, []);

    return {
        ...state,
        fetchStatus,
        startGame,
        nextPlayer,
        showHint,
        verifyGuess,
        revealPlayer,
        endGame,
        clearFeedback,
        clearConfetti,
        clearRevealedPlayer,
    };
}
