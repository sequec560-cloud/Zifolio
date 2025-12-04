export enum AssetType {
  OT = 'Obrigações do Tesouro',
  BT = 'Bilhetes do Tesouro',
  CORP = 'Obrigações Corporativas',
  STOCK = 'Ações',
}

export interface Asset {
  id: string;
  userId: string;
  name: string; // Ticker/Code
  typology: string; // e.g., "UP", "Obrigações", "Ações"
  type: AssetType;
  purchaseDate: string;
  investedAmount: number;
  quantity: number;
  interestRate: number;
  currentPriceUnit: number;
}

export interface Transaction {
  id: string;
  userId: string;
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
  publishedAt: string;
  summary: string;
  content?: string;
  category: 'Mercado' | 'Empresas' | 'Regulação' | 'Global';
  imageUrl: string;
}

export interface MarketIndicator {
  name: string;
  value: string;
  change: number;
  isPositive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  photoUrl?: string;
  plan?: 'Free' | 'Premium';
  planExpiryDate?: string;
  createdAt: string;
  notificationSettings?: {
    enabled: boolean;
    dropThreshold: number;
    gainThreshold: number;
  };
}

export interface Feedback {
  id: string;
  userId: string;
  type: 'suggestion' | 'bug' | 'other';
  message: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}