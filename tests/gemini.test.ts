import { describe, expect, it, vi } from 'vitest';

import { EXAMPLE_ANALYSIS } from '@/lib/example';
import { AnalysisError, analyzeResume, modelsFromEnv, type Generate } from '@/lib/gemini';

const resume = { kind: 'text' as const, text: 'Currículo da Ana' };
const job = 'Vaga de desenvolvedora';
const valid = JSON.stringify(EXAMPLE_ANALYSIS);

function apiError(status: number, message = 'erro') {
  return Object.assign(new Error(message), { status });
}

describe('chamada à IA', () => {
  it('lê a lista de modelos da variável de ambiente', () => {
    expect(modelsFromEnv('modelo-a, modelo-b ,')).toEqual(['modelo-a', 'modelo-b']);
    expect(modelsFromEnv('')).toEqual(['gemini-3.5-flash-lite', 'gemini-3.8-flash']);
  });

  it('devolve a análise e o modelo usado', async () => {
    const generate = vi.fn<Generate>().mockResolvedValue(valid);
    const result = await analyzeResume(resume, job, { generate, models: ['modelo-a'] });
    expect(result.model).toBe('modelo-a');
    expect(result.analysis.nota).toBe(EXAMPLE_ANALYSIS.nota);
  });

  it('manda o currículo em texto junto com a vaga, delimitados', async () => {
    const generate = vi.fn<Generate>().mockResolvedValue(valid);
    await analyzeResume(resume, job, { generate, models: ['modelo-a'] });
    const [{ parts }] = generate.mock.calls[0];
    expect(parts).toHaveLength(1);
    expect(JSON.stringify(parts)).toContain('<curriculo>');
    expect(JSON.stringify(parts)).toContain('<vaga>');
  });

  it('manda o PDF como anexo', async () => {
    const generate = vi.fn<Generate>().mockResolvedValue(valid);
    await analyzeResume({ kind: 'pdf', base64: 'JVBERi0=' }, job, { generate, models: ['modelo-a'] });
    const [{ parts }] = generate.mock.calls[0];
    expect(parts[0]).toEqual({ inlineData: { mimeType: 'application/pdf', data: 'JVBERi0=' } });
  });

  it('troca de modelo quando o primeiro está sem cota', async () => {
    const generate = vi
      .fn<Generate>()
      .mockRejectedValueOnce(apiError(429, 'RESOURCE_EXHAUSTED'))
      .mockResolvedValueOnce(valid);
    const result = await analyzeResume(resume, job, { generate, models: ['modelo-a', 'modelo-b'] });
    expect(result.model).toBe('modelo-b');
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('troca de modelo quando o primeiro demora demais', async () => {
    const timeout = Object.assign(new Error('Request timed out'), { name: 'TimeoutError' });
    const generate = vi.fn<Generate>().mockRejectedValueOnce(timeout).mockResolvedValueOnce(valid);
    const result = await analyzeResume(resume, job, { generate, models: ['modelo-a', 'modelo-b'] });
    expect(result.model).toBe('modelo-b');
  });

  it('avisa que a cota acabou quando todos os modelos estão sem cota', async () => {
    const generate = vi.fn<Generate>().mockRejectedValue(apiError(429));
    await expect(analyzeResume(resume, job, { generate, models: ['a', 'b'] })).rejects.toMatchObject({
      code: 'QUOTA',
    });
  });

  it('tenta o próximo modelo quando a resposta vem fora do formato', async () => {
    const generate = vi.fn<Generate>().mockResolvedValueOnce('{"nota": 10}').mockResolvedValueOnce(valid);
    const result = await analyzeResume(resume, job, { generate, models: ['a', 'b'] });
    expect(result.model).toBe('b');
  });

  it('não insiste em erros que não são de cota ou disponibilidade', async () => {
    const generate = vi.fn<Generate>().mockRejectedValue(apiError(400, 'pedido inválido'));
    await expect(analyzeResume(resume, job, { generate, models: ['a', 'b'] })).rejects.toBeInstanceOf(AnalysisError);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('exige a chave da API quando não há gerador falso', async () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    await expect(analyzeResume(resume, job)).rejects.toMatchObject({ code: 'CONFIG' });
    process.env.GEMINI_API_KEY = original;
  });
});
