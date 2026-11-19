'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import type { Analysis } from '@/lib/analysis-schema';
import { EXAMPLE_ANALYSIS, EXAMPLE_JOB, EXAMPLE_RESUME } from '@/lib/example';
import { LIMITS } from '@/lib/limits';

import { LoadingState } from './LoadingState';
import { ResumeInput, type ResumeMode } from './ResumeInput';
import { Results } from './Results';

type Field = 'curriculo' | 'arquivo' | 'vaga';

interface ApiError {
  code: string;
  message: string;
  field?: Field;
}

interface ResultState {
  analysis: Analysis;
  model: string | null;
  isExample: boolean;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

/** Validação rápida no navegador, com as mesmas regras do servidor. */
function validate(mode: ResumeMode, file: File | null, resumeText: string, jobText: string): ApiError | null {
  if (mode === 'pdf') {
    if (!file) return { code: 'VALIDATION_ERROR', field: 'arquivo', message: 'Escolha o PDF do seu currículo.' };
    if (file.size > LIMITS.pdfMaxBytes) {
      return { code: 'VALIDATION_ERROR', field: 'arquivo', message: 'O PDF passou de 3 MB. Cole o texto do currículo.' };
    }
  } else if (resumeText.trim().length < LIMITS.resumeMin) {
    return {
      code: 'VALIDATION_ERROR',
      field: 'curriculo',
      message: 'Cole o texto completo do currículo (está muito curto).',
    };
  }
  if (jobText.trim().length < LIMITS.jobMin) {
    return {
      code: 'VALIDATION_ERROR',
      field: 'vaga',
      message: 'Cole a descrição completa da vaga, com requisitos e atividades.',
    };
  }
  return null;
}

export function Analyzer() {
  const [mode, setMode] = useState<ResumeMode>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Leva a pessoa até o resultado (ou ao erro) quando ele aparece.
  useEffect(() => {
    if (status === 'done' || status === 'loading') {
      outputRef.current?.scrollIntoView({ block: 'start' });
    }
    if (status === 'done') outputRef.current?.focus({ preventScroll: true });
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validate(mode, file, resumeText, jobText);
    if (problem) {
      setError(problem);
      setStatus('error');
      return;
    }

    const body = new FormData();
    body.set('vaga', jobText);
    if (mode === 'pdf' && file) body.set('arquivo', file);
    else body.set('curriculo', resumeText);

    setError(null);
    setStatus('loading');
    try {
      // O servidor tenta até dois modelos de 45 s cada; passou disso, algo travou no caminho.
      const response = await fetch('/api/analisar', { method: 'POST', body, signal: AbortSignal.timeout(110_000) });
      const data = (await response.json().catch(() => null)) as
        | { analysis?: Analysis; model?: string; error?: ApiError }
        | null;
      if (!response.ok || !data?.analysis) {
        setError(
          data?.error ?? {
            code: 'NETWORK',
            message: 'A análise demorou demais ou a conexão caiu. Tente de novo em instantes.',
          },
        );
        setStatus('error');
        return;
      }
      setResult({ analysis: data.analysis, model: data.model ?? null, isExample: false });
      setStatus('done');
    } catch (problem) {
      console.error('Falha ao chamar /api/analisar:', problem);
      const timedOut = problem instanceof DOMException && problem.name === 'TimeoutError';
      setError({
        code: 'NETWORK',
        message: timedOut
          ? 'A análise demorou demais para responder. Tente de novo em instantes.'
          : 'A conexão com o servidor caiu durante a análise. Tente de novo em instantes.',
      });
      setStatus('error');
    }
  }

  function showExample() {
    setMode('texto');
    setFile(null);
    setResumeText(EXAMPLE_RESUME);
    setJobText(EXAMPLE_JOB);
    setError(null);
    setResult({ analysis: EXAMPLE_ANALYSIS, model: null, isExample: true });
    setStatus('done');
  }

  const loading = status === 'loading';
  const fieldError = (field: Field) => (error?.field === field ? error.message : undefined);

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
        <div className="grid gap-5 lg:grid-cols-2">
          <ResumeInput
            mode={mode}
            onModeChange={setMode}
            file={file}
            onFileChange={setFile}
            onFileError={(message) => {
              if (message) {
                setError({ code: 'VALIDATION_ERROR', field: 'arquivo', message });
                setStatus('error');
              } else if (error?.field === 'arquivo') {
                setError(null);
                setStatus('idle');
              }
            }}
            text={resumeText}
            onTextChange={setResumeText}
            fileError={fieldError('arquivo')}
            textError={fieldError('curriculo')}
            disabled={loading}
          />

          <div className="flex flex-col rounded-md border border-linha bg-folha p-5 sm:p-6">
            <label htmlFor="vaga" className="text-lg font-bold">
              A vaga
            </label>
            <p id="vaga-ajuda" className="mt-1 text-sm text-grafite">
              Cole o anúncio inteiro, com atividades, requisitos e diferenciais.
            </p>
            <textarea
              id="vaga"
              name="vaga"
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              maxLength={LIMITS.jobMax}
              disabled={loading}
              aria-describedby={fieldError('vaga') ? 'vaga-ajuda vaga-erro' : 'vaga-ajuda'}
              aria-invalid={Boolean(fieldError('vaga'))}
              placeholder="Ex.: Desenvolvedor(a) Front-end Júnior. Requisitos: React, TypeScript..."
              className="mt-4 min-h-72 flex-1 resize-y rounded border border-linha bg-papel/50 p-3 text-[15px] leading-relaxed placeholder:text-grafite/70 aria-[invalid=true]:border-lacuna"
            />
            {fieldError('vaga') && (
              <p id="vaga-erro" className="mt-2 text-sm font-medium text-lacuna">
                {fieldError('vaga')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-azul px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-azul-escuro disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? 'Analisando…' : 'Analisar compatibilidade'}
          </button>
          <button
            type="button"
            onClick={showExample}
            disabled={loading}
            className="rounded-md px-2 py-3 text-base font-medium text-azul underline-offset-4 hover:underline disabled:opacity-50"
          >
            Ver um exemplo pronto
          </button>
        </div>
        <p className="mt-3 text-sm text-grafite">
          Grátis e sem cadastro. A análise leva de 10 a 30 segundos.
        </p>
      </form>

      <div ref={outputRef} tabIndex={-1} className="scroll-mt-6 outline-none" aria-live="polite">
        {loading && <LoadingState />}

        {status === 'error' && error && !error.field && (
          <div role="alert" className="mt-10 rounded-md border border-lacuna/40 bg-folha p-5">
            <p className="font-semibold text-lacuna">Não deu para analisar agora</p>
            <p className="mt-1 text-grafite">{error.message}</p>
            {(error.code === 'QUOTA' || error.code === 'RATE_LIMIT') && (
              <button
                type="button"
                onClick={showExample}
                className="mt-3 font-medium text-azul underline-offset-4 hover:underline"
              >
                Ver o exemplo pronto enquanto isso
              </button>
            )}
          </div>
        )}

        {status === 'done' && result && (
          <Results analysis={result.analysis} model={result.model} isExample={result.isExample} />
        )}
      </div>
    </div>
  );
}
