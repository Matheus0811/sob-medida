import { Analyzer } from '@/components/Analyzer';

const GITHUB_URL = 'https://github.com/Matheus0811/sob-medida';

export default function Home() {
  return (
    <>
      <header className="border-b border-linha bg-folha">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="text-lg font-bold tracking-tight">
            Sob <span className="marca-texto">Medida</span>
          </a>
          <nav className="flex gap-5 text-sm text-grafite">
            <a href="#como-funciona" className="hover:text-tinta">
              Como funciona
            </a>
            <a href={GITHUB_URL} className="hover:text-tinta" target="_blank" rel="noreferrer">
              Código no GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="max-w-3xl py-12 sm:py-16">
          <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl">
            Seu currículo, ajustado para cada vaga.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-grafite">
            Envie seu currículo e cole a descrição da vaga. A IA mostra o quanto você combina, o que está faltando,
            como reescrever trechos do currículo e ainda escreve uma carta de apresentação.
          </p>
        </section>

        <Analyzer />

        <section id="como-funciona" className="mt-24 grid gap-10 border-t border-linha pt-12 md:grid-cols-[1fr_2fr]">
          <h2 className="text-2xl font-bold tracking-tight">Como funciona</h2>
          <div className="space-y-5 leading-relaxed text-grafite">
            <p>
              O currículo e a vaga vão juntos para o Google Gemini em uma única chamada. A IA responde num formato
              fixo (nota, pontos fortes, lacunas, palavras-chave, sugestões e carta), e o servidor confere cada campo
              antes de mostrar o resultado.
            </p>
            <p>
              As instruções pedem uma nota calibrada, proíbem inventar experiências e mandam ignorar qualquer
              comando escondido dentro do currículo ou da vaga. Mesmo assim, é uma análise feita por IA: revise as
              sugestões antes de usar.
            </p>
            <p>
              Nada fica guardado aqui: o texto é usado só para gerar a análise. Como o site usa o plano gratuito do
              Gemini, o Google pode usar o conteúdo enviado para melhorar os produtos dele, então evite dados sensíveis
              como CPF e endereço completo.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-linha bg-folha">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-grafite sm:flex-row sm:justify-between">
          <p>
            Feito por{' '}
            <a
              href="https://www.linkedin.com/in/matheus-galvao"
              className="font-medium text-tinta underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Matheus Galvão
            </a>
            , com Next.js e Google Gemini.
          </p>
          <a href={GITHUB_URL} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
            Ver o código-fonte
          </a>
        </div>
      </footer>
    </>
  );
}
