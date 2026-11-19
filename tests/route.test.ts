import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EXAMPLE_ANALYSIS } from '@/lib/example';

const analyzeResume = vi.hoisted(() => vi.fn());

vi.mock('@/lib/gemini', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/gemini')>();
  return { ...original, analyzeResume };
});

const { POST } = await import('@/app/api/analisar/route');
const { AnalysisError } = await import('@/lib/gemini');

const JOB = 'Desenvolvedor(a) Front-end Júnior. Requisitos: React, TypeScript, APIs REST, Git e noções de acessibilidade.';
const RESUME = 'Ana Ribeiro, desenvolvedora front-end. '.repeat(10);

let ipCounter = 0;
function request(fields: Record<string, string>, ip = `10.0.0.${++ipCounter}`) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return new Request('http://localhost/api/analisar', {
    method: 'POST',
    body,
    headers: { 'x-forwarded-for': ip },
  });
}

describe('POST /api/analisar', () => {
  beforeEach(() => {
    analyzeResume.mockReset();
  });

  it('devolve a análise', async () => {
    analyzeResume.mockResolvedValue({ analysis: EXAMPLE_ANALYSIS, model: 'gemini-teste' });
    const response = await POST(request({ vaga: JOB, curriculo: RESUME }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.model).toBe('gemini-teste');
    expect(body.analysis.nota).toBe(EXAMPLE_ANALYSIS.nota);
  });

  it('responde 422 com o campo errado quando falta informação', async () => {
    const response = await POST(request({ vaga: 'curta', curriculo: RESUME }));
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toMatchObject({ code: 'VALIDATION_ERROR', field: 'vaga' });
    expect(analyzeResume).not.toHaveBeenCalled();
  });

  it('avisa quando a cota da IA acabou', async () => {
    analyzeResume.mockRejectedValue(new AnalysisError('QUOTA', 'Cota esgotada.'));
    const response = await POST(request({ vaga: JOB, curriculo: RESUME }));
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('QUOTA');
  });

  it('limita análises seguidas da mesma pessoa', async () => {
    analyzeResume.mockResolvedValue({ analysis: EXAMPLE_ANALYSIS, model: 'gemini-teste' });
    const ip = '192.168.0.99';
    for (let i = 0; i < 5; i += 1) {
      expect((await POST(request({ vaga: JOB, curriculo: RESUME }, ip))).status).toBe(200);
    }
    const blocked = await POST(request({ vaga: JOB, curriculo: RESUME }, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });
});
