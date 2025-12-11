import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout";
import { useGroups, type GroupWithDetails } from "@/hooks/useGroups";
import {
  FolderSearch,
  Plus,
  Users,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronRight,
  Loader2,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";
import Mascot from "@/components/Mascot";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { groups, loading, error, refetch } = useGroups();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Código copiado!",
        description: `O código ${code} foi copiado para a área de transferência.`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (group: GroupWithDetails) => {
    if (group.status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-pending">
          <Clock className="h-3 w-3" />
          Aguardando aprovação
        </span>
      );
    }

    if (group.hintsGenerated) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-hints">
          <Eye className="h-3 w-3" />
          Pistas geradas
        </span>
      );
    }

    if (group.profileComplete) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-complete">
          <CheckCircle2 className="h-3 w-3" />
          Perfil completo
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-incomplete">
        <AlertCircle className="h-3 w-3" />
        Perfil incompleto
      </span>
    );
  };

  const handleCreateModalClose = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) {
      refetch();
    }
  };

  const handleJoinModalClose = (open: boolean) => {
    setIsJoinModalOpen(open);
    if (!open) {
      refetch();
    }
  };

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
        <div className="container mx-auto px-4 py-8 pt-20 lg:pt-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch}>Tentar novamente</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-20 lg:pt-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl font-bold">Minhas Investigações</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie seus grupos de Amigo Oculto Detetive
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-glow btn-hover-scale gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Nova Investigação
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsJoinModalOpen(true)}
            className="btn-hover-scale gap-2"
          >
            <Users className="h-4 w-4" />
            Entrar com Código
          </Button>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <Card className="border-dashed border-2 evidence-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {/* Mascot */}
              <div className="mb-4">
                <Mascot size="md" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Nenhuma investigação ainda
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Crie um novo grupo ou entre em uma investigação existente usando o código secreto.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setIsCreateModalOpen(true)} className="btn-glow btn-hover-scale gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Investigação
                </Button>
                <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="btn-hover-scale">
                  Entrar com Código
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group, index) => (
              <Card
                key={group.id}
                className="group relative overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 card-hover-shadow animate-fade-in evidence-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Role indicator */}
                <div className="absolute top-0 right-0">
                  <span className={`
                    inline-block px-3 py-1 text-xs font-medium rounded-bl-lg
                    ${group.role === "owner"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                    }
                  `}>
                    {group.role === "owner" ? "Chefe" : "Detetive"}
                  </span>
                </div>

                <CardHeader className="pb-3 pt-8">
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <FolderSearch className="h-5 w-5 text-primary" />
                    {group.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount} detetives
                    {group.role === "owner" && group.pendingCount > 0 && (
                      <span className="text-amber-600">
                        • {group.pendingCount} pendentes
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Badge */}
                  <div>
                    {getStatusBadge(group)}
                  </div>

                  {/* Group Code */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Código secreto</p>
                      <p className="font-mono font-bold text-lg tracking-wider">
                        {group.code}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(group.code)}
                      className="shrink-0 btn-hover-scale"
                    >
                      {copiedCode === group.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Action Button */}
                  {group.status === "approved" ? (
                    <Button
                      onClick={() => navigate(`/grupo/${group.id}`)}
                      className="w-full btn-hover-scale gap-2 justify-between"
                      variant="outline"
                    >
                      <span>{group.role === "owner" ? "Gerenciar Investigação" : "Ver Investigação"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Aguardando aprovação
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={handleCreateModalClose}
      />
      <JoinGroupModal
        open={isJoinModalOpen}
        onOpenChange={handleJoinModalClose}
      />
    </AppLayout>
  );
};

export default Dashboard;
