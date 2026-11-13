'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { PlusCircle, Sun, Moon, Languages } from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isTrader, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Global Keyboard Shortcuts (N = new trade, S = save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (isTrader) {
          router.push('/trades/new');
        }
      }

      if ((e.key === 's' || e.key === 'S') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('trade-form-save-shortcut'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, isTrader]);

  const getPageTitle = () => {
    if (pathname === '/dashboard') return t('nav.dashboard');
    if (pathname === '/trades') return t('nav.trades');
    if (pathname === '/trades/new') return t('nav.new_trade');
    if (pathname?.startsWith('/trades/')) return 'Trade Detail Drilldown';
    if (pathname === '/analytics') return t('nav.analytics');
    if (pathname === '/reviews') return t('nav.reviews');
    if (pathname === '/settings') return t('nav.settings');
    if (pathname === '/users') return t('nav.users');
    if (pathname === '/admin/analytics') return t('nav.system_analytics');
    if (pathname === '/admin/settings') return t('nav.global_options');
    return 'Trading Journal';
  };

  return (
    <header className="h-16 px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div>
        <h2 className="text-base font-bold text-slate-100">{getPageTitle()}</h2>
        <p className="text-xs text-slate-400">
          {isAdmin ? t('nav.admin_console') : `${t('nav.pro_trader')}: ${user?.name || 'Trader'}`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          title="Switch Language / ቋንቋ ቀይር"
        >
          <Languages className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'en' ? 'አማርኛ' : 'English'}</span>
        </button>

        {/* Quick Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>

        {isTrader && pathname !== '/trades/new' && (
          <button
            onClick={() => router.push('/trades/new')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('header.log_trade')}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-blue-700 rounded border border-blue-500 text-blue-100">
              N
            </kbd>
          </button>
        )}

        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
