/**
 * Formato da análise devolvida pela IA.
 * O mesmo schema Zod serve para duas coisas:
 * 1. vira JSON Schema e é enviado ao Gemini, que passa a responder exatamente nesse formato;
 * 2. valida a resposta antes de ela chegar na tela (a IA pode errar, o servidor confere).
 */
import { z } from 'zod';

const strength = z.object({
  titulo: z.string().describe('Resumo curto do ponto forte (até 8 palavras).'),
  detalhe: z.string().describe('Uma frase ligando algo concreto do currículo a um requisito da vaga.'),
});

const gap = z.object({
  titulo: z.string().describe('Requisito da vaga que o currículo não mostra (até 8 palavras).'),
  detalhe: z.string().describe('Por que isso pesa para esta vaga, em uma frase.'),
  comoResolver: z.string().describe('Uma ação prática para resolver ou destacar melhor, em uma frase.'),
});

const suggestion = z.object({
  secao: z.string().describe('Seção do currículo onde a mudança entra (ex.: "Experiência", "Resumo", "Habilidades").'),
  antes: z.string().describe('Trecho original do currículo, copiado como está. Vazio se for um acréscimo.'),
  depois: z.string().describe('Trecho reescrito, sem inventar fatos. Use marcadores como [X%] para números que o candidato deve preencher.'),
  motivo: z.string().describe('Por que a mudança ajuda nesta vaga, em uma frase.'),
});

export const analysisSchema = z.object({
  cargo: z.string().describe('Título da vaga como aparece no anúncio.'),
  empresa: z.string().describe('Nome da empresa se aparecer na vaga; senão, string vazia.'),
  nota: z.number().describe('Compatibilidade de 0 a 100, seguindo a escala das instruções.'),
  resumo: z.string().describe('Visão geral em 2 ou 3 frases: o quanto o perfil combina e o principal ajuste a fazer.'),
  pontosFortes: z.array(strength).describe('De 3 a 5 pontos fortes.'),
  lacunas: z.array(gap).describe('Até 5 lacunas, da mais importante para a menos importante.'),
  palavrasChave: z.object({
    presentes: z.array(z.string()).describe('Termos importantes da vaga que aparecem no currículo (até 12).'),
    ausentes: z.array(z.string()).describe('Termos importantes da vaga que não aparecem no currículo (até 12).'),
  }),
  sugestoes: z.array(suggestion).describe('De 3 a 5 sugestões de reescrita.'),
  carta: z.string().describe('Carta de apresentação completa, com parágrafos separados por uma linha em branco.'),
});

export type Analysis = z.infer<typeof analysisSchema>;

export { MATCH_LABELS, matchLevel, type MatchLevel } from './match';

const clean = (text: string) => text.trim();
const uniqueTerms = (terms: string[]) => {
  const seen = new Set<string>();
  return terms
    .map(clean)
    .filter((term) => {
      const key = term.toLowerCase();
      if (!term || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
};

/**
 * Deixa a resposta dentro dos limites que a tela espera, mesmo que a IA exagere:
 * nota inteira entre 0 e 100, listas com tamanho máximo e textos sem espaços sobrando.
 */
export function normalizeAnalysis(raw: Analysis): Analysis {
  return {
    cargo: clean(raw.cargo),
    empresa: clean(raw.empresa),
    nota: Math.min(100, Math.max(0, Math.round(raw.nota))),
    resumo: clean(raw.resumo),
    pontosFortes: raw.pontosFortes.filter((item) => item.titulo.trim()).slice(0, 5),
    lacunas: raw.lacunas.filter((item) => item.titulo.trim()).slice(0, 5),
    palavrasChave: {
      presentes: uniqueTerms(raw.palavrasChave.presentes),
      ausentes: uniqueTerms(raw.palavrasChave.ausentes),
    },
    sugestoes: raw.sugestoes.filter((item) => item.depois.trim()).slice(0, 5),
    carta: raw.carta.trim(),
  };
}

/** Converte e valida o texto JSON devolvido pela IA. Retorna null se não estiver no formato certo. */
export function parseAnalysis(text: string | undefined): Analysis | null {
  if (!text) return null;
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const result = analysisSchema.safeParse(data);
  return result.success ? normalizeAnalysis(result.data) : null;
}

/** JSON Schema enviado ao Gemini (sem as chaves que a API não aceita). */
export function analysisJsonSchema(): Record<string, unknown> {
  return stripUnsupportedKeys(z.toJSONSchema(analysisSchema)) as Record<string, unknown>;
}

const UNSUPPORTED_KEYS = new Set(['$schema', 'additionalProperties']);

function stripUnsupportedKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUnsupportedKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !UNSUPPORTED_KEYS.has(key))
        .map(([key, inner]) => [key, stripUnsupportedKeys(inner)]),
    );
  }
  return value;
}
