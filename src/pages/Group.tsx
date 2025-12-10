import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import {
  Gift,
  ArrowLeft,
  Copy,
  Check,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  UserPlus,
  Eye,
  Play,
  Lock,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

// Mock data - will be replaced with Supabase data
const mockGroup = {
  id: "1",
  name: "Família Galvão",
  code: "A9F2KQ",
  isOwner: true,
};

const mockMembers = [
  { id: "1", name: "João Silva", email: "joao@email.com", role: "owner", status: "approved", profileComplete: true, hintsGenerated: true },
  { id: "2", name: "Maria Santos", email: "maria@email.com", role: "member", status: "approved", profileComplete: true, hintsGenerated: true },
  { id: "3", name: "Pedro Costa", email: "pedro@email.com", role: "member", status: "approved", profileComplete: true, hintsGenerated: false },
  { id: "4", name: "Ana Oliveira", email: "ana@email.com", role: "member", status: "approved", profileComplete: false, hintsGenerated: false },
  { id: "5", name: "Lucas Ferreira", email: "lucas@email.com", role: "member", status: "approved", profileComplete: false, hintsGenerated: false },
];

const mockPendingRequests = [
  { id: "6", name: "Carlos Mendes", email: "carlos@email.com" },
  { id: "7", name: "Juliana Lima", email: "juliana@email.com" },
];

const Group = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(mockPendingRequests);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(mockGroup.code);
      setCopiedCode(true);
      toast({
        title: "Código copiado!",
        description: `O código ${mockGroup.code} foi copiado para a área de transferência.`,
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = (requestId: string, name: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({
      title: "Solicitação aprovada! 🎉",
      description: `${name} agora faz parte do grupo.`,
    });
  };

  const handleReject = (requestId: string, name: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({
      title: "Solicitação rejeitada",
      description: `A solicitação de ${name} foi rejeitada.`,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileStatusBadge = (member: typeof mockMembers[0]) => {
    if (member.hintsGenerated) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium badge-hints">
          <Lock className="h-3 w-3" />
          Dicas geradas
        </span>
      );
    }
    if (member.profileComplete) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium badge-complete">
          <CheckCircle className="h-3 w-3" />
          Perfil completo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium badge-incomplete">
        <AlertCircle className="h-3 w-3" />
        Incompleto
      </span>
    );
  };

  // Count stats
  const completedProfiles = mockMembers.filter(m => m.profileComplete).length;
  const hintsGeneratedCount = mockMembers.filter(m => m.hintsGenerated).length;

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-20 lg:pt-8">
        {/* Group Info Card */}
        <Card className="mb-8 animate-fade-in overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="font-display text-2xl font-bold mb-2">
                  {mockGroup.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {mockMembers.length} participantes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {completedProfiles} perfis completos
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    {hintsGeneratedCount} dicas geradas
                  </span>
                  {pendingRequests.length > 0 && mockGroup.isOwner && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="h-4 w-4" />
                      {pendingRequests.length} pendentes
                    </span>
                  )}
                </div>
              </div>

              {/* Group Code */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código do grupo</p>
                  <p className="font-mono font-bold text-2xl tracking-wider text-primary">
                    {mockGroup.code}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="btn-hover-scale"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <Button
            onClick={() => navigate(`/grupo/${id}/criar-perfil`)}
            className="gap-2 btn-hover-scale"
          >
            <UserPlus className="h-4 w-4" />
            Criar meu perfil
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/grupo/${id}/perfis`)}
            className="gap-2 btn-hover-scale"
          >
            <Eye className="h-4 w-4" />
            Ver perfis
          </Button>
          {mockGroup.isOwner && (
            <Button
              onClick={() => navigate(`/grupo/${id}/jogo`)}
              className="gap-2 bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80 btn-hover-scale"
            >
              <Play className="h-4 w-4" />
              Iniciar Modo Jogo
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <TabsList className="mb-6 bg-secondary/50 p-1">
            <TabsTrigger value="members" className="gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              Participantes
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {mockMembers.length}
              </span>
            </TabsTrigger>
            {mockGroup.isOwner && (
              <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-background">
                <Clock className="h-4 w-4" />
                Solicitações
                {pendingRequests.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Participantes Aprovados</CardTitle>
                <CardDescription>
                  Membros que fazem parte do grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors animate-fade-in border border-transparent hover:border-border"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {member.name}
                            {member.role === "owner" && (
                              <Crown className="h-4 w-4 text-[#FFD166]" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getProfileStatusBadge(member)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          {mockGroup.isOwner && (
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Solicitações Pendentes</CardTitle>
                  <CardDescription>
                    Pessoas que desejam entrar no grupo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">
                        Nenhuma solicitação pendente
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        Compartilhe o código do grupo para convidar mais pessoas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((request, index) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-border animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-amber-200">
                              <AvatarFallback className="bg-amber-50 text-amber-700 font-medium">
                                {getInitials(request.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id, request.name)}
                              className="gap-1 bg-green-600 hover:bg-green-700 btn-hover-scale"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 btn-hover-scale"
                              onClick={() => handleReject(request.id, request.name)}
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Group;
