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
    fetchProfiles();
  }, [groupId]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all complete profiles in the group
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('is_complete', true);

      if (profilesError) throw profilesError;

      // Fetch my profile (even if incomplete)
      const { data: myProfileData, error: myProfileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (myProfileError) throw myProfileError;

      setProfiles(profilesData || []);
      setMyProfile(myProfileData);
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
