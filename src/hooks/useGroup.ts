import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GroupMember } from './useGroups';

export interface GroupDetails {
    id: string;
    name: string;
    code: string;
    owner_id: string;
    isOwner: boolean;
    created_at: string;
}

export interface MemberWithProfile {
    id: string;
    user_id: string;
    role: 'owner' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    name: string;
    email: string;
    profileComplete: boolean;
    hintsGenerated: boolean;
}

export function useGroup(groupId: string) {
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<MemberWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroup = useCallback(async () => {
        if (!groupId) return;

        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');

            // Buscar dados do grupo
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', groupId)
                .single();

            if (groupError) throw groupError;
            if (!groupData) throw new Error('Grupo não encontrado');

            setGroup({
                ...groupData,
                isOwner: groupData.owner_id === user.id,
            });

            // Buscar membros do grupo com perfis de usuário
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          user_profiles (
            id,
            full_name,
            email
          )
        `)
                .eq('group_id', groupId);

            if (membersError) throw membersError;

            // Buscar perfis de cada membro
            const membersWithProfiles = await Promise.all(
                (membersData || []).map(async (member) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_complete, hints_generated')
                        .eq('group_id', groupId)
                        .eq('user_id', member.user_id)
                        .maybeSingle();

                    const userProfile = member.user_profiles as { full_name: string | null; email: string | null } | null;

                    return {
                        id: member.id,
                        user_id: member.user_id,
                        role: member.role as 'owner' | 'member',
                        status: member.status as 'pending' | 'approved' | 'rejected',
                        created_at: member.created_at,
                        name: userProfile?.full_name || 'Usuário',
                        email: userProfile?.email || '',
                        profileComplete: profile?.is_complete || false,
                        hintsGenerated: profile?.hints_generated || false,
                    };
                })
            );

            // Separar membros aprovados e pendentes
            setMembers(membersWithProfiles.filter(m => m.status === 'approved'));
            setPendingRequests(membersWithProfiles.filter(m => m.status === 'pending'));

        } catch (err) {
            console.error('Error fetching group:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar grupo');
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroup();
    }, [fetchGroup]);

    const approveMember = async (memberId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('group_members')
                .update({ status: 'approved' })
                .eq('id', memberId);

            if (error) throw error;
            await fetchGroup();
            return true;
        } catch (err) {
            console.error('Error approving member:', err);
            return false;
        }
    };

    const rejectMember = async (memberId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('group_members')
                .update({ status: 'rejected' })
                .eq('id', memberId);

            if (error) throw error;
            await fetchGroup();
            return true;
        } catch (err) {
            console.error('Error rejecting member:', err);
            return false;
        }
    };

    const removeMember = async (memberId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;
            await fetchGroup();
            return true;
        } catch (err) {
            console.error('Error removing member:', err);
            return false;
        }
    };

    return {
        group,
        members,
        pendingRequests,
        loading,
        error,
        approveMember,
        rejectMember,
        removeMember,
        refetch: fetchGroup,
    };
}
