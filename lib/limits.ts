/** Limites de tamanho usados pelo servidor e pela tela (a tela avisa antes de enviar). */
export const LIMITS = {
  jobMin: 80,
  jobMax: 15_000,
  resumeMin: 150,
  resumeMax: 20_000,
  pdfMaxBytes: 3 * 1024 * 1024,
} as const;
