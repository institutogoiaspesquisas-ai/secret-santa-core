import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfileQuestions } from '@/components/ProfileQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/layout';
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
  const [saving, setSaving] = useState(false);
  const [hintsGenerating, setHintsGenerating] = useState(false);
  const [hintsComplete, setHintsComplete] = useState(false);

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
    }
  }, [myProfile]);

  // Submit form and save profile directly
  const handleQuestionsSubmit = async (newAnswers: ProfileAnswers) => {
    if (!user || !groupId) return;

    setAnswers(newAnswers);
    setSaving(true);
    setHintsGenerating(true);

    const result = await createOrUpdateProfile(user.id, newAnswers);

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
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 pt-20 lg:pt-8">
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
              Quanto mais sincero e criativo você for, mais divertidas serão as dicas que a IA criará sobre você.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileQuestions
              initialAnswers={answers || undefined}
              onSubmit={handleQuestionsSubmit}
              submitLabel={saving ? 'Salvando...' : 'Salvar perfil e gerar dicas'}
              submitDisabled={saving}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

