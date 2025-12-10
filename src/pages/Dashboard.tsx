import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Users, LogOut, Copy, Check, Clock } from "lucide-react";
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
    memberCount: 5,
    pendingCount: 2,
  },
  {
    id: "2",
    name: "Amigos do Trabalho",
    code: "B3H7LP",
    role: "member" as const,
    status: "approved" as const,
    memberCount: 8,
    pendingCount: 0,
  },
  {
    id: "3",
    name: "Grupo da Faculdade",
    code: "C5J9MR",
    role: "member" as const,
    status: "pending" as const,
    memberCount: 12,
    pendingCount: 0,
  },
];

const Dashboard = () => {
  const { toast } = useToast();
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
    // TODO: Implement logout with Supabase
    toast({
      title: "Logout",
      description: "Função será implementada com Supabase.",
    });
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, Usuário
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
          <Button onClick={() => setIsCreateModalOpen(true)} className="btn-glow gap-2">
            <Plus className="h-4 w-4" />
            Criar Novo Grupo
          </Button>
          <Button variant="outline" onClick={() => setIsJoinModalOpen(true)} className="gap-2">
            <Users className="h-4 w-4" />
            Entrar com Código
          </Button>
        </div>

        {/* Groups Grid */}
        {mockGroups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">
                Nenhum grupo ainda
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Crie um novo grupo ou entre em um existente usando o código de convite.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setIsCreateModalOpen(true)} className="btn-glow">
                  Criar Grupo
                </Button>
                <Button variant="outline" onClick={() => setIsJoinModalOpen(true)}>
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
                className="hover:border-primary/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="font-display text-lg">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3" />
                        {group.memberCount} membros
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={group.role === "owner" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {group.role === "owner" ? "Dono" : "Membro"}
                      </Badge>
                      {group.status === "pending" && (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Group Code */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Código do grupo</p>
                      <p className="font-mono font-bold text-lg tracking-wider">
                        {group.code}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCode(group.code)}
                      className="shrink-0"
                    >
                      {copiedCode === group.code ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Pending requests indicator */}
                  {group.role === "owner" && group.pendingCount > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/20 text-sm">
                      <Clock className="h-4 w-4 text-accent-foreground" />
                      <span>{group.pendingCount} solicitações pendentes</span>
                    </div>
                  )}

                  {/* Action Button */}
                  {group.status === "approved" ? (
                    <Link to={`/grupo/${group.id}`}>
                      <Button variant="outline" className="w-full">
                        {group.role === "owner" ? "Gerenciar Grupo" : "Ver Grupo"}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
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
