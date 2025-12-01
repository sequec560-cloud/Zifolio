import { Asset, AssetType, Transaction, NewsArticle, MarketIndicator } from './types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    userId: 'mock-user-1',
    name: 'OT-NR-2026',
    type: AssetType.OT,
    purchaseDate: '2023-05-15',
    investedAmount: 1500000,
    quantity: 15,
    interestRate: 16.5,
    currentPriceUnit: 112000,
  },
  {
    id: '2',
    userId: 'mock-user-1',
    name: 'Sonangol 2027',
    type: AssetType.CORP,
    purchaseDate: '2023-09-10',
    investedAmount: 800000,
    quantity: 80,
    interestRate: 14.0,
    currentPriceUnit: 10500,
  },
  {
    id: '3',
    userId: 'mock-user-1',
    name: 'BAI Ações',
    type: AssetType.STOCK,
    purchaseDate: '2024-01-20',
    investedAmount: 500000,
    quantity: 25,
    interestRate: 0, // Stocks don't have fixed interest
    currentPriceUnit: 24500,
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'buy', assetName: 'BAI Ações', amount: 500000, date: '2024-01-20' },
  { id: 't2', type: 'interest', assetName: 'OT-NR-2026', amount: 123750, date: '2023-11-15' },
  { id: 't3', type: 'buy', assetName: 'Sonangol 2027', amount: 800000, date: '2023-09-10' },
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'BODIVA regista recorde de negociações em Outubro',
    source: 'Expansão',
    date: '2 Horas atrás',
    publishedAt: '2024-11-15',
    summary: 'O mercado de dívida pública secundário movimentou mais de 50 mil milhões de Kz, impulsionado pela procura de OTs indexadas.',
    content: `A Bolsa de Dívida e Valores de Angola (BODIVA) registou um volume recorde de negociações no mês de Outubro, superando os 50 mil milhões de Kwanzas em transações no mercado secundário. Este crescimento expressivo foi impulsionado principalmente pela elevada procura de Obrigações do Tesouro (OTs) indexadas ao dólar, numa altura em que os investidores procuram refúgio contra a volatilidade cambial.

Segundo o relatório mensal da instituição, o segmento de dívida pública continua a dominar as operações, representando cerca de 95% do volume total transacionado. "Observamos uma entrada significativa de investidores particulares, que começam a ver na BODIVA uma alternativa real aos depósitos a prazo tradicionais", refere o analista sénior da consultora MarketWatch Angola.

O aumento da literacia financeira e a digitalização dos processos de intermediação através de plataformas das corretoras têm sido catalisadores importantes para este dinamismo. Espera-se que a tendência de alta se mantenha até ao final do ano, com a previsão de novas emissões de dívida corporativa.`,
    category: 'Mercado',
    imageUrl: 'https://picsum.photos/seed/bodiva/800/400'
  },
  {
    id: 'n2',
    title: 'BNA mantém taxas de juro inalteradas',
    source: 'Jornal de Angola',
    date: '1 Dia atrás',
    publishedAt: '2024-11-14',
    summary: 'O Comité de Política Monetária do Banco Nacional de Angola decidiu manter a taxa BNA em 19.5% para controlar a inflação.',
    content: `O Comité de Política Monetária (CPM) do Banco Nacional de Angola (BNA) decidiu, na sua última reunião ordinária, manter a Taxa BNA em 19,5%. A decisão visa consolidar a trajectória de desaceleração da inflação e garantir a estabilidade de preços na economia nacional.

Em comunicado, o Governador do BNA destacou que, apesar da ligeira pressão sobre a taxa de câmbio nas últimas semanas, os fundamentos macroeconómicos permanecem sólidos. "A política monetária restritiva tem surtido os efeitos desejados na contenção da liquidez excedentária", afirmou.

Para além da Taxa BNA, foram também mantidas as taxas de juro da Facilidade Permanente de Cedência de Liquidez em 20,5% e da Facilidade Permanente de Absorção de Liquidez em 18,5%. Analistas de mercado previam esta manutenção, dado o contexto actual de incerteza nos preços globais das commodities e a necessidade de proteger o Kwanza.`,
    category: 'Regulação',
    imageUrl: 'https://picsum.photos/seed/bna/800/400'
  },
  {
    id: 'n3',
    title: 'Sonangol prepara nova emissão de obrigações',
    source: 'Economia & Mercado',
    date: '2 Dias atrás',
    publishedAt: '2024-11-13',
    summary: 'A petrolífera nacional anunciou planos para voltar à bolsa em 2025 com uma oferta pública de obrigações verdes.',
    content: `A Sonangol E.P. está a preparar o regresso ao mercado de capitais com uma nova emissão obrigacionista prevista para o primeiro trimestre de 2025. Desta vez, a petrolífera nacional pretende lançar "Obrigações Verdes" (Green Bonds), destinadas a financiar projectos de transição energética e sustentabilidade, nomeadamente a construção de centrais solares no sul do país.

Fontes próximas ao processo indicam que a operação poderá rondar os 75 mil milhões de Kwanzas, com maturidades entre 5 a 7 anos. Esta iniciativa alinha-se com a estratégia da empresa de diversificar as suas fontes de financiamento e reduzir a sua pegada de carbono.

A primeira emissão da Sonangol na BODIVA, realizada em 2023, foi um sucesso histórico, com a procura a superar a oferta em mais de 140%. A expectativa do mercado para esta nova tranche é elevada, especialmente entre investidores institucionais e fundos de pensões que procuram ativos com critérios ESG (Environmental, Social, and Governance).`,
    category: 'Empresas',
    imageUrl: 'https://picsum.photos/seed/sonangol/800/400'
  },
  {
    id: 'n4',
    title: 'Preço do Brent sobe e beneficia exportações',
    source: 'Bloomberg AO',
    date: '3 Dias atrás',
    publishedAt: '2024-11-12',
    summary: 'A cotação do barril de petróleo atingiu os 85 USD, melhorando as perspectivas fiscais para o próximo trimestre.',
    content: `O preço do barril de petróleo Brent, referência para as exportações angolanas, registou uma subida acentuada esta semana, fixando-se acima dos 85 USD. A valorização é impulsionada pelos cortes de produção anunciados pela OPEP+ e pelo aumento da procura na Ásia, à medida que a economia chinesa dá sinais de recuperação industrial.

Para Angola, esta subida representa um alívio significativo para as contas públicas. Com o Orçamento Geral do Estado (OGE) para 2024 projectado com um preço de referência conservador de 65 USD, a actual cotação gera um diferencial positivo que poderá ser utilizado para amortizar dívida externa ou reforçar as Reservas Internacionais Líquidas (RIL).

Economistas alertam, no entanto, que a volatilidade permanece alta devido às tensões geopolíticas no Médio Oriente. "É crucial que este excedente seja gerido com prudência, evitando o aumento da despesa corrente", adverte Carlos Rosado, consultor económico.`,
    category: 'Global',
    imageUrl: 'https://picsum.photos/seed/oil/800/400'
  }
];

export const MARKET_INDICATORS: MarketIndicator[] = [
  { name: 'USD/AOA', value: '895.50', change: 0.15, isPositive: false },
  { name: 'EUR/AOA', value: '965.20', change: -0.05, isPositive: true },
  { name: 'LUIBOR O/N', value: '18.5%', change: 0.00, isPositive: true },
  { name: 'Brent', value: '$85.40', change: 1.2, isPositive: true },
  { name: 'PSI-20', value: '6,230', change: -0.4, isPositive: false },
];

// Helper to format currency in Angolan Kwanza
export const formatKz = (amount: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};