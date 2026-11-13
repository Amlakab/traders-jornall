'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useMobileNav } from '@/context/MobileNavContext';
import { PlusCircle, Sun, Moon, Languages, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isTrader, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toggle: toggleMobileNav } = useMobileNav();

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
    if (pathname?.startsWith('/trades/')) return 'Trade Detail';
    if (pathname === '/analytics') return t('nav.analytics');
    if (pathname === '/reviews') return t('nav.reviews');
    if (pathname === '/settings') return t('nav.settings');
    if (pathname === '/users') return t('nav.users');
    if (pathname === '/admin/analytics') return t('nav.system_analytics');
    if (pathname === '/admin/settings') return t('nav.global_options');
    return 'Trading Journal';
  };

  return (
    <header className="h-16 px-3 sm:px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle Button */}
        <button
          type="button"
          onClick={toggleMobileNav}
          className="p-2 -ml-1 sm:ml-0 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden transition-colors"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
            {getPageTitle()}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate hidden xs:block">
            {isAdmin ? t('nav.admin_console') : `${t('nav.pro_trader')}: ${user?.name || 'Trader'}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          title="Switch Language / ቋንቋ ቀይር"
        >
          <Languages className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span className="hidden sm:inline">{language === 'en' ? 'አማርኛ' : 'English'}</span>
          <span className="sm:hidden">{language === 'en' ? 'አማ' : 'EN'}</span>
        </button>

        {/* Quick Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>

        {isTrader && pathname !== '/trades/new' && (
          <button
            onClick={() => router.push('/trades/new')}
            className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('header.log_trade')}</span>
            <span className="sm:hidden">Log</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-blue-700 rounded border border-blue-500 text-blue-100">
              N
            </kbd>
          </button>
        )}

        <div className="flex items-center gap-2 pl-1.5 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
