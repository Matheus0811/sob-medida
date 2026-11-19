'use client';

import { useId, useRef, useState, type DragEvent } from 'react';

import { LIMITS } from '@/lib/limits';

export type ResumeMode = 'pdf' | 'texto';

interface ResumeInputProps {
  mode: ResumeMode;
  onModeChange: (mode: ResumeMode) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onFileError: (message: string | null) => void;
  text: string;
  onTextChange: (text: string) => void;
  fileError?: string;
  textError?: string;
  disabled?: boolean;
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ResumeInput(props: ResumeInputProps) {
  const { mode, onModeChange, file, onFileChange, onFileError, text, onTextChange, fileError, textError, disabled } =
    props;
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  /**
   * Copia o PDF para a memória assim que ele é escolhido. Sem isso, o navegador só lê o arquivo
   * no envio e falha ("Failed to fetch") se ele mudar no disco nesse meio-tempo, o que é comum
   * em pastas sincronizadas com OneDrive ou Google Drive.
   */
  async function pickFile(candidate: File | undefined) {
    if (!candidate) return;
    const isPdf = candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      onFileChange(null);
      onFileError('Escolha um arquivo em PDF. Se o currículo estiver em Word, salve como PDF ou cole o texto.');
      return;
    }
    if (candidate.size > LIMITS.pdfMaxBytes) {
      onFileChange(null);
      onFileError('O PDF passou de 3 MB. Exporte uma versão mais leve ou cole o texto.');
      return;
    }
    try {
      const bytes = await candidate.arrayBuffer();
      onFileChange(new File([bytes], candidate.name, { type: 'application/pdf' }));
      onFileError(null);
    } catch {
      onFileChange(null);
      onFileError(
        'Não consegui ler esse arquivo. Se ele estiver no OneDrive ou Google Drive, copie para a Área de Trabalho e escolha de novo.',
      );
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) void pickFile(event.dataTransfer.files[0]);
  }

  const tabClass = (active: boolean) =>
    `rounded px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? 'bg-tinta text-white' : 'text-grafite hover:text-tinta'
    }`;

  return (
    <div className="flex flex-col rounded-md border border-linha bg-folha p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Seu currículo</h2>
        <div role="group" aria-label="Como enviar o currículo" className="flex gap-1 rounded-md bg-papel p-1">
          <button
            type="button"
            className={tabClass(mode === 'pdf')}
            aria-pressed={mode === 'pdf'}
            onClick={() => onModeChange('pdf')}
            disabled={disabled}
          >
            Enviar PDF
          </button>
          <button
            type="button"
            className={tabClass(mode === 'texto')}
            aria-pressed={mode === 'texto'}
            onClick={() => onModeChange('texto')}
            disabled={disabled}
          >
            Colar texto
          </button>
        </div>
      </div>

      {mode === 'pdf' ? (
        <>
          <p className="mt-1 text-sm text-grafite">Arquivo PDF de até 3 MB.</p>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`mt-4 flex min-h-72 flex-1 flex-col items-center justify-center rounded border-2 border-dashed p-6 text-center transition-colors ${
              dragging ? 'border-azul bg-azul/5' : fileError ? 'border-lacuna/60' : 'border-linha'
            }`}
          >
            {file ? (
              <>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-10 text-azul" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                  <path d="M14 3v5h5M9 13h6M9 17h4" />
                </svg>
                <p className="mt-3 font-semibold break-all">{file.name}</p>
                <p className="text-sm text-grafite">{formatSize(file.size)}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    className="font-medium text-azul underline-offset-4 hover:underline"
                  >
                    Trocar arquivo
                  </button>
                  <button
                    type="button"
                    onClick={() => onFileChange(null)}
                    disabled={disabled}
                    className="font-medium text-grafite underline-offset-4 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold">Arraste o PDF para cá</p>
                <p className="mt-1 text-sm text-grafite">ou</p>
                <label
                  htmlFor={`${id}-arquivo`}
                  className="mt-2 cursor-pointer rounded-md border border-tinta px-4 py-2 text-sm font-semibold hover:bg-tinta hover:text-white has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-azul"
                >
                  Escolher arquivo
                </label>
              </>
            )}
            <input
              ref={inputRef}
              id={`${id}-arquivo`}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={disabled}
              aria-invalid={Boolean(fileError)}
              aria-describedby={fileError ? `${id}-arquivo-erro` : undefined}
              onChange={(event) => {
                const chosen = event.target.files?.[0];
                event.target.value = '';
                void pickFile(chosen);
              }}
            />
          </div>
          {fileError && (
            <p id={`${id}-arquivo-erro`} className="mt-2 text-sm font-medium text-lacuna">
              {fileError}
            </p>
          )}
        </>
      ) : (
        <>
          <label htmlFor={`${id}-texto`} className="mt-1 text-sm text-grafite">
            Cole o texto do currículo, de preferência sem CPF e endereço.
          </label>
          <textarea
            id={`${id}-texto`}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            maxLength={LIMITS.resumeMax}
            disabled={disabled}
            aria-invalid={Boolean(textError)}
            aria-describedby={textError ? `${id}-texto-erro` : undefined}
            placeholder="Nome, resumo, experiências, projetos, formação e habilidades…"
            className="mt-4 min-h-72 flex-1 resize-y rounded border border-linha bg-papel/50 p-3 text-[15px] leading-relaxed placeholder:text-grafite/70 aria-[invalid=true]:border-lacuna"
          />
          {textError && (
            <p id={`${id}-texto-erro`} className="mt-2 text-sm font-medium text-lacuna">
              {textError}
            </p>
          )}
        </>
      )}
    </div>
  );
}
