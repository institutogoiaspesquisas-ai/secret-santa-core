import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Gift, ArrowRight, MessageCircle, Lock, Gamepad2, Zap, Brain, Shield } from "lucide-react";
import Mascot from "@/components/Mascot";

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
        <section className="relative overflow-hidden hero-gradient py-24 lg:py-36">
          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD166]/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
              <div className="flex-1 text-center lg:text-left animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD166]/20 text-[#FFD166] mb-8">
                  <Sparkles className="h-4 w-4 icon-pulse" />
                  <span className="text-sm font-medium">Amigo Oculto com Identidade Oculta</span>
                </div>

                {/* Title */}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white">
                  Quem Sou Eu IA
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto lg:mx-0 mb-10 font-light">
                  O Amigo Oculto em que a IA descreve você melhor do que seus amigos.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 btn-hover-scale gap-2 text-base px-8 h-12">
                      Criar Conta
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mascot Display */}
              <div className="flex-1 flex justify-center items-center relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse-soft"></div>
                  <div className="relative z-10 scale-125 hover:scale-150 transition-transform duration-500 cursor-pointer">
                    <Mascot />
                  </div>

                  {/* Floating Elements/Context */}
                  <div className="absolute -top-10 -right-10 bg-card/10 backdrop-blur-md border border-white/10 p-4 rounded-xl rotate-12 hidden md:block">
                    <p className="text-sm font-medium text-white">"Me clique!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
              Como Funciona
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Três passos simples para transformar seu Amigo Oculto em uma experiência inesquecível
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Users,
                  step: "1",
                  title: "Crie um grupo e compartilhe o código",
                  description: "Crie seu grupo em segundos e envie o código único para convidar seus amigos e família.",
                },
                {
                  icon: MessageCircle,
                  step: "2",
                  title: "Cada pessoa preenche seu perfil",
                  description: "Responda perguntas divertidas por texto ou grave um áudio se apresentando.",
                },
                {
                  icon: Brain,
                  step: "3",
                  title: "A IA cria dicas misteriosas",
                  description: "Nossa IA analisa cada perfil e gera 3 dicas enigmáticas para o jogo presencial.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border card-hover-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFD166] flex items-center justify-center font-display font-bold text-[#1E1E1E] text-sm">
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
              Não é só um sorteio. É uma experiência completa de descoberta.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: Sparkles,
                  title: "Dicas da IA",
                  description: "Dicas poéticas, pessoais e engraçadas criadas exclusivamente para cada pessoa.",
                },
                {
                  icon: Lock,
                  title: "Sigilo Total",
                  description: "Ninguém vê as dicas até o momento do jogo. Surpresa garantida!",
                },
                {
                  icon: Gamepad2,
                  title: "Modo Jogo",
                  description: "Interface especial com roleta, confete e frases da IA para animar a festa.",
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
                  <div className="w-12 h-12 rounded-xl bg-[#FFD166]/20 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-[#FFD166]" />
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
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Crie seu grupo agora e transforme o Amigo Oculto da sua família ou amigos em algo inesquecível.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-glow btn-hover-scale gap-2 text-base px-10 h-12">
                Começar Agora
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
              <Gift className="h-5 w-5 text-primary" />
              <span className="font-display font-bold">Quem Sou Eu IA</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Criado para transformar seu amigo oculto em uma experiência memorável.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              © {new Date().getFullYear()} Quem Sou Eu IA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
