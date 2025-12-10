export const PROFILE_QUESTIONS = [
  {
    id: 'hobbies',
    question: '¿Cuáles son tus hobbies o pasatiempos favoritos?',
    placeholder: 'Ej: Me gusta leer, jugar fútbol, cocinar...'
  },
  {
    id: 'music',
    question: '¿Qué tipo de música te gusta?',
    placeholder: 'Ej: Rock, pop, reggaetón, clásica...'
  },
  {
    id: 'food',
    question: '¿Cuál es tu comida favorita?',
    placeholder: 'Ej: Pizza, tacos, sushi...'
  },
  {
    id: 'travel',
    question: '¿Cuál es tu destino de viaje soñado?',
    placeholder: 'Ej: Japón, París, las playas del Caribe...'
  },
  {
    id: 'fun_fact',
    question: '¿Cuál es un dato curioso sobre ti?',
    placeholder: 'Ej: Puedo resolver un cubo Rubik en menos de un minuto...'
  }
] as const;

export type QuestionId = typeof PROFILE_QUESTIONS[number]['id'];
export type ProfileAnswers = Record<QuestionId, string>;
