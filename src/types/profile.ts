import type { ProfileAnswers } from '@/constants/profileQuestions';

export interface Profile {
  id: string;
  user_id: string;
  group_id: string;
  answers: ProfileAnswers;
  audio_url: string | null;
  transcript: string | null;
  is_complete: boolean;
  hints_generated: boolean;
  validation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ProfileWithUser extends Profile {
  user_profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
