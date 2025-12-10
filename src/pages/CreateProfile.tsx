import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileQuestions } from '@/components/ProfileQuestions';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Sparkles, Lock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';
import { PROFILE_QUESTIONS } from '@/constants/profileQuestions';
import type { ProfileAnswers } from '@/constants/profileQuestions';

export default function CreateProfile() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [answers, setAnswers] = useState<ProfileAnswers | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hintsGenerating, setHintsGenerating] = useState(false);
  const [hintsComplete, setHintsComplete] = useState(false);
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
    setHintsGenerating(true);
    
    const result = await createOrUpdateProfile(user.id, answers, audioUrl || undefined, transcript || undefined);
    
    setSaving(false);
    
    if (result.success) {
      // Mostrar animação de conclusão das dicas
      setHintsComplete(true);
      
      toast({
        title: 'Perfil salvo com sucesso! 🎉',
        description: 'Suas dicas misteriosas foram geradas e guardadas em sigilo.',
      });
      
      // Aguardar um pouco para o usuário ver o feedback
      setTimeout(() => {
        navigate(`/grupo/${groupId}`);
      }, 2500);
    } else {
      setHintsGenerating(false);
      toast({
        title: 'Erro',
        description: result.error || 'Não foi possível salvar o perfil.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Tela de feedback após salvar
  if (hintsGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            {!hintsComplete ? (
              <>
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#FFD166]/20 animate-ping" />
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#FFD166]/30">
                    <Sparkles className="h-10 w-10 text-[#FFD166] animate-pulse" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Gerando dicas misteriosas...</h2>
                <p className="text-muted-foreground">
                  A IA está analisando seu perfil e criando suas 3 dicas secretas.
                </p>
              </>
            ) : (
              <>
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#FFD166]">
                    <Lock className="h-10 w-10 text-[#1E1E1E]" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h2 className="text-xl font-semibold">Perfil concluído!</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  A IA analisou seu perfil e guardou suas três dicas em segredo.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  🤖✨ Espere o momento da revelação para descobrir o que ela escreveu sobre você!
                </p>
              </>
            )}
          </CardContent>
        </Card>
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
          Voltar ao grupo
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {myProfile ? 'Editar meu perfil' : 'Criar meu perfil'}
            </CardTitle>
            <CardDescription>
              {step === 'questions' && 'Responda as perguntas para que os outros te conheçam melhor'}
              {step === 'audio' && 'Grave uma mensagem de voz se apresentando (opcional)'}
              {step === 'review' && 'Revise seu perfil antes de salvar'}
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
                    <p className="text-sm font-medium mb-2">Transcrição:</p>
                    <p className="text-sm">{transcript}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('questions')}>
                    Voltar
                  </Button>
                  <Button onClick={() => setStep('review')} className="flex-1">
                    {audioUrl ? 'Continuar' : 'Pular áudio'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {answers && PROFILE_QUESTIONS.map((q) => {
                    const answer = answers[q.id as keyof ProfileAnswers];
                    if (!answer) return null;
                    return (
                      <div key={q.id}>
                        <p className="text-sm font-medium text-muted-foreground">{q.question}</p>
                        <p>{answer}</p>
                      </div>
                    );
                  })}
                </div>

                {transcript && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Áudio transcrito:</p>
                    <p className="text-sm italic">{transcript}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg border border-[#FFD166]/50 bg-[#FFD166]/10">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-[#FFD166]" />
                    <span>Ao salvar, a IA gerará 3 dicas misteriosas sobre você!</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('audio')}>
                    Voltar
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar perfil'
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
