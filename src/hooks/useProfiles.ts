import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ProfileWithUser } from '@/types/profile';
import type { ProfileAnswers } from '@/constants/profileQuestions';

export function useProfiles(groupId: string) {
  const [profiles, setProfiles] = useState<ProfileWithUser[]>([]);
  const [myProfile, setMyProfile] = useState<ProfileWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) fetchProfiles();
  }, [groupId]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all complete profiles in the group
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_complete', true);

      if (profilesError) throw profilesError;

      // Fetch my profile (even if incomplete)
      const { data: myProfileData, error: myProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (myProfileError) throw myProfileError;

      // Fetch user profiles for all profile user_ids
      const userIds = [...new Set([
        ...(profilesData?.map(p => p.user_id) || []),
        ...(myProfileData ? [myProfileData.user_id] : [])
      ])];

      const { data: userProfilesData } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const userProfilesMap = new Map(
        userProfilesData?.map(up => [up.id, up]) || []
      );

      // Merge profiles with user data
      const enrichedProfiles: ProfileWithUser[] = (profilesData || []).map(p => ({
        ...p,
        answers: p.answers as ProfileAnswers,
        validation_status: p.validation_status as 'pending' | 'approved' | 'rejected',
        user_profiles: userProfilesMap.get(p.user_id) || undefined
      }));

      const enrichedMyProfile: ProfileWithUser | null = myProfileData ? {
        ...myProfileData,
        answers: myProfileData.answers as ProfileAnswers,
        validation_status: myProfileData.validation_status as 'pending' | 'approved' | 'rejected',
        user_profiles: userProfilesMap.get(myProfileData.user_id) || undefined
      } : null;

      setProfiles(enrichedProfiles);
      setMyProfile(enrichedMyProfile);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Error loading profiles');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateProfile = async (
    userId: string,
    answers: ProfileAnswers,
    audioUrl?: string,
    transcript?: string
  ) => {
    try {
      const profileData = {
        user_id: userId,
        group_id: groupId,
        answers,
        audio_url: audioUrl || null,
        transcript: transcript || null,
        is_complete: true,
      };

      if (myProfile) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', myProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);
        if (error) throw error;
      }

      await fetchProfiles();
      return { success: true };
    } catch (err) {
      console.error('Error saving profile:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error saving profile' };
    }
  };

  return {
    profiles,
    myProfile,
    loading,
    error,
    createOrUpdateProfile,
    refetch: fetchProfiles,
  };
}
