/**
 * Gera um código único de 6 caracteres alfanuméricos
 * Usa apenas letras maiúsculas e números para facilitar a leitura
 */
export function generateGroupCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removidos I, O, 0, 1 para evitar confusão
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

/**
 * Valida o formato do código de grupo
 */
export function isValidGroupCode(code: string): boolean {
  const cleanCode = code.toUpperCase().trim();
  return /^[A-Z0-9]{6}$/.test(cleanCode);
}
