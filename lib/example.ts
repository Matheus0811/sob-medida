/**
 * Exemplo pronto, com pessoa e empresa fictícias. Aparece no botão "Ver um exemplo pronto"
 * e mostra o resultado sem gastar a cota da IA.
 */
import type { Analysis } from './analysis-schema';

export const EXAMPLE_RESUME = `ANA RIBEIRO
Desenvolvedora Front-end | São Paulo, SP | ana.ribeiro@exemplo.com | github.com/ana-ribeiro-dev

RESUMO
Estudante do último semestre de Análise e Desenvolvimento de Sistemas, com 1 ano de estágio em desenvolvimento web. Gosto de transformar layouts em páginas rápidas e fáceis de usar.

EXPERIÊNCIA
Estagiária de Desenvolvimento Web, Agência Pixel Norte (fev/2025 até hoje)
- Desenvolvi páginas de campanhas em HTML, CSS e JavaScript para clientes da agência.
- Ajudei a migrar o site institucional da agência para React.
- Corrigi problemas de layout em celulares e tablets.
- Participei das reuniões com o time de design para entender os protótipos no Figma.

PROJETOS
- Lista de tarefas: app em React com filtros e dados salvos no navegador (localStorage).
- Clima Agora: página que mostra a previsão do tempo usando a API pública do OpenWeather.
- Clone da página de assinatura de um streaming, feito com HTML e Sass.

FORMAÇÃO
Tecnologia em Análise e Desenvolvimento de Sistemas, Faculdade Horizonte (2023 a 2026)

HABILIDADES
HTML, CSS, Sass, JavaScript, React, Git e GitHub, Figma (básico), inglês intermediário`;

export const EXAMPLE_JOB = `Desenvolvedor(a) Front-end Júnior, Lumina Tecnologia

A Lumina é uma fintech que ajuda pequenos negócios a receber pagamentos. Buscamos uma pessoa desenvolvedora front-end júnior para o time do nosso app web de pagamentos.

O que você vai fazer
- Desenvolver telas do app web em React e TypeScript.
- Integrar as telas com nossas APIs REST.
- Trabalhar junto com o time de design para entregar interfaces acessíveis.
- Participar de code review e das cerimônias do time (Scrum).

Requisitos
- Experiência com React e TypeScript.
- Consumo de APIs REST.
- Git no dia a dia.
- Noções de acessibilidade na web.

Diferenciais
- Testes automatizados com Jest ou Testing Library.
- Next.js.
- Experiência em produtos financeiros.

Modelo de trabalho: híbrido em São Paulo.`;

export const EXAMPLE_ANALYSIS: Analysis = {
  cargo: 'Desenvolvedor(a) Front-end Júnior',
  empresa: 'Lumina Tecnologia',
  nota: 64,
  resumo:
    'Seu perfil tem a base certa para a vaga: React em um estágio real, HTML e CSS fortes e contato com o time de design. O que mais pesa contra é não ter TypeScript, um requisito obrigatório, e o currículo não mostrar o consumo de APIs que você já fez no projeto Clima Agora.',
  pontosFortes: [
    {
      titulo: 'React em um projeto real',
      detalhe: 'Você ajudou a migrar o site da agência para React, a principal tecnologia da vaga.',
    },
    {
      titulo: 'Layout responsivo bem feito',
      detalhe: 'A correção de layout em celulares e tablets combina com o foco da vaga em interfaces de qualidade.',
    },
    {
      titulo: 'Trabalho junto com design',
      detalhe: 'As reuniões com o time de design e o uso do Figma mostram que você já sabe transformar protótipos em telas.',
    },
    {
      titulo: 'Git no dia a dia',
      detalhe: 'Git e GitHub aparecem nas suas habilidades e são requisito da vaga.',
    },
  ],
  lacunas: [
    {
      titulo: 'TypeScript',
      detalhe: 'É requisito obrigatório e não aparece no currículo.',
      comoResolver:
        'Converta o projeto Lista de tarefas para TypeScript e cite isso no currículo; é um ajuste de poucos dias.',
    },
    {
      titulo: 'Consumo de APIs REST',
      detalhe: 'A vaga pede integração com APIs, e o currículo não usa esse termo.',
      comoResolver:
        'Você já fez isso no Clima Agora com a API do OpenWeather: escreva "consumo de API REST" na descrição do projeto.',
    },
    {
      titulo: 'Acessibilidade',
      detalhe: 'A vaga fala em interfaces acessíveis, e o currículo não menciona o tema.',
      comoResolver: 'Revise um dos seus projetos com o Lighthouse e cite as melhorias de acessibilidade que fizer.',
    },
    {
      titulo: 'Testes automatizados',
      detalhe: 'É um diferencial, mas ajuda a se destacar entre candidatos júnior.',
      comoResolver: 'Adicione alguns testes com Testing Library na Lista de tarefas.',
    },
  ],
  palavrasChave: {
    presentes: ['React', 'Git', 'HTML', 'CSS', 'Figma', 'design'],
    ausentes: ['TypeScript', 'APIs REST', 'acessibilidade', 'Scrum', 'code review', 'Jest', 'Testing Library', 'Next.js'],
  },
  sugestoes: [
    {
      secao: 'Experiência',
      antes: 'Ajudei a migrar o site institucional da agência para React.',
      depois:
        'Migrei [N] páginas do site institucional da agência para React, criando componentes reutilizados em [N] telas.',
      motivo: 'Mostra o tamanho da sua contribuição em React com números que você pode preencher.',
    },
    {
      secao: 'Projetos',
      antes: 'Clima Agora: página que mostra a previsão do tempo usando a API pública do OpenWeather.',
      depois:
        'Clima Agora: consumo de API REST (OpenWeather) com tratamento de erros e estados de carregamento, em JavaScript.',
      motivo: 'Usa o termo exato da vaga para uma experiência que você já tem.',
    },
    {
      secao: 'Experiência',
      antes: 'Corrigi problemas de layout em celulares e tablets.',
      depois:
        'Corrigi problemas de layout responsivo em celulares e tablets, reduzindo em [X%] as reclamações de clientes sobre a versão mobile.',
      motivo: 'Transforma uma tarefa em resultado, que é o que recrutadores procuram.',
    },
    {
      secao: 'Habilidades',
      antes: '',
      depois: 'TypeScript (em estudo, aplicado no projeto Lista de tarefas)',
      motivo: 'Depois de converter o projeto, deixa claro que você já começou a usar o requisito principal.',
    },
  ],
  carta: `Olá, equipe de recrutamento da Lumina Tecnologia,

Quero me candidatar à vaga de Desenvolvedora Front-end Júnior. Há um ano faço estágio em desenvolvimento web na Agência Pixel Norte, onde ajudei a migrar o site institucional para React e passei a cuidar do layout das páginas em celulares e tablets.

Gosto especialmente da parte em que design e código se encontram. Participo das conversas com o time de design para entender os protótipos no Figma e transformar cada tela em uma interface fiel e fácil de usar, que é o que vocês buscam para o app de pagamentos.

Também já integrei uma API REST no projeto Clima Agora e estou aprofundando TypeScript, aplicando a linguagem nos meus projetos pessoais. Fico animada com a ideia de ajudar pequenos negócios a receber pagamentos com mais facilidade.

Obrigada pela atenção. Vou gostar muito de conversar sobre como posso contribuir com o time.

Ana Ribeiro`,
};
