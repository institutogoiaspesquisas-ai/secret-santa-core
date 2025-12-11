import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Group {
    id: string;
    name: string;
    code: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    role: 'owner' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user_profiles?: {
        id: string;
        full_name: string | null;
        email: string | null;
        avatar_url: string | null;
    };
}

export interface GroupWithDetails extends Group {
    role: 'owner' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    memberCount: number;
    pendingCount: number;
    profileComplete: boolean;
    hintsGenerated: boolean;
}

export function useGroups() {
    const [groups, setGroups] = useState<GroupWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setGroups([]);
                setLoading(false);
                return;
            }

            // Buscar memberships do usuário
            const { data: memberships, error: membershipError } = await supabase
                .from('group_members')
                .select('id, role, status, group_id')
                .eq('user_id', user.id);

            if (membershipError) throw membershipError;

            if (!memberships || memberships.length === 0) {
                setGroups([]);
                setLoading(false);
                return;
            }

            // Buscar dados de cada grupo
            const groupIds = memberships.map(m => m.group_id);
            const { data: groupsData, error: groupsError } = await supabase
                .from('groups')
                .select('*')
                .in('id', groupIds);

            if (groupsError) throw groupsError;

            const groupsMap = new Map<string, Group>(
                (groupsData || []).map(g => [g.id, g as Group])
            );

            // Para cada membership, buscar contagens e status do perfil
            const groupsWithDetails = await Promise.all(
                memberships
                    .filter(m => groupsMap.has(m.group_id))
                    .map(async (membership) => {
                        const group = groupsMap.get(membership.group_id)!;

                        // Contar membros aprovados
                        const { count: memberCount } = await supabase
                            .from('group_members')
                            .select('*', { count: 'exact', head: true })
                            .eq('group_id', group.id)
                            .eq('status', 'approved');

                        // Contar pendentes (apenas para owners)
                        const { count: pendingCount } = await supabase
                            .from('group_members')
                            .select('*', { count: 'exact', head: true })
                            .eq('group_id', group.id)
                            .eq('status', 'pending');

                        // Verificar se o usuário tem perfil completo
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('is_complete, hints_generated')
                            .eq('group_id', group.id)
                            .eq('user_id', user.id)
                            .maybeSingle();

                        return {
                            ...group,
                            role: membership.role as 'owner' | 'member',
                            status: membership.status as 'pending' | 'approved' | 'rejected',
                            memberCount: memberCount || 0,
                            pendingCount: pendingCount || 0,
                            profileComplete: profile?.is_complete || false,
                            hintsGenerated: profile?.hints_generated || false,
                        };
                    })
            );

            setGroups(groupsWithDetails);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar grupos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const createGroup = async (name: string, code: string): Promise<{ success: boolean; groupId?: string; error?: string }> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            // Criar o grupo
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name,
                    code,
                    owner_id: user.id,
                })
                .select()
                .single();

            if (groupError) throw groupError;

            // Adicionar owner como membro aprovado
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'owner',
                    status: 'approved',
                });

            if (memberError) throw memberError;

            await fetchGroups();
            return { success: true, groupId: group.id };
        } catch (err) {
            console.error('Error creating group:', err);
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar grupo' };
        }
    };

    const joinGroup = async (code: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            // Verificar se o grupo existe (via RPC para bypass RLS)
            const { data: group, error: groupError } = await supabase
                .rpc('get_group_by_code', { code_input: code })
                .maybeSingle();

            if (groupError) throw groupError;
            if (!group) {
                return { success: false, error: 'Grupo não encontrado. Verifique o código.' };
            }

            // Verificar se já é membro
            const { data: existingMember } = await supabase
                .from('group_members')
                .select('id, status')
                .eq('group_id', group.id)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingMember) {
                if (existingMember.status === 'pending') {
                    return { success: false, error: 'Você já tem uma solicitação pendente para este grupo.' };
                }
                if (existingMember.status === 'approved') {
                    return { success: false, error: 'Você já é membro deste grupo.' };
                }
                if (existingMember.status === 'rejected') {
                    // Permitir reenviar solicitação
                    await supabase
                        .from('group_members')
                        .update({ status: 'pending' })
                        .eq('id', existingMember.id);

                    await fetchGroups();
                    return { success: true };
                }
            }

            // Criar solicitação pendente
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'member',
                    status: 'pending',
                });

            if (memberError) throw memberError;

            await fetchGroups();
            return { success: true };
        } catch (err) {
            console.error('Error joining group:', err);
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao entrar no grupo' };
        }
    };

    return {
        groups,
        loading,
        error,
        createGroup,
        joinGroup,
        refetch: fetchGroups,
    };
}
