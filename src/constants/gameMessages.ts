import { supabase } from '@/integrations/supabase/client';

export type ReactionType = 'success' | 'fail';

export interface Reaction {
    id: string;
    type: ReactionType;
    text: string;
    is_default: boolean;
    created_at: string;
}

// Mapeamento de categorias antigas para novos tipos
const categoryToType: Record<string, ReactionType> = {
    CORRECT_GUESS: 'success',
    REVEAL: 'success',
    GAME_END: 'success',
    WRONG_GUESS: 'fail',
};

// Cache local de reactions carregadas
let reactionsCache: { success: Reaction[]; fail: Reaction[] } | null = null;

/**
 * Carrega todas as reactions do banco (com cache)
 */
export async function loadReactions(): Promise<{ success: Reaction[]; fail: Reaction[] }> {
    if (reactionsCache) {
        return reactionsCache;
    }

    const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao carregar reactions:', error);
        // Fallback para mensagens estáticas
        return { success: [], fail: [] };
    }

    reactionsCache = {
        success: (data || []).filter(r => r.type === 'success') as Reaction[],
        fail: (data || []).filter(r => r.type === 'fail') as Reaction[],
    };

    return reactionsCache;
}

/**
 * Limpa o cache de reactions (útil após gerar novas)
 */
export function clearReactionsCache(): void {
    reactionsCache = null;
}

/**
 * Obtém uma reaction aleatória do tipo especificado, evitando IDs já usados
 */
export async function getRandomReaction(
    type: ReactionType,
    usedIds: string[] = []
): Promise<Reaction | null> {
    const reactions = await loadReactions();
    const typeReactions = reactions[type];

    if (typeReactions.length === 0) {
        return null;
    }

    // Filtrar IDs já usados
    const available = typeReactions.filter(r => !usedIds.includes(r.id));

    // Se todas já foram usadas, resetar
    if (available.length === 0) {
        const randomIndex = Math.floor(Math.random() * typeReactions.length);
        return typeReactions[randomIndex];
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}

/**
 * Obtém mensagem aleatória por categoria (compatibilidade com código antigo)
 */
export async function getRandomMessage(
    category: 'START' | 'NEW_ROUND' | 'WRONG_GUESS' | 'CORRECT_GUESS' | 'REVEAL' | 'GAME_END',
    usedIds: string[] = []
): Promise<string> {
    // Categorias especiais que não vêm do banco
    const staticMessages: Record<string, string[]> = {
        START: [
            '🎮 Que os jogos comecem!',
            '✨ O mistério está no ar...',
            '🎯 Hora de descobrir quem é quem!',
        ],
        NEW_ROUND: [
            '🎲 Nova rodada! Quem será o próximo?',
            '🔮 O oráculo sorteou mais um mistério...',
            '⭐ Próximo perfil misterioso chegando!',
        ],
    };

    // Para categorias estáticas
    if (staticMessages[category]) {
        const messages = staticMessages[category];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Para categorias que vêm do banco
    const type = categoryToType[category];
    if (!type) {
        return 'Algo aconteceu!';
    }

    const reaction = await getRandomReaction(type, usedIds);
    return reaction?.text || 'Algo aconteceu!';
}

/**
 * Gera novas reactions via Edge Function
 */
export async function generateNewReactions(
    type: ReactionType,
    count: number
): Promise<{ success: boolean; count: number; message: string }> {
    const { data, error } = await supabase.functions.invoke('generate-reactions', {
        body: { type, count },
    });

    if (error) {
        return { success: false, count: 0, message: error.message };
    }

    // Limpar cache para incluir novas frases
    clearReactionsCache();

    return data;
}
