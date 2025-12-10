import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Gift, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">Quem Sou Eu IA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="btn-glow">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-8">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Amigo Oculto Inteligente</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Quem Sou Eu IA
                <span className="block text-gradient mt-2">
                  O Amigo Oculto mais inteligente do mundo
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Crie grupos, convide amigos e deixe a IA cuidar do mistério. 
                Uma experiência única de Amigo Oculto com identidade secreta.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="btn-glow gap-2 text-base px-8">
                    Criar Conta
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/entrar-grupo">
                  <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                    <Users className="h-4 w-4" />
                    Entrar com Código de Grupo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
              Como Funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Users,
                  title: "Crie seu Grupo",
                  description: "Crie um grupo e receba um código único para compartilhar com amigos.",
                },
                {
                  icon: Gift,
                  title: "Convide Amigos",
                  description: "Compartilhe o código e aguarde as solicitações de entrada.",
                },
                {
                  icon: Sparkles,
                  title: "Deixe a IA Trabalhar",
                  description: "A inteligência artificial cuida do sorteio e da diversão.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Quem Sou Eu IA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
