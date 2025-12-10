import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "lucide-react";

// Mock data - will be replaced with Supabase data
const mockGroup = {
  id: "1",
  name: "Família Galvão",
  code: "A9F2KQ",
  isOwner: true,
};

const mockMembers = [
  { id: "1", name: "João Silva", email: "joao@email.com", role: "owner", status: "approved" },
  { id: "2", name: "Maria Santos", email: "maria@email.com", role: "member", status: "approved" },
  { id: "3", name: "Pedro Costa", email: "pedro@email.com", role: "member", status: "approved" },
  { id: "4", name: "Ana Oliveira", email: "ana@email.com", role: "member", status: "approved" },
  { id: "5", name: "Lucas Ferreira", email: "lucas@email.com", role: "member", status: "approved" },
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
    // TODO: Implement with Supabase
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({
      title: "Solicitação aprovada! 🎉",
      description: `${name} agora faz parte do grupo.`,
    });
  };

  const handleReject = (requestId: string, name: string) => {
    // TODO: Implement with Supabase
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">{mockGroup.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Group Info Card */}
        <Card className="mb-8 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold mb-1">
                  {mockGroup.name}
                </h1>
                <p className="text-muted-foreground">
                  {mockMembers.length} participantes
                  {pendingRequests.length > 0 && mockGroup.isOwner && (
                    <span className="text-accent-foreground">
                      {" "}
                      • {pendingRequests.length} pendentes
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Código do grupo</p>
                  <p className="font-mono font-bold text-xl tracking-wider">
                    {mockGroup.code}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
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

        {/* Profile Actions */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <Button onClick={() => navigate(`/grupo/${id}/criar-perfil`)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Criar meu perfil
          </Button>
          <Button variant="outline" onClick={() => navigate(`/grupo/${id}/perfis`)} className="gap-2">
            <Eye className="h-4 w-4" />
            Ver perfis
          </Button>
          {mockGroup.isOwner && (
            <Button
              onClick={() => navigate(`/grupo/${id}/jogo`)}
              className="gap-2 bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/80"
            >
              <Play className="h-4 w-4" />
              Iniciar Modo Jogo
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <TabsList className="mb-6">
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Participantes
              <Badge variant="secondary" className="ml-1">
                {mockMembers.length}
              </Badge>
            </TabsTrigger>
            {mockGroup.isOwner && (
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Solicitações
                {pendingRequests.length > 0 && (
                  <Badge className="ml-1 bg-accent text-accent-foreground">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participantes Aprovados</CardTitle>
                <CardDescription>
                  Membros que fazem parte do grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors animate-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {member.name}
                            {member.role === "owner" && (
                              <Crown className="h-4 w-4 text-accent" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                        {member.role === "owner" ? "Dono" : "Membro"}
                      </Badge>
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
                  <CardTitle className="text-lg">Solicitações Pendentes</CardTitle>
                  <CardDescription>
                    Pessoas que desejam entrar no grupo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhuma solicitação pendente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((request, index) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border animate-slide-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-accent/20 text-accent-foreground font-medium">
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
                              variant="outline"
                              className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(request.id, request.name)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
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
      </main>
    </div>
  );
};

export default Group;
