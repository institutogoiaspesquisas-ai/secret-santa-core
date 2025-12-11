import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppLayout } from "@/components/layout";
import { useGroup, type MemberWithProfile } from "@/hooks/useGroup";
import { useToast } from "@/hooks/use-toast";
import {
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
  Loader2,
} from "lucide-react";

const Group = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);

  const {
    group,
    members,
    pendingRequests,
    loading,
    error,
    approveMember,
    rejectMember,
    refetch
  } = useGroup(id || '');

  const handleCopyCode = async () => {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.code);
      setCopiedCode(true);
      toast({
        title: "Código copiado!",
        description: `O código ${group.code} foi copiado para a área de transferência.`,
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

  const handleApprove = async (member: MemberWithProfile) => {
    const success = await approveMember(member.id);
    if (success) {
      toast({
        title: "Solicitação aprovada! 🎉",
        description: `${member.name} agora faz parte do grupo.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a solicitação.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (member: MemberWithProfile) => {
    const success = await rejectMember(member.id);
    if (success) {
      toast({
        title: "Solicitação rejeitada",
        description: `A solicitação de ${member.name} foi rejeitada.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileStatusBadge = (member: MemberWithProfile) => {
    if (member.hintsGenerated) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-hints">
          <Lock className="h-3 w-3" />
          Dicas geradas
        </span>
      );
    }
    if (member.profileComplete) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-complete">
          <CheckCircle className="h-3 w-3" />
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

  // Contagens
  const completeCount = members.filter((m) => m.profileComplete).length;
  const hintsGeneratedCount = members.filter((m) => m.hintsGenerated).length;

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !group) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 pt-20 lg:pt-8 text-center">
          <p className="text-destructive mb-4">{error || 'Grupo não encontrado'}</p>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

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
                  {group.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {members.length} participantes
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {completeCount} perfis completos
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    {hintsGeneratedCount} dicas geradas
                  </span>
                  {pendingRequests.length > 0 && group.isOwner && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="h-4 w-4" />
                      {pendingRequests.length} solicitações
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código do grupo</p>
                  <p className="font-mono font-bold text-2xl tracking-wider">
                    {group.code}
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
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => navigate(`/grupo/${id}/criar-perfil`)}
            className="btn-glow btn-hover-scale gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Criar meu perfil
          </Button>

          {group.isOwner && (
            <Button
              variant="outline"
              onClick={() => navigate(`/grupo/${id}/jogo`)}
              className="btn-hover-scale gap-2"
            >
              <Play className="h-4 w-4" />
              Iniciar Modo Jogo
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="animate-fade-in">
          <TabsList className="mb-6">
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Participantes
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary text-xs">
                {members.length}
              </span>
            </TabsTrigger>
            {group.isOwner && (
              <TabsTrigger value="requests" className="gap-2">
                <Clock className="h-4 w-4" />
                Solicitações
                {pendingRequests.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">
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
                <CardTitle className="font-display">Membros do Grupo</CardTitle>
                <CardDescription>
                  {members.length} participantes ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            {member.role === "owner" && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
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

          {/* Requests Tab */}
          {group.isOwner && (
            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Solicitações Pendentes</CardTitle>
                  <CardDescription>
                    {pendingRequests.length} pessoas aguardando aprovação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Nenhuma solicitação pendente
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background shadow">
                              <AvatarFallback className="bg-amber-500/10 text-amber-600 font-medium">
                                {getInitials(request.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{request.name}</span>
                              <p className="text-sm text-muted-foreground">{request.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(request)}
                              className="text-destructive hover:text-destructive btn-hover-scale"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request)}
                              className="btn-hover-scale"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
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
