/** Faixas da nota de compatibilidade (arquivo sem dependências, usado também no navegador). */
export type MatchLevel = 'alta' | 'boa' | 'parcial' | 'baixa';

/** Faixa da nota, usada no texto e na cor do resultado. */
export function matchLevel(score: number): MatchLevel {
  if (score >= 85) return 'alta';
  if (score >= 70) return 'boa';
  if (score >= 45) return 'parcial';
  return 'baixa';
}

export const MATCH_LABELS: Record<MatchLevel, string> = {
  alta: 'Compatibilidade alta',
  boa: 'Boa compatibilidade',
  parcial: 'Compatibilidade parcial',
  baixa: 'Compatibilidade baixa',
};
