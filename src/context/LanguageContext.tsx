'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'am';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.trades': 'Trade Log',
    'nav.new_trade': 'New Trade',
    'nav.analytics': 'Analytics',
    'nav.reviews': 'Weekly Reviews',
    'nav.settings': 'Settings & Presets',
    'nav.users': 'Manage Traders',
    'nav.system_analytics': 'System Analytics',
    'nav.global_options': 'Global Options',
    'nav.sign_out': 'Sign Out',
    'nav.pro_trader': 'Pro Trader',
    'nav.admin_console': 'Admin Console',

    // Header & General
    'header.log_trade': 'Log Trade',
    'header.search_placeholder': 'Search trades...',
    'btn.cancel': 'Cancel',
    'btn.save': 'Save',
    'btn.save_trade': 'Save Trade',
    'btn.update_trade': 'Update Trade',
    'btn.record_trade': 'Record Trade',
    'btn.regenerate': 'Regenerate',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.export_csv': 'CSV',
    'btn.export_excel': 'Excel',
    'btn.export_pdf': 'PDF',
    'btn.view_all_trades': 'View All Trades in this Period',
    'btn.reset_all': 'Reset All',
    'btn.reset_defaults': 'Reset Defaults',
    'btn.compare_before_after': 'Compare Before vs After',

    // Fields
    'field.date': 'Trade Date',
    'field.entry_time': 'Entry Time',
    'field.closed_time': 'Closed Time',
    'field.pair': 'Pair / Asset',
    'field.session': 'Trading Session',
    'field.direction': 'Direction',
    'field.strategy_type': 'Strategy Type',
    'field.setup_type': 'Setup Type / Grade',
    'field.account_balance': 'Account Balance',
    'field.entry_tf': 'Entry Timeframe',
    'field.analysis_tf': 'Analysis Timeframes',
    'field.entry_price': 'Entry Price',
    'field.sl': 'Stop Loss (SL)',
    'field.tp': 'Take Profit (TP)',
    'field.lots': 'Position Size (Lots)',
    'field.risk_dollars': 'Risk ($)',
    'field.risk_percent': 'Risk (%)',
    'field.reward_dollars': 'Reward ($)',
    'field.reward_percent': 'Reward (%)',
    'field.rr': 'R:R Ratio',
    'field.net_pnl': 'Net P/L ($)',
    'field.pnl_percent': 'P/L (%)',
    'field.pnl_pips': 'P/L Pips',
    'field.duration': 'Duration (min)',
    'field.result': 'Result',
    'field.execution_quality': 'Execution Quality',
    'field.exit_reason': 'Exit Reason',
    'field.emotion': 'Primary Emotion',
    'field.rating': 'Discipline Rating',
    'field.lesson': 'Key Lesson Learned',
    'field.notes': 'Journal Notes',
    'field.tags': 'Tags',
    'field.market_structure': 'Market Structure',
    'field.htf_bias': 'HTF Direction / Bias',
    'field.sr_zone': 'Support / Resistance Zone',
    'field.entry_location': 'Entry Location',
    'field.liquidity_sweep': 'Liquidity Sweep',
    'field.volume_condition': 'Volume Condition',
    'field.confirmations': 'Confirmations Checklist',

    // KPIs & Sections
    'kpi.net_pnl': 'Net Profit / Loss',
    'kpi.win_rate': 'Win Rate',
    'kpi.profit_factor': 'Profit Factor',
    'kpi.avg_rr': 'Average Risk:Reward',
    'kpi.streaks': 'Streaks & Records',
    'kpi.top_edge': 'Top Edge Alignment',
    'section.basic': 'Section A — Basic Setup, Strategy & Metrics',
    'section.market': 'Section B — Market Structure & HTF Analysis',
    'section.confirmations': 'Section C — Entry Confirmations & Confluence',
    'section.results': 'Section D — Results & Execution Quality',
    'section.psychology': 'Section E — Trader Psychology & Mindset',
    'section.media': 'Section F — Media, Screenshots & Notes',
    'section.summary': 'Auto-Generated Trade Summary',
  },
  am: {
    // Nav
    'nav.dashboard': 'ዳሽቦርድ',
    'nav.trades': 'የንግድ ማስታወሻ',
    'nav.new_trade': 'አዲስ ንግድ መዝግብ',
    'nav.analytics': 'ትንታኔ እና ስታቲስቲክስ',
    'nav.reviews': 'ሳምንታዊ ግምገማ',
    'nav.settings': 'ቅንብሮች እና ማጣሪያዎች',
    'nav.users': 'ነጋዴዎችን አስተዳድር',
    'nav.system_analytics': 'አጠቃላይ ትንታኔ',
    'nav.global_options': 'አለምአቀፍ አማራጮች',
    'nav.sign_out': 'ውጣ',
    'nav.pro_trader': 'ፕሮ ነጋዴ',
    'nav.admin_console': 'አስተዳዳሪ',

    // Header & General
    'header.log_trade': 'ንግድ መዝግብ',
    'header.search_placeholder': 'ንግዶችን ፈልግ...',
    'btn.cancel': 'ይቅር',
    'btn.save': 'አስቀምጥ',
    'btn.save_trade': 'ንግዱን አስቀምጥ',
    'btn.update_trade': 'ንግዱን አሻሽል',
    'btn.record_trade': 'መዝግብ',
    'btn.regenerate': 'እንደገና አመንጭ',
    'btn.edit': 'አርትዕ',
    'btn.delete': 'ሰርዝ',
    'btn.export_csv': 'CSV ላክ',
    'btn.export_excel': 'Excel ላክ',
    'btn.export_pdf': 'PDF ላክ',
    'btn.view_all_trades': 'የዚህን ጊዜ ሁሉንም ንግዶች አሳይ',
    'btn.reset_all': 'ሁሉንም ዳግም አስጀምር',
    'btn.reset_defaults': 'ወደ መጀመሪያው መልስ',
    'btn.compare_before_after': 'ከመግባት በፊት እና በኋላ አነጻጽር',

    // Fields
    'field.date': 'የንግድ ቀን',
    'field.entry_time': 'የመግቢያ ሰዓት',
    'field.closed_time': 'የተዘጋበት ሰዓት',
    'field.pair': 'ጥንድ / ሀብት',
    'field.session': 'የገበያ ክፍለ ጊዜ',
    'field.direction': 'አቅጣጫ (ግዛ / ሽጥ)',
    'field.strategy_type': 'የስልት አይነት (Strategy Type)',
    'field.setup_type': 'የማዋቀር አይነት (Setup Type / Grade)',
    'field.account_balance': 'የሂሳብ ቀሪ (Account Balance)',
    'field.entry_tf': 'የመግቢያ የጊዜ ሰሌዳ (Entry TF)',
    'field.analysis_tf': 'የትነትነ የጊዜ ሰሌዳዎች',
    'field.entry_price': 'የመግቢያ ዋጋ',
    'field.sl': 'የኪሳራ ገደብ (Stop Loss)',
    'field.tp': 'የትርፍ መውሰጃ (Take Profit)',
    'field.lots': 'የሎት መጠን (Lot Size)',
    'field.risk_dollars': 'ስጋት ($)',
    'field.risk_percent': 'ስጋት (%)',
    'field.reward_dollars': 'ሽልማት ($)',
    'field.reward_percent': 'ሽልማት (%)',
    'field.rr': 'የስጋት እና ሽልማት ንፅፅር (R:R)',
    'field.net_pnl': 'የተጣራ ትርፍ/ኪሳራ ($)',
    'field.pnl_percent': 'ትርፍ/ኪሳራ (%)',
    'field.pnl_pips': 'የፒፕስ ብዛት (Pips)',
    'field.duration': 'ቆይታ (ደቂቃዎች)',
    'field.result': 'ውጤት (Win / Loss / BE)',
    'field.execution_quality': 'የአፈጻጸም ጥራት',
    'field.exit_reason': 'የመውጣት ምክንያት',
    'field.emotion': 'ስሜት',
    'field.rating': 'የዲሲፕሊን ደረጃ (1-5)',
    'field.lesson': 'የተማሩት ዋና ትምህርት',
    'field.notes': 'ማስታወሻዎች',
    'field.tags': 'መለያዎች (Tags)',
    'field.market_structure': 'የገበያ መዋቅር',
    'field.htf_bias': 'የከፍተኛ የጊዜ ሰሌዳ አዝማሚያ',
    'field.sr_zone': 'የድጋፍ/መቃወሚያ ዞን',
    'field.entry_location': 'የመግቢያ ቦታ',
    'field.liquidity_sweep': 'የፈሳሽነት መጥረግ (Liquidity Sweep)',
    'field.volume_condition': 'የቮልዩም ሁኔታ',
    'field.confirmations': 'የማረጋገጫ ዝርዝሮች',

    // KPIs & Sections
    'kpi.net_pnl': 'የተጣራ ትርፍ / ኪሳራ',
    'kpi.win_rate': 'የአሸናፊነት መጠን (Win Rate)',
    'kpi.profit_factor': 'የትርፍ ንፅፅር (Profit Factor)',
    'kpi.avg_rr': 'አማካይ የስጋት እና ሽልማት ንፅፅር',
    'kpi.streaks': 'ተከታታይ ውጤቶች',
    'kpi.top_edge': 'ምርጥ ተስማሚ አሰራር',
    'section.basic': 'ክፍል ሀ — መሰረታዊ መረጃ፣ ስልት እና መለኪያዎች',
    'section.market': 'ክፍል ለ — የገበያ መዋቅር እና ትንታኔ',
    'section.confirmations': 'ክፍል ሐ — የመግቢያ ማረጋገጫዎች እና ስልት',
    'section.results': 'ክፍል መ — ውጤት እና የአፈጻጸም ጥራት',
    'section.psychology': 'ክፍል ሠ — የስነ-ልቦና እና ዲሲፕሊን ምርመራ',
    'section.media': 'ክፍል ረ — ምስሎች፣ ቻርቶች እና ማስታወሻዎች',
    'section.summary': 'በራስ-ሰር የተፈጠረ የንግድ ማጠቃለያ',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language | null;
    if (saved && (saved === 'en' || saved === 'am')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'am' : 'en';
    setLanguage(next);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
