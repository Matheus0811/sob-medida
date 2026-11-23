/**
 * Chamada ao Google Gemini.
 * Cada análise usa uma única requisição: nota, lacunas, sugestões e carta saem juntas,
 * o que economiza a cota gratuita. Se um modelo estiver sem cota ou fora do ar, tenta o próximo.
 * Se o Google responder que está sobrecarregado, espera alguns segundos e tenta mais uma vez.
 */
import { GoogleGenAI } from '@google/genai';

import { analysisJsonSchema, parseAnalysis, type Analysis } from './analysis-schema';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompt';

export type ResumeInput = { kind: 'text'; text: string } | { kind: 'pdf'; base64: string };

export type AnalysisErrorCode = 'CONFIG' | 'QUOTA' | 'UNAVAILABLE' | 'BAD_OUTPUT';

export class AnalysisError extends Error {
  constructor(
    public readonly code: AnalysisErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// O Flash-Lite vem primeiro: responde em poucos segundos e tem a maior cota grátis (cerca de 500 por dia).
export const DEFAULT_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

/** Lê a lista de modelos de GEMINI_MODELS ("modelo-a,modelo-b"); sem ela, usa os padrões. */
export function modelsFromEnv(value = process.env.GEMINI_MODELS): string[] {
  const models = (value ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  return models.length > 0 ? models : DEFAULT_MODELS;
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export interface GenerateRequest {
  model: string;
  parts: Part[];
}

/** Função que conversa com a IA. Nos testes ela é trocada por uma versão falsa. */
export type Generate = (request: GenerateRequest) => Promise<string | undefined>;

/** Tempo máximo de espera por modelo. Sem isso, uma resposta travada deixaria a análise presa. */
export const MODEL_TIMEOUT_MS = 25_000;

/** Pausa antes da segunda rodada quando o Google diz que está sobrecarregado (erro 503). */
export const OVERLOAD_RETRY_DELAY_MS = 2_500;

/** Depois disso não começa outra tentativa: a função da Vercel tem no máximo 60 s. */
export const START_BUDGET_MS = 33_000;

function geminiGenerate(apiKey: string): Generate {
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: MODEL_TIMEOUT_MS } });
  return async ({ model, parts }) => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseJsonSchema: analysisJsonSchema(),
        temperature: 0.2,
      },
    });
    return response.text;
  };
}

function httpStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status: unknown }).status);
    return Number.isFinite(status) ? status : undefined;
  }
  return undefined;
}

function isTimeout(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /timeout|timed out|abort/i.test(message);
}

function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return httpStatus(error) === 429 || /RESOURCE_EXHAUSTED|quota/i.test(message);
}

/** Sobrecarga passageira do Google ("high demand"): vale esperar um pouco e tentar o mesmo modelo de novo. */
function isOverloaded(error: unknown): boolean {
  const status = httpStatus(error);
  const message = error instanceof Error ? error.message : String(error);
  return status === 503 || status === 500 || /overloaded|high demand/i.test(message);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Erros em que vale tentar o próximo modelo: cota, sobrecarga, modelo inexistente. */
function isRetryable(error: unknown): boolean {
  const status = httpStatus(error);
  return (
    isQuotaError(error) ||
    isTimeout(error) ||
    status === 404 ||
    status === 500 ||
    status === 503 ||
    status === 504
  );
}

export interface AnalyzeResult {
  analysis: Analysis;
  model: string;
}

export async function analyzeResume(
  resume: ResumeInput,
  job: string,
  options: { generate?: Generate; models?: string[]; retryDelayMs?: number } = {},
): Promise<AnalyzeResult> {
  let generate = options.generate;
  if (!generate) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AnalysisError('CONFIG', 'A chave da API do Gemini não está configurada no servidor.');
    }
    generate = geminiGenerate(apiKey);
  }

  const parts: Part[] =
    resume.kind === 'pdf'
      ? [{ inlineData: { mimeType: 'application/pdf', data: resume.base64 } }, { text: buildUserPrompt(job) }]
      : [{ text: buildUserPrompt(job, resume.text) }];

  let quotaExhausted = false;
  let badOutput = false;
  const begin = Date.now();
  const models = options.models ?? modelsFromEnv();
  const retryLater: string[] = [];

  // 1ª rodada: todos os modelos. 2ª rodada: só os que estavam sobrecarregados, depois de uma pausa.
  for (const round of [1, 2]) {
    const list = round === 1 ? models : retryLater;
    if (round === 2 && list.length > 0) {
      const delay = options.retryDelayMs ?? OVERLOAD_RETRY_DELAY_MS;
      if (Date.now() - begin + delay > START_BUDGET_MS) break;
      console.info(`[analisar] Google sobrecarregado; nova tentativa em ${delay / 1000}s`);
      await sleep(delay);
    }

    for (const model of list) {
      if (Date.now() - begin > START_BUDGET_MS) break;
      const started = Date.now();
      console.info(`[analisar] chamando ${model}${round === 2 ? ' (2ª tentativa)' : ''}...`);
      try {
        const analysis = parseAnalysis(await generate({ model, parts }));
        const seconds = ((Date.now() - started) / 1000).toFixed(1);
        if (analysis) {
          console.info(`[analisar] ${model} respondeu em ${seconds}s`);
          return { analysis, model };
        }
        console.warn(`[analisar] ${model} respondeu fora do formato em ${seconds}s`);
        badOutput = true; // resposta fora do formato: tenta o próximo modelo
      } catch (error) {
        if (!isRetryable(error)) {
          console.error(`Falha no modelo ${model}:`, error);
          throw new AnalysisError('UNAVAILABLE', 'Não foi possível falar com a IA agora. Tente de novo em instantes.');
        }
        if (isQuotaError(error)) quotaExhausted = true;
        else if (round === 1 && isOverloaded(error)) retryLater.push(model);
        console.warn(`Modelo ${model} indisponível, tentando o próximo:`, error instanceof Error ? error.message : error);
      }
    }
  }

  if (quotaExhausted) {
    throw new AnalysisError(
      'QUOTA',
      'O limite gratuito de análises da IA acabou por hoje. Tente novamente amanhã ou veja o exemplo pronto.',
    );
  }
  if (badOutput) {
    throw new AnalysisError('BAD_OUTPUT', 'A IA respondeu em um formato inesperado. Tente analisar de novo.');
  }
  throw new AnalysisError(
    'UNAVAILABLE',
    'A IA do Google está com muita procura agora. Tente de novo em 1 ou 2 minutos ou veja o exemplo pronto.',
  );
}
