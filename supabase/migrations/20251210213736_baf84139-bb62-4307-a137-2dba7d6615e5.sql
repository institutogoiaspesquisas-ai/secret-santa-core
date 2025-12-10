-- Tabela de dicas geradas pela IA (secretas até o modo jogo)
CREATE TABLE public.hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hint1 TEXT NOT NULL,
  hint2 TEXT NOT NULL,
  hint3 TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(group_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;

-- NENHUMA política SELECT pública - dicas são secretas!
-- Apenas o service_role pode acessar via Edge Function

-- Adicionar coluna hints_generated à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN hints_generated BOOLEAN DEFAULT false;