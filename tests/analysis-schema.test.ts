import { describe, expect, it } from 'vitest';

import { analysisJsonSchema, analysisSchema, matchLevel, parseAnalysis } from '@/lib/analysis-schema';
import { EXAMPLE_ANALYSIS } from '@/lib/example';

describe('formato da análise', () => {
  it('o exemplo pronto segue o formato', () => {
    expect(analysisSchema.safeParse(EXAMPLE_ANALYSIS).success).toBe(true);
  });

  it('aceita uma resposta válida e normaliza nota e listas', () => {
    const raw = {
      ...EXAMPLE_ANALYSIS,
      nota: 104.6,
      resumo: '  Bom perfil.  ',
      pontosFortes: Array.from({ length: 8 }, (_, i) => ({ titulo: `Ponto ${i}`, detalhe: 'x' })),
      palavrasChave: { presentes: ['React', 'react', ' Git ', ''], ausentes: [] },
    };
    const analysis = parseAnalysis(JSON.stringify(raw));
    expect(analysis).not.toBeNull();
    expect(analysis!.nota).toBe(100);
    expect(analysis!.resumo).toBe('Bom perfil.');
    expect(analysis!.pontosFortes).toHaveLength(5);
    expect(analysis!.palavrasChave.presentes).toEqual(['React', 'Git']);
  });

  it('recusa texto que não é JSON ou JSON fora do formato', () => {
    expect(parseAnalysis(undefined)).toBeNull();
    expect(parseAnalysis('isto não é json')).toBeNull();
    expect(parseAnalysis(JSON.stringify({ nota: 50 }))).toBeNull();
  });

  it('classifica a nota em faixas', () => {
    expect(matchLevel(90)).toBe('alta');
    expect(matchLevel(70)).toBe('boa');
    expect(matchLevel(45)).toBe('parcial');
    expect(matchLevel(44)).toBe('baixa');
  });

  it('gera um JSON Schema sem as chaves que o Gemini não aceita', () => {
    const schema = analysisJsonSchema();
    const text = JSON.stringify(schema);
    expect(schema.type).toBe('object');
    expect(text).not.toContain('$schema');
    expect(text).not.toContain('additionalProperties');
    expect(Object.keys(schema.properties as object)).toContain('carta');
  });
});
