export interface GameState {
    id: string;
    group_id: string;
    player_order: string[];
    revealed_players: string[];
    current_player_id: string | null;
    current_hint_index: number;
    in_progress: boolean;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface GamePlayer {
    id: string;
    name: string;
    avatar?: string | null;
    answers?: Record<string, string>;
}

export interface GameStatus {
    inProgress: boolean;
    currentPlayerId: string | null;
    currentHintIndex: number;
    revealedCount: number;
    totalPlayers: number;
    revealedPlayers: GamePlayer[];
}

export interface HintData {
    hint: string;
    hintIndex: number;
    message: string;
}

export interface VerifyResult {
    correct: boolean;
    message: string;
}

export interface RevealResult {
    player: GamePlayer;
    gameEnded: boolean;
    message: string;
}

export type GameFeedbackType = 'success' | 'error' | 'info';
