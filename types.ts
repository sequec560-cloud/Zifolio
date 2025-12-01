export enum AssetType {
  OT = 'Obrigações do Tesouro',
  BT = 'Bilhetes do Tesouro',
  CORP = 'Obrigações Corporativas',
  STOCK = 'Ações',
}

export interface Asset {
  id: string;
  userId: string; // Linked to User
  name: string; // e.g., "OT-NR-2025" -> Renamed to "Código de Negociação" in UI
  typology: string; // New field: e.g., "UP", "FIS", "Ações"
  type: AssetType; // Internal category for logic/charts
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
  date: string; // Display text e.g. "2 Horas atrás"
  publishedAt: string; // ISO Date YYYY-MM-DD for filtering
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
  photoUrl?: string; // Base64 string for profile picture
  plan?: 'Free' | 'Premium';
  planExpiryDate?: string; // ISO Date
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

export type ViewState = 'login' | 'dashboard' | 'assets' | 'simulator' | 'profile' | 'news' | 'news-detail';