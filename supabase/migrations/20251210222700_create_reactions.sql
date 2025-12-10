-- ============================================
-- Bloco 6: IA Reactions & Humor Engine
-- Tabela de frases dinâmicas para o jogo
-- ============================================
-- Criar enum para tipo de reação
CREATE TYPE reaction_type AS ENUM ('success', 'fail');
-- Criar tabela reactions
CREATE TABLE public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type reaction_type NOT NULL,
    text TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Garantir unicidade do texto
    CONSTRAINT unique_reaction_text UNIQUE (text)
);
-- Habilitar RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
-- Política: Todos podem ler reactions
CREATE POLICY "Anyone can read reactions" ON public.reactions FOR
SELECT USING (true);
-- Política: Service role pode inserir (para Edge Function)
CREATE POLICY "Service role can insert reactions" ON public.reactions FOR
INSERT WITH CHECK (true);
-- ============================================
-- SEED: 50 Frases de Sucesso
-- ============================================
INSERT INTO public.reactions (type, text, is_default)
VALUES -- Frases de Sucesso (1-50)
    (
        'success',
        'Você acertou tão rápido que a IA pediu pra rever o contrato.',
        true
    ),
    (
        'success',
        'Nem o Sherlock faria melhor. Parabéns, mente brilhante!',
        true
    ),
    (
        'success',
        'Acertou em cheio! Isso sim é olho clínico e sorte alinhados.',
        true
    ),
    (
        'success',
        'Bingo! Você desvendou o mistério antes do café esfriar.',
        true
    ),
    (
        'success',
        'Mandou bem! A IA tá aplaudindo com circuitos emocionados.',
        true
    ),
    (
        'success',
        'É oficial: você é o orgulho do grupo.',
        true
    ),
    (
        'success',
        'Acertou! E ainda com estilo. Pode levantar o troféu invisível.',
        true
    ),
    (
        'success',
        'Isso sim é talento investigativo! Daria um ótimo detetive de novela.',
        true
    ),
    (
        'success',
        'Acertei! — disse você. E a IA confirmou com um aceno digital.',
        true
    ),
    (
        'success',
        'Seu chute foi tão certeiro que o VAR da IA nem precisou revisar.',
        true
    ),
    (
        'success',
        'Parabéns, você é o Dumbledore das deduções humanas.',
        true
    ),
    (
        'success',
        'Nem Matrix previu um acerto tão bonito.',
        true
    ),
    (
        'success',
        'Acertou com precisão cirúrgica. O Dr. House ficaria orgulhoso.',
        true
    ),
    (
        'success',
        'Plim! A resposta certa apareceu e você brilhou junto.',
        true
    ),
    (
        'success',
        'Sua mente merece um café com aplausos.',
        true
    ),
    (
        'success',
        'Você decifrou o código humano. A humanidade agradece.',
        true
    ),
    (
        'success',
        'Acertou! A IA vai precisar de um tempo pra se recompor.',
        true
    ),
    (
        'success',
        'Bingo! Um acerto digno de Oscar.',
        true
    ),
    (
        'success',
        'Nem o Google saberia mais rápido que você.',
        true
    ),
    (
        'success',
        'Acertou e ainda pareceu fácil. Irritante, mas admirável.',
        true
    ),
    (
        'success',
        'Parabéns! Você deixou a IA de queixo caído — se ela tivesse um.',
        true
    ),
    (
        'success',
        'Acertou e manteve a pose. Isso é talento e carisma.',
        true
    ),
    (
        'success',
        'Uau! Até o Watson pediu seu LinkedIn.',
        true
    ),
    (
        'success',
        'Foi tão certeiro que a plateia digital levantou pra aplaudir.',
        true
    ),
    (
        'success',
        'Acertou, brilhou e ainda fez parecer casual. Impressionante.',
        true
    ),
    (
        'success',
        'Nem o Mestre dos Magos explicaria melhor.',
        true
    ),
    (
        'success',
        'Acertou com classe. Se fosse teste, tirava 11.',
        true
    ),
    (
        'success',
        'Você descobriu o segredo. Agora só falta o café e o prêmio.',
        true
    ),
    (
        'success',
        'A IA jurava que você erraria. E agora tá sem graça.',
        true
    ),
    (
        'success',
        'Acertou! A trilha sonora da vitória tá tocando mentalmente.',
        true
    ),
    (
        'success',
        'Sua dedução foi tão boa que virou rumor entre as máquinas.',
        true
    ),
    (
        'success',
        'Nem precisava de sorte, só dessa confiança absurda.',
        true
    ),
    (
        'success',
        'Mandou bem demais! Já pode abrir um curso de adivinhação.',
        true
    ),
    (
        'success',
        'Acertou! Isso é o que chamam de talento empírico.',
        true
    ),
    (
        'success',
        'Até o algoritmo se curvou pra sua genialidade.',
        true
    ),
    (
        'success',
        'Você descobriu antes da dica 3? A IA tá suando bytes.',
        true
    ),
    (
        'success',
        'Acertou na mosca. E nem usou óculos de lupa.',
        true
    ),
    (
        'success',
        'Genial! Se existisse um ranking, você estaria no topo.',
        true
    ),
    (
        'success',
        'A IA piscou e você já tinha acertado. Isso é assustador.',
        true
    ),
    (
        'success',
        'Acertou, mas a IA finge que era parte do plano.',
        true
    ),
    (
        'success',
        'Você não adivinhou. Você previu o futuro.',
        true
    ),
    (
        'success',
        'Acertei! — disse você. E o universo respondeu: finalmente!',
        true
    ),
    (
        'success',
        'Nem Freud explica esse acerto.',
        true
    ),
    (
        'success',
        'Acertou tão bem que até o Tio Ben ficaria orgulhoso.',
        true
    ),
    (
        'success',
        'Você é o Scooby-Doo dessa turma, mas com mais charme.',
        true
    ),
    (
        'success',
        'Um acerto desses vale replay com trilha épica.',
        true
    ),
    (
        'success',
        'A IA tá tentando entender como você fez isso.',
        true
    ),
    (
        'success',
        'Você é oficialmente o gênio da rodada.',
        true
    ),
    (
        'success',
        'Acertou e ainda pareceu que nem tentou.',
        true
    ),
    (
        'success',
        'Vitória linda! Pode sair do jogo com moral.',
        true
    ),
    -- Frases de Erro (1-50)
    (
        'fail',
        'Errou feio, mas pelo menos falou com confiança.',
        true
    ),
    (
        'fail',
        'Amigo errado. Mas valeu a ousadia!',
        true
    ),
    (
        'fail',
        'Errou, mas a plateia te achou simpático.',
        true
    ),
    (
        'fail',
        'Não foi dessa vez. A IA piscou e fez cara de pena.',
        true
    ),
    (
        'fail',
        'Errou tão bonito que parecia coreografia.',
        true
    ),
    (
        'fail',
        'Errar é humano, insistir é entretenimento.',
        true
    ),
    (
        'fail',
        'Parece que o palpite foi patrocinado pela coragem.',
        true
    ),
    ('fail', 'Errou, mas quem nunca, né?', true),
    (
        'fail',
        'A IA te olhou e pensou: foi quase… mas não.',
        true
    ),
    (
        'fail',
        'Esse palpite foi tipo plot twist ruim: inesperado e sem sentido.',
        true
    ),
    (
        'fail',
        'Errou, mas o carisma manteve o respeito.',
        true
    ),
    (
        'fail',
        'Nem o Toretto explicaria esse erro com tanta família.',
        true
    ),
    (
        'fail',
        'Foi quase… se o quase morasse em outro CEP.',
        true
    ),
    (
        'fail',
        'Errou! Mas com tanta convicção que ficou bonito.',
        true
    ),
    (
        'fail',
        'A IA ficou em silêncio. E o silêncio diz muito.',
        true
    ),
    (
        'fail',
        'Não foi esse. Mas valeu pela tentativa cinematográfica.',
        true
    ),
    (
        'fail',
        'Errou, mas a coragem de tentar é digna de Oscar.',
        true
    ),
    (
        'fail',
        'Pense positivo: ao menos não acertou por sorte.',
        true
    ),
    (
        'fail',
        'Errou feio, errou rude. Mas seguimos.',
        true
    ),
    (
        'fail',
        'Errar faz parte. Só não precisava ser tão criativo.',
        true
    ),
    (
        'fail',
        'Nem o Chapolin salvaria esse chute.',
        true
    ),
    (
        'fail',
        'Errou, mas ganhou experiência de vida.',
        true
    ),
    (
        'fail',
        'A IA piscou e murmurou: tenta de novo, vai….',
        true
    ),
    (
        'fail',
        'Errou! Mas a autoestima permanece intacta, espero.',
        true
    ),
    (
        'fail',
        'Isso foi um erro? Foi. Mas foi um erro confiante.',
        true
    ),
    (
        'fail',
        'Tão longe que a IA abriu o Google Maps.',
        true
    ),
    (
        'fail',
        'Errou, mas trouxe entretenimento ao grupo.',
        true
    ),
    (
        'fail',
        'Errar é normal. Só não com tanta convicção.',
        true
    ),
    (
        'fail',
        'A IA anotou isso como exemplo de coragem.',
        true
    ),
    (
        'fail',
        'Errou, mas o importante é participar (mentira, é acertar).',
        true
    ),
    (
        'fail',
        'Nem tentando errado você acertou.',
        true
    ),
    (
        'fail',
        'Errou, mas a entrega artística foi impecável.',
        true
    ),
    (
        'fail',
        'Parece que hoje não é seu dia, mas foi divertido.',
        true
    ),
    ('fail', 'Errou, mas o humor está pago.', true),
    (
        'fail',
        'Isso foi tão fora do alvo que virou performance.',
        true
    ),
    (
        'fail',
        'A IA registrou esse erro como interessante.',
        true
    ),
    ('fail', 'Errou, mas a energia foi boa.', true),
    (
        'fail',
        'Pense pelo lado bom: você animou a rodada.',
        true
    ),
    (
        'fail',
        'Errou. E o mundo girou levemente constrangido.',
        true
    ),
    (
        'fail',
        'A IA tá rindo discretamente, mas com respeito.',
        true
    ),
    (
        'fail',
        'Nem o Oráculo entenderia esse palpite.',
        true
    ),
    (
        'fail',
        'Errou com tanto estilo que quase virou acerto.',
        true
    ),
    (
        'fail',
        'Se errar fosse prêmio, você teria ganhado.',
        true
    ),
    (
        'fail',
        'Errar é arte. Você é o Picasso da rodada.',
        true
    ),
    (
        'fail',
        'Foi um erro digno de um filme de comédia.',
        true
    ),
    (
        'fail',
        'A IA anotou: não siga esse exemplo.',
        true
    ),
    ('fail', 'Errou, mas a plateia te amou.', true),
    (
        'fail',
        'Esse erro foi épico. De uma forma… preocupante.',
        true
    ),
    (
        'fail',
        'A IA ficou tão confusa quanto você.',
        true
    ),
    (
        'fail',
        'Errou, mas com elegância. Isso conta?',
        true
    );
-- Índice para busca rápida por tipo
CREATE INDEX idx_reactions_type ON public.reactions(type);