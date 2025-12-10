// Mensagens do jogo - Serão personalizadas pelo usuário posteriormente
// Por enquanto, usando mensagens placeholder

export const GAME_MESSAGES = {
    START: [
        "O oráculo desperta… o jogo começou!",
        "Prepare-se para desvendar identidades ocultas 🎭",
        "O momento da verdade chegou!"
    ],
    NEW_ROUND: [
        "Um novo mistério paira no ar…",
        "Novo mistério no ar… a IA analisou e guardou três dicas sobre alguém aqui.",
        "Quem será o próximo a ser desvendado?"
    ],
    WRONG_GUESS: [
        "Amigo errado! O oráculo gargalha em silêncio.",
        "Detective? Talvez. Supremo? Ainda não.",
        "Quase! Mas a IA ainda guarda segredos.",
        "Tente novamente, jovem detetive!",
        "O mistério permanece..."
    ],
    CORRECT_GUESS: [
        "Parabéns, Mestre Detetive Supremo!",
        "Você decifrou o código humano!",
        "O multiverso se curvou à sua lógica!",
        "A IA se curva diante da sua perspicácia!",
        "Elementar, meu caro Watson!"
    ],
    REVEAL: [
        "Este era o ser misterioso descrito pela IA… parabéns a quem acertou!",
        "E a identidade secreta era...",
        "O véu foi levantado!"
    ],
    GAME_END: [
        "Todos os mistérios foram revelados. Que comece a troca de presentes!",
        "Todos os mistérios foram revelados 🎭 O jogo terminou!",
        "Parabéns a todos! O jogo chegou ao fim."
    ]
} as const;

// Função helper para obter mensagem aleatória
export function getRandomMessage(category: keyof typeof GAME_MESSAGES): string {
    const messages = GAME_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
}
