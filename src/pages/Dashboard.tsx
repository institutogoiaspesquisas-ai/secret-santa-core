import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Gift,
  Plus,
  Users,
  LogOut,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";

// Mock data - will be replaced with Supabase data
const mockGroups = [
  {
    id: "1",
    name: "Família Galvão",
    code: "A9F2KQ",
    role: "owner" as const,
    status: "approved" as const,
    profileStatus: "complete" as const,
    hintsGenerated: true,
    memberCount: 5,
    pendingCount: 2,
  },
  {
    id: "2",
    name: "Amigos do Trabalho",
    code: "B3H7LP",
    role: "member" as const,
    status: "approved" as const,
    profileStatus: "incomplete" as const,
    hintsGenerated: false,
    memberCount: 8,
    pendingCount: 0,
  },
  {
    id: "3",
    name: "Grupo da Faculdade",
    code: "C5J9MR",
    role: "member" as const,
    status: "pending" as const,
    profileStatus: "none" as const,
    hintsGenerated: false,
    memberCount: 12,
    pendingCount: 0,
  },
];

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Função será implementada com Supabase.",
    });
  };

  const getStatusBadge = (group: typeof mockGroups[0]) => {
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
          <Lock className="h-3 w-3" />
          Dicas geradas
        </span>
      );
    }

    if (group.profileStatus === "complete") {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">Quem Sou Eu IA</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">U</span>
              </div>
              <span className="text-sm font-medium">Olá, Usuário</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="btn-hover-scale">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Meus Grupos</h1>
          <p className="text-muted-foreground">
            Gerencie seus grupos de Amigo Oculto
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-glow btn-hover-scale gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Novo Grupo
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
        {mockGroups.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Nenhum grupo ainda
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Crie um novo grupo ou entre em um existente usando o código de convite.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setIsCreateModalOpen(true)} className="btn-glow btn-hover-scale">
                  Criar Grupo
                </Button>
                <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="btn-hover-scale">
                  Entrar com Código
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockGroups.map((group, index) => (
              <Card
                key={group.id}
                className="group relative overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 card-hover-shadow animate-fade-in"
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
                    {group.role === "owner" ? "Dono" : "Membro"}
                  </span>
                </div>

                <CardHeader className="pb-3 pt-8">
                  <CardTitle className="font-display text-xl">{group.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount} membros
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
                      <p className="text-xs text-muted-foreground mb-0.5">Código do grupo</p>
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
                      <span>{group.role === "owner" ? "Gerenciar Grupo" : "Ver Grupo"}</span>
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
      </main>

      {/* Modals */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
      <JoinGroupModal
        open={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
      />
    </div>
  );
};

export default Dashboard;
