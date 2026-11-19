'use client';

import type { Analysis } from '@/lib/analysis-schema';
import { MATCH_LABELS, matchLevel } from '@/lib/match';

import { CopyButton } from './CopyButton';

interface ResultsProps {
  analysis: Analysis;
  model: string | null;
  isExample: boolean;
}

const BANDS = [
  { from: 0, to: 45, label: 'Baixa' },
  { from: 45, to: 70, label: 'Parcial' },
  { from: 70, to: 85, label: 'Boa' },
  { from: 85, to: 100, label: 'Alta' },
];

function ScoreMeter({ score }: { score: number }) {
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="relative">
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {BANDS.map((band, index) => (
            <div
              key={band.label}
              style={{ width: `${band.to - band.from}%` }}
              className={['bg-linha', 'bg-[#c9d2de]', 'bg-[#9fb0c9]', 'bg-tinta'][index]}
            />
          ))}
        </div>
        <div
          className="absolute -top-1.5 h-5.5 w-1 -translate-x-1/2 rounded-full bg-marca ring-2 ring-tinta"
          style={{ left: `${score}%` }}
        />
      </div>
      <div className="mt-2 flex text-xs text-grafite">
        {BANDS.map((band) => (
          <span key={band.label} style={{ width: `${band.to - band.from}%` }}>
            {band.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function downloadLetter(text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'carta-de-apresentacao.txt';
  link.click();
  URL.revokeObjectURL(url);
}

export function Results({ analysis, model, isExample }: ResultsProps) {
  const level = matchLevel(analysis.nota);
  const job = [analysis.cargo, analysis.empresa].filter(Boolean).join(', em ');
  const { presentes, ausentes } = analysis.palavrasChave;

  return (
    <article className="mt-12" aria-labelledby="resultado-titulo">
      {isExample && (
        <p className="mb-6 rounded-md bg-marca/40 px-4 py-3 text-sm">
          Este é um exemplo pronto, com uma candidata e uma vaga fictícias. Ele não usa a IA. Para analisar o seu
          currículo, troque os textos acima e clique em Analisar compatibilidade.
        </p>
      )}

      <section className="grid gap-8 rounded-md border border-linha bg-folha p-6 sm:p-10 md:grid-cols-[auto_1fr] md:gap-14">
        <div className="flex items-baseline gap-3 md:block">
          <p className="text-[clamp(5.5rem,16vw,9.5rem)] leading-[0.85] font-bold tracking-tighter tabular-nums">
            <span className="marca-texto marca-animada px-1">{analysis.nota}</span>
          </p>
          <p className="text-lg text-grafite md:mt-3">de 100</p>
        </div>
        <div>
          <h2 id="resultado-titulo" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {MATCH_LABELS[level]}
          </h2>
          {job && <p className="mt-1 text-grafite">Vaga: {job}</p>}
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed">{analysis.resumo}</p>
          <ScoreMeter score={analysis.nota} />
        </div>
      </section>

      {(analysis.pontosFortes.length > 0 || analysis.lacunas.length > 0) && (
        <section className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight">O que já combina</h2>
            <ul className="mt-4 space-y-4">
              {analysis.pontosFortes.map((item, index) => (
                <li key={`${item.titulo}-${index}`} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-verde">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold">{item.titulo}</p>
                    <p className="mt-0.5 leading-relaxed text-grafite">{item.detalhe}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">O que falta</h2>
            {analysis.lacunas.length === 0 ? (
              <p className="mt-4 text-grafite">Nenhuma lacuna importante encontrada.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {analysis.lacunas.map((item, index) => (
                  <li key={`${item.titulo}-${index}`} className="border-l-2 border-lacuna/70 pl-4">
                    <p className="font-semibold">{item.titulo}</p>
                    <p className="mt-0.5 leading-relaxed text-grafite">{item.detalhe}</p>
                    <p className="mt-1.5 leading-relaxed">
                      <span className="font-medium">Como resolver: </span>
                      {item.comoResolver}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {(presentes.length > 0 || ausentes.length > 0) && (
        <section className="mt-12 border-t border-linha pt-10">
          <h2 className="text-xl font-bold tracking-tight">Palavras-chave da vaga</h2>
          <p className="mt-1 text-grafite">
            Sistemas de recrutamento costumam filtrar currículos por esses termos.
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Já estão no seu currículo</h3>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2.5">
                {presentes.map((term) => (
                  <li key={term} className="marca-texto px-0.5 font-medium">
                    {term}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Faltam no seu currículo</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ausentes.map((term) => (
                  <li key={term} className="rounded border border-dashed border-grafite/60 px-2 py-0.5 text-grafite">
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {analysis.sugestoes.length > 0 && (
        <section className="mt-12 border-t border-linha pt-10">
          <h2 className="text-xl font-bold tracking-tight">Sugestões para o currículo</h2>
          <p className="mt-1 text-grafite">
            Os trechos entre colchetes, como [X%], são números que só você sabe: preencha antes de usar.
          </p>
          <ul className="mt-6 space-y-5">
            {analysis.sugestoes.map((item, index) => (
              <li key={`${item.secao}-${index}`} className="rounded-md border border-linha bg-folha p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-grafite">{item.secao}</p>
                  <CopyButton text={item.depois} />
                </div>
                {item.antes && (
                  <p className="mt-3 leading-relaxed text-grafite line-through decoration-grafite/50">{item.antes}</p>
                )}
                <p className="mt-2 text-[17px] leading-relaxed font-medium">
                  {item.antes ? '' : 'Acrescentar: '}
                  {item.depois}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-grafite">{item.motivo}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {analysis.carta && (
        <section className="mt-12 border-t border-linha pt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">Carta de apresentação</h2>
            <div className="flex gap-2">
              <CopyButton text={analysis.carta} label="Copiar carta" />
              <button
                type="button"
                onClick={() => downloadLetter(analysis.carta)}
                className="rounded border border-linha px-3 py-1.5 text-sm font-medium transition-colors hover:border-tinta"
              >
                Baixar .txt
              </button>
            </div>
          </div>
          <div className="mt-6 max-w-3xl rounded-sm bg-folha px-6 py-8 shadow-[0_1px_0_#d2d8e0,0_12px_32px_-18px_rgba(14,26,43,0.35)] sm:px-12 sm:py-12">
            {analysis.carta.split(/\n\s*\n/).map((paragraph, index) => (
              <p key={index} className="mb-4 font-serif text-[17px] leading-[1.75] whitespace-pre-line last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-sm text-grafite">
        {isExample
          ? 'Exemplo escrito previamente para mostrar o formato do resultado.'
          : `Análise gerada por IA${model ? ` (${model})` : ''}. Revise tudo antes de usar no seu currículo.`}
      </p>
    </article>
  );
}
