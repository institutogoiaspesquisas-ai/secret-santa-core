import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProfileCard } from '@/components/ProfileCard';
import { useProfiles } from '@/hooks/useProfiles';

export default function ViewProfiles() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { profiles, loading, error } = useProfiles(groupId || '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/grupo/${groupId}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao grupo
        </Button>

        <h1 className="text-2xl font-bold mb-6">Perfis do grupo</h1>

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
    </div>
  );
}
