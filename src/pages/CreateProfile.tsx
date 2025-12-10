import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileQuestions } from '@/components/ProfileQuestions';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';
import type { ProfileAnswers } from '@/constants/profileQuestions';

export default function CreateProfile() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [answers, setAnswers] = useState<ProfileAnswers | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'questions' | 'audio' | 'review'>('questions');

  const { myProfile, createOrUpdateProfile, loading } = useProfiles(groupId || '');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    if (myProfile) {
      setAnswers(myProfile.answers as ProfileAnswers);
      setAudioUrl(myProfile.audio_url);
      setTranscript(myProfile.transcript);
    }
  }, [myProfile]);

  const handleQuestionsSubmit = (newAnswers: ProfileAnswers) => {
    setAnswers(newAnswers);
    setStep('audio');
  };

  const handleSaveProfile = async () => {
    if (!answers || !user || !groupId) return;

    setSaving(true);
    const result = await createOrUpdateProfile(user.id, answers, audioUrl || undefined, transcript || undefined);
    
    if (result.success) {
      toast({
        title: 'Perfil guardado',
        description: 'Tu perfil ha sido guardado exitosamente.',
      });
      navigate(`/grupo/${groupId}`);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'No se pudo guardar el perfil.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/grupo/${groupId}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al grupo
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {myProfile ? 'Editar mi perfil' : 'Crear mi perfil'}
            </CardTitle>
            <CardDescription>
              {step === 'questions' && 'Responde las preguntas para que los demás te conozcan'}
              {step === 'audio' && 'Graba un mensaje de voz presentándote (opcional)'}
              {step === 'review' && 'Revisa tu perfil antes de guardarlo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'questions' && (
              <ProfileQuestions
                initialAnswers={answers || undefined}
                onSubmit={handleQuestionsSubmit}
              />
            )}

            {step === 'audio' && (
              <div className="space-y-6">
                <AudioRecorder
                  onTranscript={setTranscript}
                  onAudioUrl={setAudioUrl}
                  groupId={groupId || ''}
                  userId={user.id}
                />
                
                {transcript && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Transcripción:</p>
                    <p className="text-sm">{transcript}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('questions')}>
                    Volver
                  </Button>
                  <Button onClick={() => setStep('review')} className="flex-1">
                    {audioUrl ? 'Continuar' : 'Omitir audio'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {answers && Object.entries(answers).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm font-medium text-muted-foreground">{key}</p>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>

                {transcript && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Audio transcrito:</p>
                    <p className="text-sm italic">{transcript}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('audio')}>
                    Volver
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar perfil'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
