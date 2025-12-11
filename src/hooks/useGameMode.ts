import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GameStatus, HintData, VerifyResult, RevealResult, GamePlayer, GameFeedbackType, DualRevealResult } from '@/types/game';
import { getRandomMessage, clearReactionsCache } from '@/constants/gameMessages';

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
    // Dual mode state
    dualLeftHint: HintData | null;
    dualRightHint: HintData | null;
    dualRevealResult: DualRevealResult | null;
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
        dualLeftHint: null,
        dualRightHint: null,
        dualRevealResult: null,
    });

    // Track used reaction IDs to avoid repetition within a round
    const usedSuccessIds = useRef<string[]>([]);
    const usedFailIds = useRef<string[]>([]);

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
                    isDualMode: data.isDualMode || false,
                    dualMode: data.dualMode || null,
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

            // Reset used IDs for new game
            usedSuccessIds.current = [];
            usedFailIds.current = [];
            clearReactionsCache();

            const message = await getRandomMessage('START');

            setState(s => ({
                ...s,
                loading: false,
                feedback: {
                    type: 'info',
                    message,
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

            const message = await getRandomMessage('NEW_ROUND');

            setState(s => ({
                ...s,
                loading: false,
                feedback: {
                    type: 'info',
                    message,
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
                const message = await getRandomMessage('CORRECT_GUESS', usedSuccessIds.current);

                setState(s => ({
                    ...s,
                    loading: false,
                    showConfetti: true,
                    feedback: {
                        type: 'success',
                        message,
                        isVisible: true,
                    },
                }));
            } else {
                const message = await getRandomMessage('WRONG_GUESS', usedFailIds.current);

                setState(s => ({
                    ...s,
                    loading: false,
                    feedback: {
                        type: 'error',
                        message,
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

    const startDualMode = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            await callGameControl('startDualMode');

            const message = await getRandomMessage('NEW_ROUND');

            setState(s => ({
                ...s,
                loading: false,
                feedback: {
                    type: 'info',
                    message,
                    isVisible: true,
                },
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao iniciar modo dual'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const showDualHint = useCallback(async (side: 'left' | 'right', hintIndex: number) => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('getDualHint', { side, hintIndex });

            const hintData: HintData = {
                hint: data.hint,
                hintIndex: data.hintIndex,
                message: data.message,
            };

            setState(s => ({
                ...s,
                loading: false,
                [side === 'left' ? 'dualLeftHint' : 'dualRightHint']: hintData,
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao exibir dica dual'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const verifyDualGuess = useCallback(async (side: 'left' | 'right', guessUserId: string) => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('verifyDualGuess', { side, guessUserId });

            if (data.correct) {
                const message = await getRandomMessage('CORRECT_GUESS', usedSuccessIds.current);

                setState(s => ({
                    ...s,
                    loading: false,
                    feedback: {
                        type: 'success',
                        message,
                        isVisible: true,
                    },
                }));
            } else {
                const message = await getRandomMessage('WRONG_GUESS', usedFailIds.current);

                setState(s => ({
                    ...s,
                    loading: false,
                    feedback: {
                        type: 'error',
                        message,
                        isVisible: true,
                    },
                }));
            }

            await fetchStatus();
            return data.correct;
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao verificar palpite dual'
            }));
            return false;
        }
    }, [callGameControl, fetchStatus]);

    const revealDual = useCallback(async () => {
        try {
            setState(s => ({ ...s, loading: true, error: null }));
            const data = await callGameControl('revealDual');

            setState(s => ({
                ...s,
                loading: false,
                dualRevealResult: {
                    leftPlayer: data.leftPlayer,
                    rightPlayer: data.rightPlayer,
                    gameEnded: data.gameEnded,
                    message: data.message,
                },
                isGameEnded: data.gameEnded,
                showConfetti: true,
            }));

            await fetchStatus();
        } catch (err) {
            setState(s => ({
                ...s,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro ao revelar jogadores'
            }));
        }
    }, [callGameControl, fetchStatus]);

    const clearDualReveal = useCallback(() => {
        setState(s => ({ ...s, dualRevealResult: null }));
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
        // Dual mode functions
        startDualMode,
        showDualHint,
        verifyDualGuess,
        revealDual,
        clearDualReveal,
    };
}
