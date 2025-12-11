import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, FileSearch, Fingerprint, Lightbulb, ShieldCheck, Target, Zap, ArrowRight, Eye } from "lucide-react";
import Mascot from "@/components/Mascot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">Amigo Oculto Detetive</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="sm" className="btn-hover-scale">
                Entrar
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="btn-glow btn-hover-scale">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="relative overflow-hidden detective-gradient py-20 lg:py-28">
          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
            {/* Fingerprint pattern overlay */}
            <div className="absolute inset-0 opacity-5 fingerprint-pattern" />
          </div>

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent mb-6 clue-glow">
                <Search className="h-4 w-4 icon-pulse" />
                <span className="text-sm font-medium">Investigue e Descubra</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white">
                Amigo Oculto Detetive
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 font-light">
                Descubra quem é seu amigo secreto através de pistas geradas por IA
              </p>

              {/* Mascot */}
              <div className="relative mx-auto mb-8 w-fit">
                <Mascot size="lg" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 btn-hover-scale gap-2 text-base px-8 h-12 clue-glow">
                    <Search className="h-5 w-5" />
                    Iniciar Investigação
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              Como Funciona a Investigação
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Três passos simples para transformar seu Amigo Oculto em uma experiência de detetive
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: UserPlus,
                  step: "1",
                  title: "Recrute seus detetives",
                  description: "Crie seu grupo em segundos e envie o código secreto para convidar seus investigadores.",
                },
                {
                  icon: FileSearch,
                  step: "2",
                  title: "Preencha seu perfil secreto",
                  description: "Responda perguntas misteriosas por texto ou grave um áudio se apresentando.",
                },
                {
                  icon: Fingerprint,
                  step: "3",
                  title: "A IA gera as pistas",
                  description: "Nossa IA analisa cada perfil e gera 3 pistas enigmáticas para a investigação.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border card-hover-shadow animate-fade-in evidence-card"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-accent flex items-center justify-center font-display font-bold text-accent-foreground text-sm">
                    {feature.step}
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 mt-2">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Different Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              Por que é diferente?
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Não é só um sorteio. É uma experiência completa de investigação.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Lightbulb,
                  title: "Pistas da IA",
                  description: "Pistas enigmáticas e personalizadas criadas exclusivamente para cada pessoa.",
                },
                {
                  icon: ShieldCheck,
                  title: "Sigilo Total",
                  description: "Ninguém vê as pistas até o momento da investigação. Segredo garantido!",
                },
                {
                  icon: Target,
                  title: "Modo Investigação",
                  description: "Interface especial com revelações, confete e frases da IA para animar.",
                },
                {
                  icon: Zap,
                  title: "Simples e Rápido",
                  description: "Em minutos você cria o grupo e todos podem participar pelo celular.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border card-hover-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-display font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Eye className="h-8 w-8 text-primary animate-float" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto para investigar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Crie seu grupo agora e transforme o Amigo Oculto da sua família ou amigos em uma investigação inesquecível.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-glow btn-hover-scale gap-2 text-base px-10 h-12">
                <Search className="h-5 w-5" />
                Iniciar Investigação
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <span className="font-display font-bold">Amigo Oculto Detetive</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Criado para transformar seu amigo oculto em uma investigação memorável.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              © {new Date().getFullYear()} Amigo Oculto Detetive. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
