/**
 * Mock data for the application
 */

export interface NewsItem {
  id: number;
  created_at: string;
  titulo: string;
  conteudo: string;
  imagem_url: string;
  autor: string;
}

export interface CultureItem {
  id: number;
  created_at: string;
  titulo: string;
  conteudo: string;
  imagem_url: string;
}

export interface ProgramItem {
  id: number;
  name: string;
  logoUrl: string;
  schedule: string;
  announcer: string;
}

export const MOCK_PROGRAMS: ProgramItem[] = [
  {
    id: 1,
    name: "Bom Dia Difusora",
    logoUrl: "https://picsum.photos/seed/prog1/200/200",
    schedule: "Segunda a Sexta, 05:00 - 08:00",
    announcer: "João Silva"
  },
  {
    id: 2,
    name: "Manhã Total",
    logoUrl: "https://picsum.photos/seed/prog2/200/200",
    schedule: "Segunda a Sexta, 08:00 - 12:00",
    announcer: "Maria Oliveira"
  },
  {
    id: 3,
    name: "Tarde Show",
    logoUrl: "https://picsum.photos/seed/prog3/200/200",
    schedule: "Segunda a Sexta, 13:00 - 17:00",
    announcer: "Carlos Mendes"
  },
  {
    id: 4,
    name: "A Voz do Brasil",
    logoUrl: "https://picsum.photos/seed/prog4/200/200",
    schedule: "Segunda a Sexta, 19:00 - 20:00",
    announcer: "Governo Federal"
  },
  {
    id: 5,
    name: "Noite de Sucessos",
    logoUrl: "https://picsum.photos/seed/prog5/200/200",
    schedule: "Segunda a Sexta, 20:00 - 00:00",
    announcer: "Ana Paula"
  },
  {
    id: 6,
    name: "Sabadão Sertanejo",
    logoUrl: "https://picsum.photos/seed/prog6/200/200",
    schedule: "Sábado, 08:00 - 12:00",
    announcer: "Pedro Paulo"
  }
];

export const MOCK_CULTURE: CultureItem[] = [
  {
    id: -1,
    created_at: new Date().toISOString(),
    titulo: "Cinema na Praça: Clássicos do rádio",
    conteudo: "Uma seleção especial de filmes que contam a história das grandes emissoras de rádio do mundo será exibida gratuitamente.",
    imagem_url: "https://picsum.photos/seed/cinema1/800/400"
  },
  {
    id: -2,
    created_at: new Date().toISOString(),
    titulo: "Exposição de Rádios Antigos",
    conteudo: "Venha conhecer a evolução tecnológica da comunicação em uma exposição que reúne mais de 50 aparelhos históricos.",
    imagem_url: "https://picsum.photos/seed/radiohist/800/400"
  },
  {
    id: -3,
    created_at: new Date().toISOString(),
    titulo: "Festival de Gastronomia Local",
    conteudo: "Sabores da nossa terra em um evento imperdível com os melhores chefs da região e música ao vivo.",
    imagem_url: "https://picsum.photos/seed/food1/800/400"
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: -1,
    created_at: new Date().toISOString(),
    titulo: "Difusora 104.3 FM lidera audiência no horário nobre em Colatina",
    conteudo: "Pesquisa recente confirma a preferência dos ouvintes pela nossa programação eclética e jornalismo de credibilidade. Agradecemos a cada um de vocês pela companhia diária!",
    imagem_url: "https://picsum.photos/seed/radio1/800/400",
    autor: "Redação Difusora"
  },
  {
    id: -2,
    created_at: new Date().toISOString(),
    titulo: "Grande show nacional confirmado para o aniversário da cidade",
    conteudo: "A prefeitura anunciou hoje a atração principal para as festividades do próximo mês. O evento gratuito promete atrair turistas de todo o estado para a nossa Beira Rio.",
    imagem_url: "https://picsum.photos/seed/music1/800/400",
    autor: "Cultura"
  },
  {
    id: -3,
    created_at: new Date().toISOString(),
    titulo: "Entrevista: Os desafios da saúde pública na região noroeste",
    conteudo: "Conversamos com especialistas sobre as novas metas de atendimento e a modernização dos hospitais locais. Confira a entrevista completa em nosso podcast.",
    imagem_url: "https://picsum.photos/seed/health1/800/400",
    autor: "Saúde"
  },
  {
    id: -4,
    created_at: new Date().toISOString(),
    titulo: "Esporte: Colatina F.C. se prepara para o clássico do final de semana",
    conteudo: "O time intensifica os treinos para o confronto decisivo. A torcida promete lotar o estádio para apoiar os jogadores rumo à vitória no campeonato estadual.",
    imagem_url: "https://picsum.photos/seed/soccer1/800/400",
    autor: "Esportes"
  },
  {
    id: -5,
    created_at: new Date().toISOString(),
    titulo: "Previsão do tempo: Frente fria chega ao Espírito Santo nos próximos dias",
    conteudo: "Prepare o agasalho! A temperatura deve cair consideravelmente a partir de quinta-feira. A Defesa Civil alerta para possíveis ventos fortes em áreas isoladas.",
    imagem_url: "https://picsum.photos/seed/weather1/800/400",
    autor: "Previsão"
  },
  {
    id: -6,
    created_at: new Date().toISOString(),
    titulo: "Cultura: Exposição de arte local abre as portas no Centro Cultural",
    conteudo: "Artistas colatinenses apresentam obras que retratam a beleza do Rio Doce e o cotidiano da nossa gente. A entrada é franca e a mostra segue até o fim do mês.",
    imagem_url: "https://picsum.photos/seed/art1/800/400",
    autor: "Cultura"
  }
];
