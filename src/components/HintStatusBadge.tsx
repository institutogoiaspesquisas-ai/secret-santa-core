import { Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HintStatusBadgeProps {
  hintsGenerated: boolean;
  size?: 'sm' | 'default';
}

export function HintStatusBadge({ hintsGenerated, size = 'default' }: HintStatusBadgeProps) {
  if (!hintsGenerated) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`bg-[#FFD166] text-[#1E1E1E] hover:bg-[#FFD166]/90 gap-1 cursor-help ${
              size === 'sm' ? 'text-xs px-2 py-0.5' : ''
            }`}
          >
            <Lock className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            <Sparkles className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            Dicas Geradas
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>As dicas foram guardadas pela IA para a revelação final 🤖✨</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
