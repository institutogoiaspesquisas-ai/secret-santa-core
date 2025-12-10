import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gift, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup" || urlMode === "login") {
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    try {
      if (mode === "login") {
        loginSchema.parse(formData);
      } else {
        signupSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // TODO: Integrate with Supabase authentication
    // This is a placeholder for when Supabase is connected
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Supabase não conectado",
        description: "Conecte seu projeto Supabase nas configurações para habilitar a autenticação.",
        variant: "destructive",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Gift className="h-8 w-8 text-primary" />
          <span className="font-display font-bold text-2xl">Quem Sou Eu IA</span>
        </Link>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {mode === "login" ? "Bem-vindo de volta!" : "Criar sua conta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Entre com suas credenciais para continuar"
                : "Preencha os dados abaixo para começar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-glow" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "login" ? (
                <p className="text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Criar conta
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
