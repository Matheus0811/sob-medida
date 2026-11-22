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
    'Seu perfil tem a base certa para a vaga: React em um estágio real, experiência com HTML e CSS e contato com o time de design. O que mais pesa contra é não ter TypeScript, um requisito obrigatório, e o currículo não mostrar o consumo de APIs que você já fez no projeto Clima Agora.',
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
      detalhe: 'As reuniões com o time de design para entender os protótipos no Figma mostram que você já trabalha perto de quem desenha as telas.',
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
        'Contribuí para a migração do site institucional da agência para React, cuidando de [páginas ou componentes que você migrou].',
      motivo: 'Mantém o seu papel real e mostra o tamanho da sua parte em React, a principal tecnologia da vaga.',
    },
    {
      secao: 'Projetos',
      antes: 'Clima Agora: página que mostra a previsão do tempo usando a API pública do OpenWeather.',
      depois: 'Clima Agora: página de previsão do tempo com consumo de API REST pública (OpenWeather).',
      motivo: 'Usa o termo exato da vaga para uma experiência que você já tem.',
    },
    {
      secao: 'Experiência',
      antes: 'Corrigi problemas de layout em celulares e tablets.',
      depois: 'Corrigi problemas de layout responsivo em celulares e tablets em [N] páginas.',
      motivo: '"Responsivo" é o termo que recrutadores buscam, e o número mostra o volume do seu trabalho.',
    },
    {
      secao: 'Habilidades',
      antes: 'HTML, CSS, Sass, JavaScript, React, Git e GitHub, Figma (básico), inglês intermediário',
      depois:
        'HTML, CSS, Sass, JavaScript, React, consumo de APIs REST, layout responsivo, Git e GitHub, Figma (básico), inglês intermediário',
      motivo: 'Coloca na lista duas coisas que você já fez nos projetos e no estágio e que a vaga pede.',
    },
  ],
  carta: `Olá, equipe de recrutamento da Lumina Tecnologia,

Quero me candidatar à vaga de Desenvolvedora Front-end Júnior. Estou no último semestre de Análise e Desenvolvimento de Sistemas e há um ano faço estágio em desenvolvimento web na Agência Pixel Norte, onde desenvolvi páginas de campanhas em HTML, CSS e JavaScript e ajudei a migrar o site institucional para React.

No estágio também corrigi problemas de layout em celulares e tablets e participo das reuniões com o time de design para entender os protótipos no Figma. É esse trabalho perto do design que a vaga descreve para o app de pagamentos.

Fora do estágio, fiz o Clima Agora, que usa a API pública do OpenWeather, e uma lista de tarefas em React com filtros e dados salvos no navegador.

Obrigada pela atenção. Vou gostar de conversar sobre a vaga.

Ana Ribeiro`,
};
