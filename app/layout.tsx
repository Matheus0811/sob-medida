import type { Metadata } from 'next';
import { Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-sans-var', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif-var', display: 'swap' });

export const metadata: Metadata = {
  title: 'Sob Medida: seu currículo ajustado para cada vaga',
  description:
    'Compare seu currículo com uma vaga usando IA: nota de compatibilidade, o que falta, sugestões de reescrita e carta de apresentação.',
  openGraph: {
    title: 'Sob Medida',
    description: 'Compare seu currículo com uma vaga usando IA.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
