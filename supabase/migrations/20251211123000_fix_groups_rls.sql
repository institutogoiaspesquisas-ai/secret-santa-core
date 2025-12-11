-- Atualizar policy de visualização de grupos para incluir membros pendentes
-- Isso permite que o usuário veja o card do grupo no Dashboard enquanto aguarda aprovação
-- NÃO expõe a lista de membros (que é protegida por outra policy na tabela group_members)
DROP POLICY "Users can view groups they own or are members of" ON public.groups;
CREATE POLICY "Users can view groups they participate in" ON public.groups FOR
SELECT USING (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.group_members
            WHERE group_members.group_id = groups.id
                AND group_members.user_id = auth.uid()
        )
    );