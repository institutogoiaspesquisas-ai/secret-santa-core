import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNewReactions, type ReactionType } from '@/constants/gameMessages';

interface ReactionsAdminPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReactionsAdminPanel({ isOpen, onClose }: ReactionsAdminPanelProps) {
    const { toast } = useToast();
    const [successCount, setSuccessCount] = useState(5);
    const [failCount, setFailCount] = useState(5);
    const [loadingSuccess, setLoadingSuccess] = useState(false);
    const [loadingFail, setLoadingFail] = useState(false);

    const handleGenerate = async (type: ReactionType) => {
        const count = type === 'success' ? successCount : failCount;
        const setLoading = type === 'success' ? setLoadingSuccess : setLoadingFail;

        setLoading(true);

        try {
            const result = await generateNewReactions(type, count);

            if (result.success) {
                toast({
                    title: type === 'success' ? '🎉 Frases de sucesso geradas!' : '😂 Frases de erro geradas!',
                    description: result.message,
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast({
                title: 'Erro ao gerar frases',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md bg-[#1E1E1E] border-[#FFD166]/30">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 font-display">
                        <Sparkles className="h-5 w-5 text-[#FFD166]" />
                        Gerar Novas Frases
                    </CardTitle>
                    <CardDescription className="text-white/60">
                        Use a IA para criar mais frases de reação
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Frases de Sucesso */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Frases de Sucesso
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={20}
                                value={successCount}
                                onChange={(e) => setSuccessCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-20 bg-[#2E2E2E] border-[#FFD166]/30 text-white"
                            />
                            <Button
                                onClick={() => handleGenerate('success')}
                                disabled={loadingSuccess}
                                className="flex-1 bg-green-600 hover:bg-green-700 btn-hover-scale gap-2"
                            >
                                {loadingSuccess ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Gerar {successCount} frases
                            </Button>
                        </div>
                    </div>

                    {/* Frases de Erro */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Frases de Erro
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={20}
                                value={failCount}
                                onChange={(e) => setFailCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-20 bg-[#2E2E2E] border-[#FFD166]/30 text-white"
                            />
                            <Button
                                onClick={() => handleGenerate('fail')}
                                disabled={loadingFail}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 btn-hover-scale gap-2"
                            >
                                {loadingFail ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Gerar {failCount} frases
                            </Button>
                        </div>
                    </div>

                    {/* Info */}
                    <p className="text-xs text-white/40 text-center">
                        A IA criará frases únicas, sem repetir as existentes.
                    </p>

                    {/* Close Button */}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                        Fechar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
