import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

// Helper: Retry getUser() to handle session establishment delays
const getUserWithRetry = async (maxRetries = 3, delayMs = 1000): Promise<User | null> => {
    for (let i = 0; i < maxRetries; i++) {
        console.log(`[GROUPS] Attempting to get user (attempt ${i + 1}/${maxRetries})...`);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            console.log('[GROUPS] User found:', { userId: user.id });
            return user;
        }

        // Wait before retry
        if (i < maxRetries - 1) {
            console.log(`[GROUPS] User not found, waiting ${delayMs}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.error('[GROUPS] Failed to get user after all retries');
    return null;
};

// Helper: Wait for user_profile to be created by trigger
const waitForUserProfile = async (userId: string, maxRetries = 5, delayMs = 500): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
        console.log(`[GROUPS] Checking if user_profile exists (attempt ${i + 1}/${maxRetries})...`);
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        if (data && !error) {
            console.log('[GROUPS] User profile found');
            return true;
        }

        if (i < maxRetries - 1) {
            console.log(`[GROUPS] Profile not found yet, waiting ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    console.error('[GROUPS] User profile not created after all retries');
    return false;
};

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

            // OPTIMIZATION: Fetch all member counts in one query per status
            const { data: allMembers } = await supabase
                .from('group_members')
                .select('group_id, status')
                .in('group_id', groupIds);

            // Count members per group
            const memberCountMap = new Map<string, number>();
            const pendingCountMap = new Map<string, number>();

            (allMembers || []).forEach(m => {
                if (m.status === 'approved') {
                    memberCountMap.set(m.group_id, (memberCountMap.get(m.group_id) || 0) + 1);
                } else if (m.status === 'pending') {
                    pendingCountMap.set(m.group_id, (pendingCountMap.get(m.group_id) || 0) + 1);
                }
            });

            // OPTIMIZATION: Fetch all user profiles in one query
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('group_id, is_complete, hints_generated')
                .in('group_id', groupIds)
                .eq('user_id', user.id);

            const profilesMap = new Map<string, { is_complete: boolean; hints_generated: boolean }>(
                (allProfiles || []).map(p => [p.group_id, { is_complete: p.is_complete, hints_generated: p.hints_generated }])
            );

            // Build groups with details - NO MORE INDIVIDUAL QUERIES
            const groupsWithDetails = memberships
                .filter(m => groupsMap.has(m.group_id))
                .map((membership) => {
                    const group = groupsMap.get(membership.group_id)!;
                    const profile = profilesMap.get(group.id);

                    return {
                        ...group,
                        role: membership.role as 'owner' | 'member',
                        status: membership.status as 'pending' | 'approved' | 'rejected',
                        memberCount: memberCountMap.get(group.id) || 0,
                        pendingCount: pendingCountMap.get(group.id) || 0,
                        profileComplete: profile?.is_complete || false,
                        hintsGenerated: profile?.hints_generated || false,
                    };
                });

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
            console.log('[GROUPS] Starting joinGroup...', { code });

            // Use retry logic to get user (handles session timing issues)
            const user = await getUserWithRetry();

            if (!user) {
                return {
                    success: false,
                    error: 'Sessão expirada ou não encontrada. Por favor, faça logout e login novamente.'
                };
            }

            // Wait for user_profile to be created by trigger
            const profileExists = await waitForUserProfile(user.id);
            if (!profileExists) {
                return {
                    success: false,
                    error: 'Seu perfil ainda está sendo criado. Aguarde alguns segundos e tente novamente.'
                };
            }

            console.log('[GROUPS] Checking if group exists...', { code });

            // Verificar se o grupo existe (via RPC para bypass RLS)
            const { data: group, error: groupError } = await supabase
                .rpc('get_group_by_code', { code_input: code })
                .maybeSingle();

            if (groupError) {
                console.error('[GROUPS] Error fetching group:', groupError);
                throw groupError;
            }

            if (!group) {
                console.log('[GROUPS] Group not found');
                return { success: false, error: 'Grupo não encontrado. Verifique o código.' };
            }

            console.log('[GROUPS] Group found:', { groupId: group.id });

            // Verificar se já é membro
            const { data: existingMember } = await supabase
                .from('group_members')
                .select('id, status')
                .eq('group_id', group.id)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingMember) {
                console.log('[GROUPS] User is already a member:', { status: existingMember.status });

                if (existingMember.status === 'pending') {
                    return { success: false, error: 'Você já tem uma solicitação pendente para este grupo.' };
                }
                if (existingMember.status === 'approved') {
                    return { success: false, error: 'Você já é membro deste grupo.' };
                }
                if (existingMember.status === 'rejected') {
                    // Permitir reenviar solicitação
                    console.log('[GROUPS] Re-submitting rejected request');
                    await supabase
                        .from('group_members')
                        .update({ status: 'pending' })
                        .eq('id', existingMember.id);

                    await fetchGroups();
                    return { success: true };
                }
            }

            console.log('[GROUPS] Creating membership request...');

            // Criar solicitação pendente
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id,
                    role: 'member',
                    status: 'pending',
                });

            if (memberError) {
                console.error('[GROUPS] Error creating membership:', memberError);
                throw memberError;
            }

            console.log('[GROUPS] Membership request created successfully');
            await fetchGroups();
            return { success: true };
        } catch (err) {
            console.error('[GROUPS] Error in joinGroup:', err);
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao entrar no grupo' };
        }
    };

    const deleteGroup = async (groupId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('[GROUPS] Deleting group:', { groupId });

            const user = await getUserWithRetry();
            if (!user) {
                return { success: false, error: 'Não autenticado' };
            }

            // Verify user is owner
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .select('owner_id')
                .eq('id', groupId)
                .single();

            if (groupError || !group) {
                console.error('[GROUPS] Error fetching group:', groupError);
                return { success: false, error: 'Grupo não encontrado' };
            }

            if (group.owner_id !== user.id) {
                return { success: false, error: 'Apenas o administrador pode excluir o grupo' };
            }

            // Delete the group (CASCADE will delete members, profiles, game_states)
            const { error: deleteError } = await supabase
                .from('groups')
                .delete()
                .eq('id', groupId);

            if (deleteError) {
                console.error('[GROUPS] Error deleting group:', deleteError);
                throw deleteError;
            }

            console.log('[GROUPS] Group deleted successfully');
            await fetchGroups();
            return { success: true };
        } catch (err) {
            console.error('[GROUPS] Error in deleteGroup:', err);
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir grupo' };
        }
    };

    return {
        groups,
        loading,
        error,
        createGroup,
        joinGroup,
        deleteGroup,
        refetch: fetchGroups,
    };
}
