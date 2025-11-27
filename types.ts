export enum AssetType {
  OT = 'Obrigações do Tesouro',
  BT = 'Bilhetes do Tesouro',
  CORP = 'Obrigações Corporativas',
  STOCK = 'Ações',
}

export interface Asset {
  id: string;
  name: string; // e.g., "OT-NR-2025"
  type: AssetType;
  purchaseDate: string;
  investedAmount: number; // In AKZ
  quantity: number;
  interestRate: number; // Annual %
  currentPriceUnit: number; // Current market price per unit
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  profitabilityPercentage: number;
  monthlyGrowth: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'interest';
  assetName: string;
  amount: number;
  date: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  content?: string;
  category: 'Mercado' | 'Empresas' | 'Regulação' | 'Global';
  imageUrl: string;
  url?: string;
}

export interface MarketIndicator {
  name: string;
  value: string;
  change: number; // Percentage change
  isPositive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored locally for MVP demo purposes only
  phone?: string;
  plan?: 'Free' | 'Premium';
  createdAt: string;
}

export type ViewState = 'login' | 'dashboard' | 'assets' | 'simulator' | 'profile' | 'news' | 'news-detail';