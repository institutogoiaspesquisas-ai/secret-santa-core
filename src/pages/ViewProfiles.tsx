import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProfileCard } from '@/components/ProfileCard';
import { useProfiles } from '@/hooks/useProfiles';

export default function ViewProfiles() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { profiles, loading, error } = useProfiles(groupId || '');

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 pt-20 lg:pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/grupo/${groupId}`)}
          className="mb-6 gap-2 btn-hover-scale"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao grupo
        </Button>

        <h1 className="font-display text-2xl font-bold mb-6">Perfis do grupo</h1>

        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Ainda não há perfis completos neste grupo.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
