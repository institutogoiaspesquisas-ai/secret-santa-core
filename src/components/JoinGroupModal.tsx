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
import { useGroups } from "@/hooks/useGroups";
import { Loader2, Users } from "lucide-react";
import { isValidGroupCode } from "@/lib/generateCode";

interface JoinGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinGroupModal = ({ open, onOpenChange }: JoinGroupModalProps) => {
  const { toast } = useToast();
  const { joinGroup } = useGroups();

  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
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
    setError("");

    // Solicitar entrada no grupo via Supabase
    const result = await joinGroup(code);

    if (result.success) {
      toast({
        title: "Solicitação enviada! ✉️",
        description: "Sua solicitação foi enviada ao administrador do grupo. Aguarde aprovação.",
      });
      handleClose();
    } else {
      setError(result.error || "Erro ao solicitar entrada.");
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setCode("");
      setError("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl text-center">
            Entrar em um Grupo
          </DialogTitle>
          <DialogDescription className="text-center">
            Insira o código de 6 caracteres fornecido pelo administrador do grupo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="joinCode">Código do Grupo</Label>
            <Input
              id="joinCode"
              type="text"
              placeholder="Ex: A9F2KQ"
              value={code}
              onChange={handleCodeChange}
              className={`text-center font-mono text-2xl tracking-[0.5em] uppercase ${error ? "border-destructive" : ""
                }`}
              maxLength={6}
            />
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-glow"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupModal;
