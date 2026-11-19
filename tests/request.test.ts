import { describe, expect, it } from 'vitest';

import { InputError, readAnalysisRequest } from '@/lib/request';

const JOB = 'Desenvolvedor(a) Front-end Júnior. Requisitos: React, TypeScript, APIs REST, Git e noções de acessibilidade.';
const RESUME = 'Ana Ribeiro, desenvolvedora front-end. '.repeat(10);

function form(fields: Record<string, string | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe('leitura do formulário', () => {
  it('aceita currículo em texto', async () => {
    const request = await readAnalysisRequest(form({ vaga: JOB, curriculo: RESUME }));
    expect(request.resume).toEqual({ kind: 'text', text: RESUME.trim() });
    expect(request.job).toBe(JOB);
  });

  it('aceita currículo em PDF', async () => {
    const pdf = new File(['%PDF-1.7 conteúdo'], 'curriculo.pdf', { type: 'application/pdf' });
    const request = await readAnalysisRequest(form({ vaga: JOB, arquivo: pdf }));
    expect(request.resume.kind).toBe('pdf');
  });

  it('recusa arquivo que não é PDF', async () => {
    const fake = new File(['olá'], 'curriculo.pdf', { type: 'application/pdf' });
    await expect(readAnalysisRequest(form({ vaga: JOB, arquivo: fake }))).rejects.toMatchObject({ field: 'arquivo' });
  });

  it('recusa vaga curta demais', async () => {
    await expect(readAnalysisRequest(form({ vaga: 'Dev júnior', curriculo: RESUME }))).rejects.toMatchObject({
      field: 'vaga',
    });
  });

  it('pede o currículo quando ele não vem', async () => {
    const error = await readAnalysisRequest(form({ vaga: JOB })).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(InputError);
    expect((error as InputError).field).toBe('curriculo');
  });

  it('recusa currículo curto demais', async () => {
    await expect(readAnalysisRequest(form({ vaga: JOB, curriculo: 'Ana, dev.' }))).rejects.toMatchObject({
      field: 'curriculo',
    });
  });
});
