import { Asset, AssetType, Transaction, NewsArticle, MarketIndicator } from './types';

export const formatKz = (value: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace('AOA', 'Kz');
};

export const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    userId: 'mock-user-1',
    name: 'OT-NR-2026',
    typology: 'UP',
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
    typology: 'Obrigações',
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
    typology: 'Ações',
    type: AssetType.STOCK,
    purchaseDate: '2024-01-20',
    investedAmount: 500000,
    quantity: 25,
    interestRate: 0, 
    currentPriceUnit: 22000,
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    userId: 'mock-user-1',
    type: 'buy',
    assetName: 'OT-NR-2026',
    amount: 1500000,
    date: '15 Mai 2023',
  },
  {
    id: 't2',
    userId: 'mock-user-1',
    type: 'interest',
    assetName: 'OT-NR-2026',
    amount: 123750,
    date: '15 Nov 2023',
  },
  {
    id: 't3',
    userId: 'mock-user-1',
    type: 'buy',
    assetName: 'Sonangol 2027',
    amount: 800000,
    date: '10 Set 2023',
  },
];

export const MARKET_INDICATORS: MarketIndicator[] = [
  { name: 'LUIBOR O/N', value: '18.50%', change: 0.15, isPositive: true },
  { name: 'USD/AOA', value: '832.50', change: 0.05, isPositive: false },
  { name: 'EUR/AOA', value: '905.20', change: -0.12, isPositive: true },
  { name: 'PSI 20', value: '6,124.5', change: 1.2, isPositive: true },
  { name: 'BODIVA G.', value: '1,245.3', change: 0.45, isPositive: true },
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'BODIVA Regista Recorde de Negociação',
    source: 'Economia & Mercado',
    date: '2 Horas atrás',
    publishedAt: '2024-03-20',
    summary: 'O volume de negócios na Bolsa de Dívida e Valores de Angola atingiu um novo pico histórico, impulsionado pela alta procura de Obrigações do Tesouro.',
    content: `A Bolsa de Dívida e Valores de Angola (BODIVA) anunciou hoje que o volume de negociação no mês de Março superou todas as expectativas, registando um aumento de 25% em comparação com o período homólogo.`,
    category: 'Mercado',
    imageUrl: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Sonangol Prepara Nova Emissão',
    source: 'Jornal de Angola',
    date: '5 Horas atrás',
    publishedAt: '2024-03-19',
    summary: 'A petrolífera nacional planeia voltar ao mercado de capitais no próximo trimestre para financiar projectos de energias renováveis.',
    content: `A Sonangol E.P. está em fase avançada de preparação para uma nova oferta pública de subscrição de obrigações. Desta vez, os fundos angariados serão destinados especificamente à transição energética da empresa.`,
    category: 'Empresas',
    imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'CMC Aprova Novo Regulamento',
    source: 'Expansão',
    date: '1 Dia atrás',
    publishedAt: '2024-03-18',
    summary: 'As novas regras visam simplificar a criação de fundos imobiliários e mobiliários, atraindo mais gestoras para o mercado.',
    category: 'Regulação',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Inflação em Angola Desacelera',
    source: 'INE',
    date: '2 Dias atrás',
    publishedAt: '2024-03-17',
    summary: 'Dados do Instituto Nacional de Estatística mostram uma tendência de descida nos preços dos bens alimentares.',
    category: 'Global',
    imageUrl: 'https://images.unsplash.com/photo-1526304640152-d46464c5c713?q=80&w=1000&auto=format&fit=crop',
  },
];