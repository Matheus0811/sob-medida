'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  'Lendo o seu currículo',
  'Separando os requisitos da vaga',
  'Comparando experiência e requisitos',
  'Escrevendo sugestões de reescrita',
  'Redigindo a carta de apresentação',
  'Revisando a análise',
];

export function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, STEPS.length - 1)), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-12 rounded-md border border-linha bg-folha p-6 sm:p-8">
      <p className="text-lg font-semibold" role="status">
        {STEPS[step]}…
      </p>
      <ol className="mt-5 space-y-2 text-sm">
        {STEPS.map((label, index) => (
          <li key={label} className={index <= step ? 'text-tinta' : 'text-grafite/60'}>
            <span aria-hidden="true" className="mr-2 inline-block w-4">
              {index < step ? '✓' : index === step ? '•' : ''}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-papel">
        <div
          className="h-full rounded-full bg-azul transition-[width] duration-[4500ms] ease-linear motion-reduce:transition-none"
          style={{ width: `${Math.round(((step + 1) / STEPS.length) * 92)}%` }}
        />
      </div>
    </div>
  );
}
