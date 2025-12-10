import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, Gift } from "lucide-react";
import { generateGroupCode } from "@/lib/generateCode";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGroupModal = ({ open, onOpenChange }: CreateGroupModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (groupName.trim().length < 3) {
      setError("O nome do grupo deve ter no mínimo 3 caracteres.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Generate unique code
    const code = generateGroupCode();
    
    // TODO: Implement with Supabase - create group and assign owner
    setTimeout(() => {
      setIsLoading(false);
      setGeneratedCode(code);
      setStep("success");
    }, 1000);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      toast({
        title: "Código copiado!",
        description: "Compartilhe com seus amigos.",
      });
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep("form");
      setGroupName("");
      setGeneratedCode("");
      setError("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Criar Novo Grupo
              </DialogTitle>
              <DialogDescription>
                Dê um nome ao seu grupo de Amigo Oculto. Um código único será gerado automaticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Nome do Grupo</Label>
                <Input
                  id="groupName"
                  placeholder="Ex: Família Galvão"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    setError("");
                  }}
                  className={error ? "border-destructive" : ""}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="btn-glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Grupo
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="font-display text-xl">
                Grupo Criado com Sucesso! 🎉
              </DialogTitle>
              <DialogDescription>
                Compartilhe o código abaixo com seus amigos para que eles possam entrar no grupo.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-2">Código de entrada</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono font-bold text-3xl tracking-[0.3em]">
                    {generatedCode}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    {codeCopied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={handleClose}>
                Ir para o Dashboard
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
