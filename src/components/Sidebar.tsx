'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMobileNav } from '@/context/MobileNavContext';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  BarChart3,
  CalendarCheck,
  Settings,
  Users,
  LogOut,
  Moon,
  Sun,
  Activity,
  Languages,
  X,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { isOpen, close } = useMobileNav();

  const traderLinks: SidebarLink[] = [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { href: '/trades', labelKey: 'nav.trades', icon: BookOpen },
    { href: '/trades/new', labelKey: 'nav.new_trade', icon: PlusCircle, shortcut: 'N' },
    { href: '/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
    { href: '/reviews', labelKey: 'nav.reviews', icon: CalendarCheck },
    { href: '/settings', labelKey: 'nav.settings', icon: Settings },
  ];

  const adminLinks: SidebarLink[] = [
    { href: '/users', labelKey: 'nav.users', icon: Users },
    { href: '/admin/analytics', labelKey: 'nav.system_analytics', icon: BarChart3 },
    { href: '/admin/settings', labelKey: 'nav.global_options', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : traderLinks;

  const handleNavClick = (href: string) => {
    close();
    router.push(href);
  };

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">TRADEX</h1>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {isAdmin ? t('nav.admin_console') : t('nav.pro_trader')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
              isAdmin
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
            }`}
          >
            {user?.role || 'Guest'}
          </span>

          {isMobile && (
            <button
              type="button"
              onClick={close}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/dashboard' && pathname?.startsWith(link.href) && link.href !== '/trades');

          return (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{t(link.labelKey)}</span>
              </div>
              {link.shortcut && (
                <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-400 rounded">
                  {link.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area with Theme & Language Toggles */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Trader'}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Switch Language / ቋንቋ ቀይር"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'en' ? 'አማ' : 'EN'}</span>
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            close();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.sign_out')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-800 flex-col h-screen shrink-0 transition-colors">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={close}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Menu */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] border-r border-slate-800 z-50 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
