export type UserRole = 'admin' | 'trader';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HybridNumber {
  value: number;
  isManual: boolean;
}

export interface HybridString {
  value: string;
  isManual: boolean;
}

export interface TradePsychology {
  patient: string;
  followedPlan: string;
  fomo: string;
  movedSL: string;
  revenge: string;
  emotion: string;
  rating: number;
}

export interface TradeScreenshots {
  before?: string;
  atEntry?: string;
  after?: string;
  extras: string[];
}

export interface Trade {
  _id: string;
  userId: string;
  tradeNumber: number;
  date: string;
  entryTime: string;
  closedTime?: string;
  exitTime?: string; // backwards compatibility

  // Section A
  pair: string;
  session: string;
  direction: string;
  entryTF: string;
  analysisTF: string[];
  strategyType: string;
  setupType: string;
  accountBalance: number;
  entry: number;
  sl: number;
  tp: number;
  lot: number;
  status?: string;

  // Hybrid auto fields
  risk: HybridNumber;
  riskPercent: HybridNumber;
  reward: HybridNumber;
  rewardPercent: HybridNumber;
  rr: HybridNumber;
  pnl: HybridNumber;
  pnlPercent: HybridNumber;
  pnlPips: HybridNumber;
  duration: HybridNumber;
  sessionAuto: HybridString;
  confirmationScore: HybridNumber;
  statusAuto?: HybridString;

  // Section B
  marketStructure: string;
  htfDirection: string;
  srZone: string;
  entryLocation: string;
  liquidityTaken: string;
  volumeCondition: string;
  biasNotes?: string;

  // Section C
  confirmations: string[];
  followedStrategy: string;

  // Section D
  result: string;
  executionQuality: string;
  exitReason: string;
  exitPrice?: number;

  // Section E
  psychology: TradePsychology;
  lesson?: string;

  // Section F
  screenshots: TradeScreenshots;
  notes?: string;
  tags: string[];

  tradeSummary: {
    text: string;
    isManual: boolean;
  };

  createdAt: string;
  updatedAt: string;
}

export interface DropdownOption {
  _id: string;
  userId?: string;
  field: string;
  value: string;
  isSystem: boolean;
  createdAt: string;
}

export interface FilterPreset {
  _id: string;
  userId: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

export interface AnalyticsKPIs {
  totalTrades: number;
  wins: number;
  losses: number;
  breakEvens: number;
  partials: number;
  winRate: number;
  avgRR: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  expectancy: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgDuration: number;
  bestSession: string;
  bestPair: string;
  bestSetup: string;
  bestDayOfWeek: string;
}
