/**
 * POST /api/analisar
 * Recebe o formulário (currículo em PDF ou texto + vaga), chama a IA e devolve a análise em JSON.
 */
import { NextResponse } from 'next/server';

import { AnalysisError, analyzeResume } from '@/lib/gemini';
import { createRateLimiter } from '@/lib/rate-limit';
import { InputError, readAnalysisRequest } from '@/lib/request';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Até 5 análises a cada 10 minutos por pessoa: protege a cota gratuita da IA.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

const STATUS_BY_CODE = { CONFIG: 500, QUOTA: 503, UNAVAILABLE: 503, BAD_OUTPUT: 502 } as const;

function errorResponse(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse(400, 'INVALID_FORM', 'Envie os dados como formulário (multipart/form-data).');
  }

  try {
    const input = await readAnalysisRequest(form);

    const rate = limiter.check(clientIp(request));
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT',
            message: `Você fez muitas análises seguidas. Tente de novo em ${minutes} minuto${minutes > 1 ? 's' : ''}.`,
          },
        },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    console.info(
      `[analisar] currículo em ${input.resume.kind === 'pdf' ? 'PDF' : 'texto'}, vaga com ${input.job.length} caracteres`,
    );
    const { analysis, model } = await analyzeResume(input.resume, input.job);
    return NextResponse.json({ analysis, model });
  } catch (error) {
    if (error instanceof InputError) {
      return errorResponse(422, 'VALIDATION_ERROR', error.message, { field: error.field });
    }
    if (error instanceof AnalysisError) {
      return errorResponse(STATUS_BY_CODE[error.code], error.code, error.message);
    }
    console.error('Erro inesperado em /api/analisar:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Algo deu errado do nosso lado. Tente de novo.');
  }
}
