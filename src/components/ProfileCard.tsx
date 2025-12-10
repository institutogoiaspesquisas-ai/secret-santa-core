import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';
import { PROFILE_QUESTIONS } from '@/constants/profileQuestions';
import type { ProfileWithUser } from '@/types/profile';

interface ProfileCardProps {
  profile: ProfileWithUser;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const userName = profile.user_profiles?.full_name || 'Usuario';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const toggleAudio = () => {
    if (!profile.audio_url) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(profile.audio_url);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile.user_profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{userName}</h3>
            {profile.audio_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                className="gap-2 -ml-3 text-primary"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pausar' : 'Escuchar presentación'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROFILE_QUESTIONS.map((q) => {
          const answer = (profile.answers as Record<string, string>)?.[q.id];
          if (!answer) return null;
          
          return (
            <div key={q.id}>
              <p className="text-sm font-medium text-muted-foreground">{q.question}</p>
              <p className="mt-1">{answer}</p>
            </div>
          );
        })}
        
        {profile.transcript && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Transcripción del audio</p>
            <p className="mt-1 text-sm italic">{profile.transcript}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
