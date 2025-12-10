import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GameAction {
  action: 'start' | 'next' | 'getHint' | 'verify' | 'reveal' | 'end' | 'status';
  groupId: string;
  userId?: string;
  guessUserId?: string;
  hintIndex?: number;
}

// Função para embaralhar array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, groupId, userId, guessUserId, hintIndex } = await req.json() as GameAction;

    console.log(`Game control action: ${action} for group: ${groupId}`);

    // Verificar se o usuário é owner do grupo
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      throw new Error('Grupo não encontrado');
    }

    // Buscar estado atual do jogo
    const { data: gameState } = await supabase
      .from('game_states')
      .select('*')
      .eq('group_id', groupId)
      .single();

    switch (action) {
      case 'start': {
        // Buscar jogadores elegíveis (perfis completos com dicas geradas)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('group_id', groupId)
          .eq('is_complete', true)
          .eq('hints_generated', true);

        if (profilesError) throw profilesError;
        
        if (!profiles || profiles.length < 2) {
          throw new Error('É necessário pelo menos 2 jogadores com perfis completos para iniciar o jogo');
        }

        const playerOrder = shuffleArray(profiles.map(p => p.user_id));

        // Criar ou atualizar GameState
        const gameStateData = {
          group_id: groupId,
          player_order: playerOrder,
          revealed_players: [],
          current_player_id: null,
          current_hint_index: 0,
          in_progress: true,
          started_at: new Date().toISOString(),
          ended_at: null,
        };

        const { error: upsertError } = await supabase
          .from('game_states')
          .upsert(gameStateData, { onConflict: 'group_id' });

        if (upsertError) throw upsertError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'O oráculo desperta… o jogo começou!',
            playerCount: playerOrder.length 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        if (!gameState) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              inProgress: false,
              message: 'Nenhum jogo em andamento' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Buscar lista de jogadores revelados com nomes
        const { data: revealedProfiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .in('id', gameState.revealed_players || []);

        return new Response(
          JSON.stringify({ 
            success: true,
            inProgress: gameState.in_progress,
            currentPlayerId: gameState.current_player_id,
            currentHintIndex: gameState.current_hint_index,
            revealedCount: gameState.revealed_players?.length || 0,
            totalPlayers: gameState.player_order?.length || 0,
            revealedPlayers: revealedProfiles || [],
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'next': {
        if (!gameState || !gameState.in_progress) {
          throw new Error('Nenhum jogo em andamento');
        }

        // Encontrar próximo jogador não revelado
        const remainingPlayers = gameState.player_order.filter(
          (id: string) => !gameState.revealed_players.includes(id)
        );

        if (remainingPlayers.length === 0) {
          throw new Error('Todos os jogadores já foram revelados');
        }

        const nextPlayerId = remainingPlayers[0];

        // Atualizar estado
        const { error: updateError } = await supabase
          .from('game_states')
          .update({
            current_player_id: nextPlayerId,
            current_hint_index: 0,
          })
          .eq('group_id', groupId);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Um novo mistério paira no ar…',
            remainingPlayers: remainingPlayers.length 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'getHint': {
        if (!gameState || !gameState.current_player_id) {
          throw new Error('Nenhum jogador selecionado');
        }

        const requestedHintIndex = hintIndex ?? (gameState.current_hint_index + 1);

        if (requestedHintIndex < 1 || requestedHintIndex > 3) {
          throw new Error('Índice de dica inválido');
        }

        // Buscar dica do jogador atual
        const { data: hint, error: hintError } = await supabase
          .from('hints')
          .select('hint1, hint2, hint3')
          .eq('group_id', groupId)
          .eq('user_id', gameState.current_player_id)
          .single();

        if (hintError || !hint) {
          throw new Error('Dicas não encontradas para este jogador');
        }

        const hintText = requestedHintIndex === 1 ? hint.hint1 : 
                         requestedHintIndex === 2 ? hint.hint2 : hint.hint3;

        // Atualizar índice de dica atual
        await supabase
          .from('game_states')
          .update({ current_hint_index: requestedHintIndex })
          .eq('group_id', groupId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            hint: hintText,
            hintIndex: requestedHintIndex,
            message: `Dica número ${requestedHintIndex}:`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify': {
        if (!gameState || !gameState.current_player_id || !guessUserId) {
          throw new Error('Dados inválidos para verificação');
        }

        const isCorrect = guessUserId === gameState.current_player_id;

        return new Response(
          JSON.stringify({ 
            success: true, 
            correct: isCorrect,
            message: isCorrect 
              ? 'Você decifrou o código humano!'
              : 'Amigo errado! O oráculo gargalha em silêncio.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reveal': {
        if (!gameState || !gameState.current_player_id) {
          throw new Error('Nenhum jogador para revelar');
        }

        const currentPlayerId = gameState.current_player_id;

        // Buscar dados do jogador
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .eq('id', currentPlayerId)
          .single();

        const { data: profile } = await supabase
          .from('profiles')
          .select('answers')
          .eq('group_id', groupId)
          .eq('user_id', currentPlayerId)
          .single();

        // Adicionar aos revelados
        const newRevealed = [...(gameState.revealed_players || []), currentPlayerId];
        const allRevealed = newRevealed.length >= gameState.player_order.length;

        await supabase
          .from('game_states')
          .update({
            revealed_players: newRevealed,
            current_player_id: null,
            current_hint_index: 0,
            in_progress: !allRevealed,
            ended_at: allRevealed ? new Date().toISOString() : null,
          })
          .eq('group_id', groupId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            player: {
              id: userProfile?.id,
              name: userProfile?.full_name || 'Jogador Misterioso',
              avatar: userProfile?.avatar_url,
              answers: profile?.answers || {},
            },
            gameEnded: allRevealed,
            message: allRevealed 
              ? 'Todos os mistérios foram revelados. Que comece a troca de presentes!'
              : 'Este era o ser misterioso descrito pela IA!',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'end': {
        await supabase
          .from('game_states')
          .update({
            in_progress: false,
            ended_at: new Date().toISOString(),
          })
          .eq('group_id', groupId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Jogo finalizado!'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Game control error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
