export const PROFILE_QUESTIONS = [
  {
    id: 'tres_palavras',
    question: 'Três palavras que te definem',
    placeholder: 'Ex: Criativo, determinado, sonhador...'
  },
  {
    id: 'hobbies',
    question: 'Hobbies ou paixões',
    placeholder: 'Ex: Música, esportes, leitura, viagens...'
  },
  {
    id: 'tipo_presente',
    question: 'Tipo de presente que mais gosta',
    placeholder: 'Ex: Experiências, livros, tecnologia, algo feito à mão...'
  },
  {
    id: 'algo_ninguem_imagina',
    question: 'Algo que ninguém imagina sobre você',
    placeholder: 'Ex: Tenho medo de altura, já fiz paraquedismo...'
  },
  {
    id: 'frase_costuma_dizer',
    question: 'Uma frase que você costuma dizer',
    placeholder: 'Ex: "A vida é curta demais para...", "Tudo vai dar certo"...'
  },
  {
    id: 'estilo_vida',
    question: 'Seu estilo de vida',
    placeholder: 'Ex: Caseiro, aventureiro, esportista, workaholic...'
  },
  {
    id: 'personagem_seria',
    question: 'Se fosse um personagem, qual seria?',
    placeholder: 'Ex: Harry Potter, Sherlock Holmes, Mulher Maravilha...'
  },
  {
    id: 'comida_representa',
    question: 'Uma comida que te representa',
    placeholder: 'Ex: Pizza, feijoada, sushi, brigadeiro...'
  }
] as const;

export type QuestionId = typeof PROFILE_QUESTIONS[number]['id'];
export type ProfileAnswers = Record<QuestionId, string>;
