-- Tabela de estado do jogo
CREATE TABLE public.game_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE UNIQUE,
    player_order UUID [] NOT NULL DEFAULT '{}',
    revealed_players UUID [] NOT NULL DEFAULT '{}',
    current_player_id UUID,
    current_hint_index INTEGER DEFAULT 0,
    in_progress BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Habilitar RLS
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
-- Policy: Apenas owner do grupo pode visualizar o GameState
CREATE POLICY "Group owners can view game state" ON public.game_states FOR
SELECT USING (public.is_group_owner(auth.uid(), group_id));
-- Policy: Apenas owner do grupo pode criar GameState
CREATE POLICY "Group owners can create game state" ON public.game_states FOR
INSERT WITH CHECK (public.is_group_owner(auth.uid(), group_id));
-- Policy: Apenas owner do grupo pode atualizar GameState
CREATE POLICY "Group owners can update game state" ON public.game_states FOR
UPDATE USING (public.is_group_owner(auth.uid(), group_id));
-- Policy: Apenas owner do grupo pode deletar GameState
CREATE POLICY "Group owners can delete game state" ON public.game_states FOR DELETE USING (public.is_group_owner(auth.uid(), group_id));
-- Trigger para atualizar updated_at
CREATE TRIGGER update_game_states_updated_at BEFORE
UPDATE ON public.game_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Policy para hints: owner do grupo pode ver hints durante o jogo
CREATE POLICY "Group owners can view hints during game" ON public.hints FOR
SELECT USING (
        public.is_group_owner(auth.uid(), group_id)
        AND EXISTS (
            SELECT 1
            FROM public.game_states gs
            WHERE gs.group_id = hints.group_id
                AND gs.in_progress = true
        )
    );