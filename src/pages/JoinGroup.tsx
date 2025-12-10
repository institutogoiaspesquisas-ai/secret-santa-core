import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gift, Users, Loader2, ArrowLeft } from "lucide-react";
import { isValidGroupCode } from "@/lib/generateCode";

const JoinGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidGroupCode(code)) {
      setError("Código inválido. O código deve ter 6 caracteres.");
      return;
    }

    setIsLoading(true);

    // TODO: Implement with Supabase - check if group exists and create pending request
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Solicitação enviada! ✉️",
        description: "Sua solicitação foi enviada ao administrador do grupo. Aguarde aprovação.",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Gift className="h-8 w-8 text-primary" />
          <span className="font-display font-bold text-2xl">Quem Sou Eu IA</span>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">
              Entrar em um Grupo
            </CardTitle>
            <CardDescription>
              Insira o código de 6 caracteres fornecido pelo administrador do grupo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Grupo</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: A9F2KQ"
                  value={code}
                  onChange={handleCodeChange}
                  className={`text-center font-mono text-2xl tracking-[0.5em] uppercase ${
                    error ? "border-destructive" : ""
                  }`}
                  maxLength={6}
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  O código não diferencia maiúsculas de minúsculas
                </p>
              </div>

              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Solicitar Entrada
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/auth?mode=signup" className="text-primary hover:underline font-medium">
                  Criar conta primeiro
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinGroup;
