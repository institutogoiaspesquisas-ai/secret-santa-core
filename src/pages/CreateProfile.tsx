import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileQuestions } from '@/components/ProfileQuestions';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Sparkles, Lock, CheckCircle, Mic, FileText, ChevronRight } from 'lucide-react';
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
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');

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
      setHintsComplete(true);

      toast({
        title: 'Perfil salvo com sucesso! 🎉',
        description: 'Suas dicas misteriosas foram geradas e guardadas em sigilo.',
      });

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

  // Calculate progress
  const answeredQuestions = answers
    ? Object.values(answers).filter(a => a && a.trim() !== '').length
    : 0;
  const progress = (answeredQuestions / PROFILE_QUESTIONS.length) * 100;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Hints generation screen
  if (hintsGenerating) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-[#1E1E1E] border-[#FFD166]/30">
          <CardContent className="pt-10 pb-10">
            {!hintsComplete ? (
              <>
                <div className="relative mx-auto w-24 h-24 mb-8">
                  <div className="absolute inset-0 rounded-full bg-[#FFD166]/20 animate-ping" />
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#FFD166]/30">
                    <Sparkles className="h-12 w-12 text-[#FFD166] icon-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">
                  Gerando dicas misteriosas...
                </h2>
                <p className="text-white/60">
                  A IA está analisando seu perfil e criando suas 3 dicas secretas.
                </p>
              </>
            ) : (
              <>
                <div className="relative mx-auto w-24 h-24 mb-8">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#FFD166]">
                    <Lock className="h-12 w-12 text-[#1E1E1E]" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h2 className="text-2xl font-display font-bold text-white">Perfil concluído!</h2>
                </div>
                <p className="text-white/60 mb-6">
                  A IA analisou seu perfil e guardou suas três dicas em segredo.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/80 italic">
                    🤖✨ Espere o momento da revelação para descobrir o que ela escreveu sobre você!
                  </p>
                </div>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/grupo/${groupId}`)}
            className="gap-2 btn-hover-scale"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao grupo
          </Button>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
            <Button
              variant={inputMode === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInputMode('text')}
              className="gap-1.5 btn-hover-scale"
            >
              <FileText className="h-4 w-4" />
              Texto
            </Button>
            <Button
              variant={inputMode === 'audio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInputMode('audio')}
              className="gap-1.5 btn-hover-scale"
            >
              <Mic className="h-4 w-4" />
              Áudio
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do perfil</span>
              <span className="text-sm text-muted-foreground">
                {answeredQuestions} de {PROFILE_QUESTIONS.length} perguntas
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {progress === 100 && (
              <div className="flex items-center gap-1.5 mt-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Perfil completo 🎉</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Card */}
        <Card className="card-hover-shadow">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FFD166]" />
              {myProfile ? 'Editar meu perfil' : 'Monte seu perfil secreto'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'questions' && 'Quanto mais sincero e criativo você for, mais divertidas serão as dicas que a IA criará sobre você.'}
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
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Transcrição:
                    </p>
                    <p className="text-sm text-muted-foreground italic">{transcript}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('questions')}
                    className="btn-hover-scale"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep('review')}
                    className="flex-1 btn-hover-scale gap-2"
                  >
                    {audioUrl ? 'Continuar' : 'Pular áudio'}
                    <ChevronRight className="h-4 w-4" />
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
                      <div key={q.id} className="p-4 rounded-xl bg-secondary/50">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{q.question}</p>
                        <p className="font-medium">{answer}</p>
                      </div>
                    );
                  })}
                </div>

                {transcript && (
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Mic className="h-4 w-4 text-primary" />
                      Áudio transcrito:
                    </p>
                    <p className="text-sm italic text-muted-foreground">{transcript}</p>
                  </div>
                )}

                <div className="p-4 rounded-xl border-2 border-[#FFD166]/30 bg-[#FFD166]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#FFD166]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Pronto para gerar as dicas!</p>
                      <p className="text-sm text-muted-foreground">
                        Ao salvar, a IA gerará 3 dicas misteriosas sobre você.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('audio')}
                    className="btn-hover-scale"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 btn-glow btn-hover-scale gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Salvar perfil e gerar dicas
                      </>
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
