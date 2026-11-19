/**
 * Leitura e validação do formulário enviado para /api/analisar.
 * O currículo chega como PDF (campo "arquivo") ou como texto (campo "curriculo"); a vaga sempre como texto.
 */
import type { ResumeInput } from './gemini';
import { LIMITS } from './limits';

export { LIMITS };

export type InputField = 'curriculo' | 'arquivo' | 'vaga';

export class InputError extends Error {
  constructor(
    public readonly field: InputField,
    message: string,
  ) {
    super(message);
    this.name = 'InputError';
  }
}

export interface AnalysisRequest {
  resume: ResumeInput;
  job: string;
}

const text = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value.trim() : '');

export async function readAnalysisRequest(form: FormData): Promise<AnalysisRequest> {
  const job = text(form.get('vaga'));
  if (job.length < LIMITS.jobMin) {
    throw new InputError('vaga', 'Cole a descrição completa da vaga, com requisitos e atividades.');
  }
  if (job.length > LIMITS.jobMax) {
    throw new InputError('vaga', `A vaga passou do limite de ${LIMITS.jobMax.toLocaleString('pt-BR')} caracteres.`);
  }

  const file = form.get('arquivo');
  if (file && typeof file !== 'string' && file.size > 0) {
    if (file.size > LIMITS.pdfMaxBytes) {
      throw new InputError('arquivo', 'O PDF passou de 3 MB. Exporte uma versão mais leve ou cole o texto.');
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') {
      throw new InputError('arquivo', 'O arquivo enviado não é um PDF válido.');
    }
    return { resume: { kind: 'pdf', base64: bytes.toString('base64') }, job };
  }

  const resume = text(form.get('curriculo'));
  if (!resume) {
    throw new InputError('curriculo', 'Envie o currículo em PDF ou cole o texto dele.');
  }
  if (resume.length < LIMITS.resumeMin) {
    throw new InputError('curriculo', 'O texto do currículo está muito curto. Cole o currículo completo.');
  }
  if (resume.length > LIMITS.resumeMax) {
    throw new InputError(
      'curriculo',
      `O currículo passou do limite de ${LIMITS.resumeMax.toLocaleString('pt-BR')} caracteres.`,
    );
  }
  return { resume: { kind: 'text', text: resume }, job };
}
